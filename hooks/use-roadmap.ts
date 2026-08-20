import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { calculateStreak, calculateStudyTarget, calculateTodayStudied, calculateXP, calculateXpProgress, type StudySession } from "@/lib/dashboard-utils";
import { buildSubjectsFromTopics, createSubjectId } from "@/lib/roadmap";
import type { RoadmapPayload, RoadmapResponse, RoadmapSubject, RoadmapTopic, StudyPlanDay } from "@/types/roadmap";

const EMPTY_FORM = {
  topics: [""],
  chapter: "",
  subject: "",
  difficulty: "easy" as RoadmapTopic["difficulty"],
  weightage: "high" as RoadmapTopic["weightage"],
};

function toDateValue(value: unknown) {
  if (value instanceof Date) return value;
  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  if (value && typeof value === "object" && "toDate" in value) {
    const maybeDate = value as { toDate?: () => Date };
    if (typeof maybeDate.toDate === "function") {
      const parsed = maybeDate.toDate();
      return parsed instanceof Date ? parsed : null;
    }
  }
  return null;
}

function normalizeStudySession(value: unknown): StudySession | null {
  if (!value || typeof value !== "object") return null;
  const session = value as Partial<StudySession> & { startTime?: unknown; endTime?: unknown };
  const startTime = toDateValue(session.startTime);
  const endTime = toDateValue(session.endTime);
  if (
    typeof session.id !== "string" ||
    typeof session.userId !== "string" ||
    typeof session.topicId !== "string" ||
    !startTime || !endTime ||
    typeof session.duration !== "number" ||
    typeof session.completed !== "boolean"
  ) return null;
  return { id: session.id, userId: session.userId, topicId: session.topicId, startTime, endTime, duration: session.duration, completed: session.completed };
}

function loadStudySessionsFromProfile(profileData: Record<string, unknown> | undefined): StudySession[] {
  const rawSessions = profileData?.studySessions;
  if (!Array.isArray(rawSessions)) return [];
  return rawSessions.map(normalizeStudySession).filter((s): s is StudySession => s !== null);
}

function normalizeExamDate(value: unknown): Date | null {
  if (value instanceof Date) return value;
  if (typeof value === "object" && value !== null && "toDate" in value && typeof (value as { toDate?: () => Date }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate();
  }
  if (typeof value === "string") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return null;
}

function getStoredMinimumStudyHours(profileData?: Record<string, unknown>) {
  const rawValue = Number(profileData?.minimumStudyHours ?? profileData?.dailyStudyHours ?? 0);
  return Number.isFinite(rawValue) ? Math.max(0, rawValue) : 0;
}

async function persistRoadmapSnapshot(
  userId: string,
  nextTopics: RoadmapTopic[],
  nextSubjects: RoadmapSubject[],
  nextStudyPlan: StudyPlanDay[],
  nextStudySessions: StudySession[],
  profileData?: Record<string, unknown>
) {
  const examDate = normalizeExamDate(profileData?.examDate);
  const minimumStudyHours = getStoredMinimumStudyHours(profileData);
  const studyTarget = calculateStudyTarget(nextTopics, examDate, minimumStudyHours);
  const dailyStudyHours = studyTarget.totalStudyHours;
  const streak = calculateStreak(nextStudySessions);
  const todayStudied = calculateTodayStudied(nextStudySessions);
  const xp = calculateXP(nextTopics, nextStudySessions, dailyStudyHours, streak, todayStudied);
  const { level } = calculateXpProgress(xp);

  const nextProfile = {
    exam: typeof profileData?.exam === "string" && profileData.exam.trim() ? profileData.exam : "JEE",
    educationLevel: typeof profileData?.educationLevel === "string" && profileData.educationLevel.trim() ? profileData.educationLevel : "Class 12",
    examDate,
    preparationLevel:
      profileData?.preparationLevel === "easy" ||
      profileData?.preparationLevel === "medium" ||
      profileData?.preparationLevel === "hard"
        ? profileData.preparationLevel
        : "medium",
    minimumStudyHours,
    dailyStudyHours,
    additionalInfo: typeof profileData?.additionalInfo === "string" ? profileData.additionalInfo : "",
    xp,
    level,
  };

  await Promise.all([
    setDoc(doc(db, "roadmaps", userId), { topics: nextTopics, subjects: nextSubjects, studyPlan: nextStudyPlan, updatedAt: serverTimestamp() }, { merge: true }),
    setDoc(doc(db, "users", userId), { profile: nextProfile, studySessions: nextStudySessions, updatedAt: serverTimestamp() }, { merge: true }),
  ]);
}

export function useRoadmap() {
  const [topics, setTopics] = useState<RoadmapTopic[]>([]);
  const [subjects, setSubjects] = useState<RoadmapSubject[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [studyPlan, setStudyPlan] = useState<StudyPlanDay[]>([]);
  const [dailyStudyHours, setDailyStudyHours] = useState(0);
  const [profile, setProfile] = useState({
    exam: "",
    examDate: null as Date | null,
    preparationLevel: "medium" as "easy" | "medium" | "hard",
    minimumStudyHours: 0,
    dailyStudyHours: 0,
    xp: 0,
    level: 1,
  });
  const [activeFilter, setActiveFilter] = useState("All");
  const [collapsedSubjects, setCollapsedSubjects] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [loadingRoadmap, setLoadingRoadmap] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "subject">("add");
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [subjectForm, setSubjectForm] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const latestProfileData = useRef<Record<string, unknown> | undefined>(undefined);
  const latestStudyPlanData = useRef<StudyPlanDay[]>([]);

  useEffect(() => {
    let ignore = false;

    async function loadRoadmap(userId: string) {
      try {
        const [roadmapSnap, userSnap] = await Promise.all([
          getDoc(doc(db, "roadmaps", userId)),
          getDoc(doc(db, "users", userId)),
        ]);

        const profileData = userSnap.data()?.profile as Record<string, unknown> | undefined;
        latestProfileData.current = profileData;
        const loadedStudySessions = loadStudySessionsFromProfile(userSnap.data() as Record<string, unknown> | undefined);
        let loadedTopics: RoadmapTopic[] = [];
        let loadedSubjects: RoadmapSubject[] = [];

        if (!ignore) setStudySessions(loadedStudySessions);

        if (!ignore && roadmapSnap.exists()) {
          const data = roadmapSnap.data() as RoadmapPayload;
          loadedTopics = data.topics ?? [];
          loadedSubjects = data.subjects ?? buildSubjectsFromTopics(loadedTopics);
          latestStudyPlanData.current = data.studyPlan ?? [];
          setTopics(loadedTopics);
          setSubjects(loadedSubjects);
          setStudyPlan(data.studyPlan ?? []);
          setActiveFilter("All");
        } else if (!ignore) {
          setTopics([]);
          setSubjects([]);
          setStudyPlan([]);
          setActiveFilter("All");
        }

        if (!ignore) {
          const examDate = normalizeExamDate(profileData?.examDate);
          const minimumStudyHours = getStoredMinimumStudyHours(profileData);
          const studyTarget = calculateStudyTarget(loadedTopics, examDate, minimumStudyHours);
          const nextDailyStudyHours = studyTarget.totalStudyHours;

          setProfile({
            exam: typeof profileData?.exam === "string" && profileData.exam.trim() ? profileData.exam : "JEE",
            examDate,
            preparationLevel:
              profileData?.preparationLevel === "easy" ||
              profileData?.preparationLevel === "medium" ||
              profileData?.preparationLevel === "hard"
                ? profileData.preparationLevel
                : "medium",
            minimumStudyHours,
            dailyStudyHours: nextDailyStudyHours,
            xp: Number(profileData?.xp ?? 0),
            level: Number(profileData?.level ?? 1),
          });
          setDailyStudyHours(nextDailyStudyHours);

          void persistRoadmapSnapshot(userId, loadedTopics, loadedSubjects, latestStudyPlanData.current, loadedStudySessions, profileData).catch(() => {});
        }
      } catch {
        // Ignore.
      } finally {
        if (!ignore) setLoadingRoadmap(false);
      }
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        if (!ignore) {
          setTopics([]); setSubjects([]); setStudySessions([]);
          setStudyPlan([]);
          setDailyStudyHours(0);
          setProfile({ exam: "", examDate: null, preparationLevel: "medium", minimumStudyHours: 0, dailyStudyHours: 0, xp: 0, level: 1 });
          setActiveFilter("All"); setLoadingRoadmap(false);
        }
        return;
      }
      if (!ignore) setLoadingRoadmap(true);
      void loadRoadmap(user.uid);
    });

    return () => { ignore = true; unsubscribeAuth(); };
  }, []);

  function showToast(message: string) {
    setToastMsg(message);
    setToastVisible(true);
    window.setTimeout(() => setToastVisible(false), 2500);
  }

  function handleFormChange(field: keyof typeof EMPTY_FORM, value: string | string[]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function ensureSubjectExists(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSubjects((prev) => {
      if (prev.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) return prev;
      return [...prev, { id: createSubjectId(trimmed), name: trimmed }];
    });
  }

  async function getUserProfileForGeneration() {
    const user = auth.currentUser;
    if (!user) return null;
    try {
      const snap = await getDoc(doc(db, "users", user.uid));
      const p = snap.data()?.profile;
      if (!p) return null;
      return {
        exam: typeof p.exam === "string" && p.exam.trim() ? p.exam.trim() : "JEE",
        educationLevel: typeof p.educationLevel === "string" && p.educationLevel.trim() ? p.educationLevel.trim() : "Class 12",
        examDate: normalizeExamDate(p.examDate)?.toISOString() ?? "",
        preparationLevel:
          p.preparationLevel === "easy" || p.preparationLevel === "medium" || p.preparationLevel === "hard"
            ? p.preparationLevel
            : "medium",
        minimumStudyHours: Number(p.minimumStudyHours ?? p.dailyStudyHours ?? 0),
        additionalInfo: typeof p.additionalInfo === "string" ? p.additionalInfo : "",
      };
    } catch {
      return null;
    }
  }

  async function saveRoadmapToFirebase(nextTopics: RoadmapTopic[], nextSubjects: RoadmapSubject[]) {
    try {
      const user = auth.currentUser;
      if (!user) { showToast("Please sign in first"); return; }
      const payload: RoadmapPayload = {
        topics: nextTopics,
        subjects: nextSubjects,
        studyPlan,
        metadata: { exam: "", generatedAt: new Date().toISOString(), version: 2 },
      };
      await setDoc(doc(db, "roadmaps", user.uid), payload, { merge: true });
      showToast("Roadmap saved successfully!");
    } catch {
      showToast("Failed to save roadmap.");
    }
  }

  function toggleComplete(id: string) {
    const user = auth.currentUser;
    if (!user) return;

    const targetTopic = topics.find((t) => t.id === id);
    if (!targetTopic) return;

    const nextCompleted = !targetTopic.completed;
    const nextTopics = topics.map((t) => (t.id === id ? { ...t, completed: nextCompleted } : t));
    const nextStudySessions = nextCompleted
      ? [
          ...studySessions.filter((s) => s.topicId !== id),
          {
            id: `${id}-${Date.now()}`,
            userId: user.uid,
            topicId: id,
            startTime: new Date(),
            endTime: new Date(),
            duration: targetTopic.estimatedMinutes ?? 0,
            completed: true,
          },
        ]
      : studySessions.filter((s) => s.topicId !== id);

    setTopics(nextTopics);
    setStudySessions(nextStudySessions);

    // Recalculate the target from AI minutes, exam date, and the user's minimum.
    const examDate = normalizeExamDate(latestProfileData.current?.examDate);
    const minimumStudyHours = getStoredMinimumStudyHours(latestProfileData.current);
    const nextStudyTarget = calculateStudyTarget(nextTopics, examDate, minimumStudyHours);
    const nextDailyStudyHours = nextStudyTarget.totalStudyHours;
    setDailyStudyHours(nextDailyStudyHours);
    setProfile((prev) => ({ ...prev, dailyStudyHours: nextDailyStudyHours }));

    void persistRoadmapSnapshot(user.uid, nextTopics, subjects, latestStudyPlanData.current, nextStudySessions, latestProfileData.current).catch(() => {});
  }

  function openAdd() { setForm({ ...EMPTY_FORM }); setEditId(null); setModalMode("add"); setModalOpen(true); }
  function openAddSubject() { setSubjectForm(""); setModalMode("subject"); setModalOpen(true); }
  function openEdit(topic: RoadmapTopic) {
    setForm({
      topics: [topic.topic],
      chapter: topic.chapter,
      subject: topic.subject,
      difficulty: topic.difficulty,
      weightage: topic.weightage,
    });
    setEditId(topic.id);
    setModalMode("edit");
    setModalOpen(true);
  }

  async function saveModal() {
    const user = auth.currentUser;
    if (!user) { showToast("Please sign in first"); return; }

    if (modalMode === "subject") {
      const trimmed = subjectForm.trim();
      if (!trimmed) return;
      const nextSubjects = subjects.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())
        ? subjects
        : [...subjects, { id: createSubjectId(trimmed), name: trimmed }];
      setSubjects(nextSubjects);
      setForm((prev) => ({ ...prev, subject: trimmed }));
      showToast("Subject added");
      setModalOpen(false);
      void persistRoadmapSnapshot(user.uid, topics, nextSubjects, latestStudyPlanData.current, studySessions, latestProfileData.current).catch(() => { showToast("Failed to save subject."); });
      return;
    }

    const trimmedTopics = form.topics.map((topic) => topic.trim()).filter(Boolean);
    const trimmedChapter = form.chapter.trim();
    const trimmedSubject = form.subject.trim();
    if (!trimmedChapter || !trimmedSubject || trimmedTopics.length === 0) return;

    const nextSubjects = subjects.some((s) => s.name.toLowerCase() === trimmedSubject.toLowerCase())
      ? subjects
      : [...subjects, { id: createSubjectId(trimmedSubject), name: trimmedSubject }];

    if (modalMode === "edit" && editId) {
      const trimmedTopic = trimmedTopics[0];
      if (!trimmedTopic) return;
      const nextTopics = topics.map((t) =>
        t.id === editId
          ? { ...t, topic: trimmedTopic, chapter: trimmedChapter, subject: trimmedSubject, difficulty: form.difficulty as RoadmapTopic["difficulty"], weightage: form.weightage as RoadmapTopic["weightage"] }
          : t
      );
      setTopics(nextTopics);
      setSubjects(nextSubjects);
      showToast("Topic updated");
      setModalOpen(false);
      void persistRoadmapSnapshot(user.uid, nextTopics, nextSubjects, latestStudyPlanData.current, studySessions, latestProfileData.current).catch(() => { showToast("Failed to save topic."); });
      return;
    }

    const newTopics: RoadmapTopic[] = trimmedTopics.map((topic) => ({
      id: crypto.randomUUID(),
      subject: trimmedSubject,
      chapter: trimmedChapter,
      topic,
      difficulty: form.difficulty as RoadmapTopic["difficulty"],
      weightage: form.weightage as RoadmapTopic["weightage"],
      estimatedMinutes: 60,
      completed: false,
    }));
    const nextTopics = [...topics, ...newTopics];
    setTopics(nextTopics);
    setSubjects(nextSubjects);
    showToast("Topic added");
    setModalOpen(false);
    void persistRoadmapSnapshot(user.uid, nextTopics, nextSubjects, latestStudyPlanData.current, studySessions, latestProfileData.current).catch(() => { showToast("Failed to save topic."); });
  }

  function deleteTopic(id: string) {
    const user = auth.currentUser;
    if (!user) { showToast("Please sign in first"); return; }
    if (!window.confirm("Delete this topic?")) return;
    const nextTopics = topics.filter((t) => t.id !== id);
    const nextStudySessions = studySessions.filter((s) => s.topicId !== id);
    setTopics(nextTopics);
    setStudySessions(nextStudySessions);
    void persistRoadmapSnapshot(user.uid, nextTopics, subjects, latestStudyPlanData.current, nextStudySessions, latestProfileData.current).catch(() => { showToast("Failed to delete topic."); });
    showToast("Topic deleted");
  }

  function deleteSubject(subjectId: string) {
    const user = auth.currentUser;
    if (!user) { showToast("Please sign in first"); return; }
    const subject = subjects.find((s) => s.id === subjectId);
    if (!subject) return;
    if (!window.confirm(`Delete subject "${subject.name}" and its topics?`)) return;
    const nextSubjects = subjects.filter((s) => s.id !== subjectId);
    const removedTopicIds = new Set(topics.filter((t) => t.subject === subject.name).map((t) => t.id));
    const nextTopics = topics.filter((t) => t.subject !== subject.name);
    const nextStudySessions = studySessions.filter((s) => !removedTopicIds.has(s.topicId));
    setSubjects(nextSubjects);
    setTopics(nextTopics);
    setStudySessions(nextStudySessions);
    void persistRoadmapSnapshot(user.uid, nextTopics, nextSubjects, latestStudyPlanData.current, nextStudySessions, latestProfileData.current).catch(() => { showToast("Failed to delete subject."); });
    showToast("Subject deleted");
  }

  function toggleSection(subject: string) {
    setCollapsedSubjects((prev) => {
      const next = new Set(prev);
      if (next.has(subject)) next.delete(subject); else next.add(subject);
      return next;
    });
  }

  async function saveToFirestore() {
    try {
      setSaving(true);
      await saveRoadmapToFirebase(topics, subjects);
      showToast("Saved to Firestore");
    } catch {
      showToast("Save failed — try again");
    } finally {
      setSaving(false);
    }
  }

  async function generateRoadmapFromApi() {
    try {
      setGenerating(true);
      const profileForApi = await getUserProfileForGeneration();

      const response = await fetch("/api/roadmap/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForApi ?? {}),
      });

      const data = (await response.json()) as RoadmapResponse;

      if (!response.ok || !Array.isArray(data.roadmap)) {
        throw new Error("Unable to generate roadmap");
      }

      const generatedTopics = data.roadmap.map((t) => ({ ...t, completed: false }));
      const generatedSubjects = buildSubjectsFromTopics(generatedTopics);
      const generatedStudyPlan = Array.isArray(data.studyPlan) ? data.studyPlan : [];

      // Calculate the daily target from AI-returned estimated minutes and the user's minimum.
      const examDate = normalizeExamDate(latestProfileData.current?.examDate);
      const minimumStudyHours = getStoredMinimumStudyHours(latestProfileData.current);
      const nextStudyTarget = calculateStudyTarget(generatedTopics, examDate, minimumStudyHours);
      const nextDailyStudyHours = nextStudyTarget.totalStudyHours;

      setTopics(generatedTopics);
      setSubjects(generatedSubjects);
      setStudyPlan(generatedStudyPlan);
      latestStudyPlanData.current = generatedStudyPlan;
      setDailyStudyHours(nextDailyStudyHours);
      setProfile((prev) => ({ ...prev, dailyStudyHours: nextDailyStudyHours }));
      setActiveFilter("All");

      if (auth.currentUser) {
        await persistRoadmapSnapshot(
          auth.currentUser.uid,
          generatedTopics,
          generatedSubjects,
          generatedStudyPlan,
          studySessions,
          latestProfileData.current
        );
      }

      showToast("Roadmap generated and saved");
    } catch {
      showToast("Generation failed — try again");
    } finally {
      setGenerating(false);
    }
  }

  return {
    topics,
    subjects,
    studySessions,
    studyPlan,
    dailyStudyHours,
    profile,
    setSubjects,
    activeFilter,
    setActiveFilter,
    collapsedSubjects,
    saving,
    loadingRoadmap,
    generating,
    modalOpen,
    modalMode,
    editId,
    form,
    subjectForm,
    toastMsg,
    toastVisible,
    setSubjectForm,
    setModalOpen,
    toggleComplete,
    openAdd,
    openAddSubject,
    openEdit,
    saveModal,
    deleteTopic,
    deleteSubject,
    toggleSection,
    generateRoadmapFromApi,
    handleFormChange,
  };
}
