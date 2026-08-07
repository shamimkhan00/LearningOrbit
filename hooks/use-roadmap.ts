import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { calculateStreak, calculateTodayStudied, calculateXP, calculateXpProgress, type StudySession } from "@/lib/dashboard-utils";
import { buildSubjectsFromTopics, createSubjectId } from "@/lib/roadmap";
import type { RoadmapPayload, RoadmapResponse, RoadmapSubject, RoadmapTopic } from "@/types/roadmap";

const EMPTY_FORM = {
  topic: "",
  chapter: "",
  subject: "",
  difficulty: "easy" as RoadmapTopic["difficulty"],
  weightage: "high" as RoadmapTopic["weightage"],
};

function toDateValue(value: unknown) {
  if (value instanceof Date) {
    return value;
  }

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
  if (!value || typeof value !== "object") {
    return null;
  }

  const session = value as Partial<StudySession> & {
    startTime?: unknown;
    endTime?: unknown;
  };

  const startTime = toDateValue(session.startTime);
  const endTime = toDateValue(session.endTime);

  if (
    typeof session.id !== "string" ||
    typeof session.userId !== "string" ||
    typeof session.topicId !== "string" ||
    !startTime ||
    !endTime ||
    typeof session.duration !== "number" ||
    typeof session.completed !== "boolean"
  ) {
    return null;
  }

  return {
    id: session.id,
    userId: session.userId,
    topicId: session.topicId,
    startTime,
    endTime,
    duration: session.duration,
    completed: session.completed,
  };
}

function loadStudySessionsFromProfile(profileData: Record<string, unknown> | undefined): StudySession[] {
  const rawSessions = profileData?.studySessions;

  if (!Array.isArray(rawSessions)) {
    return [];
  }

  return rawSessions.map(normalizeStudySession).filter((session): session is StudySession => session !== null);
}

function persistStudySessions(userId: string, sessions: StudySession[]) {
  void setDoc(
    doc(db, "users", userId),
    {
      studySessions: sessions,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

function persistRoadmapState(userId: string, nextTopics: RoadmapTopic[], nextSubjects: RoadmapSubject[]) {
  void setDoc(
    doc(db, "roadmaps", userId),
    {
      topics: nextTopics,
      subjects: nextSubjects,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

async function persistRoadmapSnapshot(
  userId: string,
  nextTopics: RoadmapTopic[],
  nextSubjects: RoadmapSubject[],
  nextStudySessions: StudySession[],
  profileData?: Record<string, unknown>
) {
  const dailyStudyHours = Number(profileData?.dailyStudyHours ?? 0);
  const streak = calculateStreak(nextStudySessions);
  const todayStudied = calculateTodayStudied(nextStudySessions);
  const xp = calculateXP(nextTopics, nextStudySessions, dailyStudyHours, streak, todayStudied);
  const { level } = calculateXpProgress(xp);

  const nextProfile = {
    exam: typeof profileData?.exam === "string" && profileData.exam.trim() ? profileData.exam : "JEE",
    educationLevel:
      typeof profileData?.educationLevel === "string" && profileData.educationLevel.trim()
        ? profileData.educationLevel
        : "Class 12",
    examDate: normalizeExamDate(profileData?.examDate),
    dailyStudyHours,
    additionalInfo: typeof profileData?.additionalInfo === "string" ? profileData.additionalInfo : "",
    xp,
    level,
  };

  await Promise.all([
    setDoc(
      doc(db, "roadmaps", userId),
      {
        topics: nextTopics,
        subjects: nextSubjects,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    ),
    setDoc(
      doc(db, "users", userId),
      {
        profile: nextProfile,
        studySessions: nextStudySessions,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    ),
  ]);
}

function normalizeExamDate(value: unknown): Date | null {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "object" && value !== null && "toDate" in value && typeof (value as { toDate?: () => Date }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate();
  }

  if (typeof value === "string") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return null;
}

async function syncUserMetrics(
  userId: string,
  topics: RoadmapTopic[],
  studySessions: StudySession[],
  dailyStudyHours: number,
  profileData?: Record<string, unknown>
) {
  const streak = calculateStreak(studySessions);
  const todayStudied = calculateTodayStudied(studySessions);
  const xp = calculateXP(topics, studySessions, dailyStudyHours, streak, todayStudied);
  const { level } = calculateXpProgress(xp);

  const nextProfile = {
    exam: typeof profileData?.exam === "string" && profileData.exam.trim() ? profileData.exam : "JEE",
    educationLevel: typeof profileData?.educationLevel === "string" && profileData.educationLevel.trim() ? profileData.educationLevel : "Class 12",
    examDate: normalizeExamDate(profileData?.examDate),
    dailyStudyHours: Number(profileData?.dailyStudyHours ?? dailyStudyHours),
    additionalInfo: typeof profileData?.additionalInfo === "string" ? profileData.additionalInfo : "",
    xp,
    level,
  };

  try {
    await setDoc(
      doc(db, "users", userId),
      {
        profile: nextProfile,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch {
    // Ignore persistence failures for now.
  }
}

export function useRoadmap() {
  const [topics, setTopics] = useState<RoadmapTopic[]>([]);
  const [subjects, setSubjects] = useState<RoadmapSubject[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [dailyStudyHours, setDailyStudyHours] = useState(0);
  const [profile, setProfile] = useState({
    exam: "",
    examDate: null as Date | null,
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

  useEffect(() => {
    let ignore = false;
    let unsubscribeAuth = () => {};

    async function loadRoadmap(userId: string) {
      try {
        const roadmapRef = doc(db, "roadmaps", userId);
        const userRef = doc(db, "users", userId);
        const snapshot = await getDoc(roadmapRef);
        const userSnapshot = await getDoc(userRef);
        const profileData = userSnapshot.data()?.profile as Record<string, unknown> | undefined;
        latestProfileData.current = profileData;
        const loadedStudySessions = loadStudySessionsFromProfile(userSnapshot.data() as Record<string, unknown> | undefined);
        let loadedTopics: RoadmapTopic[] = [];

        if (!ignore) {
          setStudySessions(loadedStudySessions);
        }

        if (!ignore && snapshot.exists()) {
          const data = snapshot.data() as RoadmapPayload;
          loadedTopics = data.topics ?? [];
          const loadedSubjects = data.subjects ?? buildSubjectsFromTopics(loadedTopics);
          setTopics(loadedTopics);
          setSubjects(loadedSubjects);
          setActiveFilter("All");
        } else if (!ignore) {
          setTopics([]);
          setSubjects([]);
          setActiveFilter("All");
        }

        if (!ignore) {
          const nextDailyStudyHours = Number(profileData?.dailyStudyHours ?? 0);
          const nextProfile: {
            exam: string;
            examDate: Date | null;
            dailyStudyHours: number;
            xp: number;
            level: number;
          } = {
            exam: typeof profileData?.exam === "string" && profileData.exam.trim() ? profileData.exam : "JEE",
            examDate: normalizeExamDate(profileData?.examDate),
            dailyStudyHours: nextDailyStudyHours,
            xp: Number(profileData?.xp ?? 0),
            level: Number(profileData?.level ?? 1),
          };
          setProfile(nextProfile);
          setDailyStudyHours(nextDailyStudyHours);
          void persistRoadmapSnapshot(
            userId,
            loadedTopics,
            snapshot.exists() ? ((snapshot.data() as RoadmapPayload).subjects ?? buildSubjectsFromTopics(loadedTopics)) : buildSubjectsFromTopics(loadedTopics),
            loadedStudySessions,
            profileData
          ).catch(() => {
            // Ignore persistence failures for now.
          });
        }
      } catch {
        // Ignore load failures for now.
      } finally {
        if (!ignore) {
          setLoadingRoadmap(false);
        }
      }
    }

    unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        if (!ignore) {
          setTopics([]);
          setSubjects([]);
          setStudySessions([]);
          setDailyStudyHours(0);
          setProfile({ exam: "", examDate: null, dailyStudyHours: 0, xp: 0, level: 1 });
          setActiveFilter("All");
          setLoadingRoadmap(false);
        }
        return;
      }

      if (!ignore) {
        setLoadingRoadmap(true);
      }

      void loadRoadmap(user.uid);
    });

    return () => {
      ignore = true;
      unsubscribeAuth();
    };
  }, []);

  function showToast(message: string) {
    setToastMsg(message);
    setToastVisible(true);
    window.setTimeout(() => setToastVisible(false), 2500);
  }

  function updateForm(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function ensureSubjectExists(name: string) {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }

    setSubjects((prev) => {
      if (prev.some((subject) => subject.name.toLowerCase() === trimmed.toLowerCase())) {
        return prev;
      }

      return [...prev, { id: createSubjectId(trimmed), name: trimmed }];
    });
  }

  async function getUserProfileForGeneration() {
    const user = auth.currentUser;
    if (!user) {
      return null;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      const snapshot = await getDoc(userRef);
      const profile = snapshot.data()?.profile;

      if (!profile) {
        return null;
      }

      return {
        exam: typeof profile.exam === "string" && profile.exam.trim() ? profile.exam.trim() : "JEE",
        educationLevel:
          typeof profile.educationLevel === "string" && profile.educationLevel.trim()
            ? profile.educationLevel.trim()
            : "Class 12",
        dailyStudyHours: Number(profile.dailyStudyHours ?? 6),
        additionalInfo: typeof profile.additionalInfo === "string" ? profile.additionalInfo : "",
      };
    } catch {
      return null;
    }
  }

  async function saveRoadmapToFirebase(
    nextTopics: RoadmapTopic[],
    nextSubjects: RoadmapSubject[]
  ) {
    try {
      console.log("Starting roadmap save...");

      const user = auth.currentUser;

      if (!user) {
        console.error("No authenticated user found.");
        showToast("Please sign in first");
        return;
      }

      console.log("User ID:", user.uid);

      const payload: RoadmapPayload = {
        topics: nextTopics,
        subjects: nextSubjects,
        metadata: {
          exam: "",
          generatedAt: new Date().toISOString(),
          version: 1,
        },
      };

      console.log("Payload:", payload);

      await setDoc(
        doc(db, "roadmaps", user.uid),
        payload,
        { merge: true }
      );

      console.log("âœ… Roadmap saved successfully.");
      showToast("Roadmap saved successfully!");
    } catch (error) {
      console.error("âŒ Failed to save roadmap:", error);

      if (error instanceof Error) {
        console.error("Error message:", error.message);
      }

      showToast("Failed to save roadmap.");
    }
  }

  function toggleComplete(id: string) {
    const user = auth.currentUser;
    if (!user) {
      return;
    }

    const targetTopic = topics.find((topic) => topic.id === id);

    if (!targetTopic) {
      return;
    }

    const nextCompleted = !targetTopic.completed;
    const nextTopics = topics.map((topic) => (topic.id === id ? { ...topic, completed: nextCompleted } : topic));
    const nextStudySessions = nextCompleted
      ? [
          ...studySessions.filter((session) => session.topicId !== id),
          {
            id: `${id}-${Date.now()}`,
            userId: user.uid,
            topicId: id,
            startTime: new Date(),
            endTime: new Date(),
            duration: 0,
            completed: true,
          },
      ]
      : studySessions.filter((session) => session.topicId !== id);

    setTopics(nextTopics);
    setStudySessions(nextStudySessions);
    void persistRoadmapSnapshot(user.uid, nextTopics, subjects, nextStudySessions, latestProfileData.current).catch(() => {
      // Ignore persistence failures for now.
    });
  }

  function openAdd() {
    setForm({ ...EMPTY_FORM });
    setEditId(null);
    setModalMode("add");
    setModalOpen(true);
  }

  function openAddSubject() {
    setSubjectForm("");
    setModalMode("subject");
    setModalOpen(true);
  }

  function openEdit(topic: RoadmapTopic) {
    setForm({
      topic: topic.topic,
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
    if (!user) {
      showToast("Please sign in first");
      return;
    }

    if (modalMode === "subject") {
      const trimmedSubject = subjectForm.trim();
      if (!trimmedSubject) {
        return;
      }

      const nextSubjects = subjects.some((subject) => subject.name.toLowerCase() === trimmedSubject.toLowerCase())
        ? subjects
        : [...subjects, { id: createSubjectId(trimmedSubject), name: trimmedSubject }];

      setSubjects(nextSubjects);
      setForm((prev) => ({ ...prev, subject: trimmedSubject }));
      showToast("Subject added");
      setModalOpen(false);

      void persistRoadmapSnapshot(user.uid, topics, nextSubjects, studySessions, latestProfileData.current).catch(() => {
        showToast("Failed to save subject.");
      });
      return;
    }

    const trimmedTopic = form.topic.trim();
    const trimmedChapter = form.chapter.trim();
    const trimmedSubject = form.subject.trim();
    if (!trimmedTopic || !trimmedChapter || !trimmedSubject) {
      return;
    }

    const nextSubjects = subjects.some((subject) => subject.name.toLowerCase() === trimmedSubject.toLowerCase())
      ? subjects
      : [...subjects, { id: createSubjectId(trimmedSubject), name: trimmedSubject }];

    if (modalMode === "edit" && editId) {
      const nextTopics = topics.map((topic) =>
        topic.id === editId
          ? {
            ...topic,
            topic: trimmedTopic,
            chapter: trimmedChapter,
            subject: trimmedSubject,
            difficulty: form.difficulty as RoadmapTopic["difficulty"],
            weightage: form.weightage as RoadmapTopic["weightage"],
          }
          : topic
      );

      setTopics(nextTopics);
      setSubjects(nextSubjects);
      showToast("Topic updated");
      setModalOpen(false);

      void persistRoadmapSnapshot(user.uid, nextTopics, nextSubjects, studySessions, latestProfileData.current).catch(() => {
        showToast("Failed to save topic.");
      });
      return;
    }

    const newId = `${trimmedTopic.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;
    const newTopic: RoadmapTopic = {
      id: newId,
      subject: trimmedSubject,
      chapter: trimmedChapter,
      topic: trimmedTopic,
      difficulty: form.difficulty as RoadmapTopic["difficulty"],
      weightage: form.weightage as RoadmapTopic["weightage"],
      completed: false,
    };

    const nextTopics = [...topics, newTopic];

    setTopics(nextTopics);
    setSubjects(nextSubjects);
    showToast("Topic added");
    setModalOpen(false);

    void persistRoadmapSnapshot(user.uid, nextTopics, nextSubjects, studySessions, latestProfileData.current).catch(() => {
      showToast("Failed to save topic.");
    });
  }

  function deleteTopic(id: string) {
    const user = auth.currentUser;
    if (!user) {
      showToast("Please sign in first");
      return;
    }

    if (!window.confirm("Delete this topic?")) {
      return;
    }

    const nextTopics = topics.filter((topic) => topic.id !== id);
    const nextStudySessions = studySessions.filter((session) => session.topicId !== id);

    setTopics(nextTopics);
    setStudySessions(nextStudySessions);
    void persistRoadmapSnapshot(user.uid, nextTopics, subjects, nextStudySessions, latestProfileData.current).catch(() => {
      showToast("Failed to delete topic.");
    });
    showToast("Topic deleted");
  }

  function deleteSubject(subjectId: string) {
    const user = auth.currentUser;
    if (!user) {
      showToast("Please sign in first");
      return;
    }

    const subject = subjects.find((item) => item.id === subjectId);
    if (!subject) {
      return;
    }

    if (!window.confirm(`Delete subject "${subject.name}" and its topics?`)) {
      return;
    }

    const nextSubjects = subjects.filter((item) => item.id !== subjectId);
    const removedTopicIds = new Set(
      topics.filter((topic) => topic.subject === subject.name).map((topic) => topic.id)
    );
    const nextTopics = topics.filter((topic) => topic.subject !== subject.name);
    const nextStudySessions = studySessions.filter((session) => !removedTopicIds.has(session.topicId));

    setSubjects(nextSubjects);
    setTopics(nextTopics);
    setStudySessions(nextStudySessions);
    void persistRoadmapSnapshot(user.uid, nextTopics, nextSubjects, nextStudySessions, latestProfileData.current).catch(() => {
      showToast("Failed to delete subject.");
    });
    showToast("Subject deleted");
  }

  function toggleSection(subject: string) {
    setCollapsedSubjects((prev) => {
      const next = new Set(prev);
      if (next.has(subject)) {
        next.delete(subject);
      } else {
        next.add(subject);
      }
      return next;
    });
  }

  async function saveToFirestore() {
    try {
      setSaving(true);
      await saveRoadmapToFirebase(topics, subjects);
      showToast("Saved to Firestore");
    } catch {
      showToast("Save failed â€” try again");
    } finally {
      setSaving(false);
    }
  }

  async function generateRoadmapFromApi() {
    try {
      setGenerating(true);
      const profile = await getUserProfileForGeneration();

      const response = await fetch("/api/roadmap/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile ?? {}),
      });

      const data = (await response.json()) as RoadmapResponse;

      if (!response.ok || !Array.isArray(data.roadmap)) {
        throw new Error("Unable to generate roadmap");
      }

      const generatedTopics = data.roadmap.map((topic) => ({
        ...topic,
        completed: false,
      }));

      const generatedSubjects = buildSubjectsFromTopics(generatedTopics);
      setTopics(generatedTopics);
      setSubjects(generatedSubjects);
      setActiveFilter("All");
      if (auth.currentUser) {
        await persistRoadmapSnapshot(
          auth.currentUser.uid,
          generatedTopics,
          generatedSubjects,
          studySessions,
          latestProfileData.current
        );
      }
      showToast("Roadmap generated and saved");
    } catch {
      showToast("Generation failed â€” try again");
    } finally {
      setGenerating(false);
    }
  }

  return {
    topics,
    subjects,
    studySessions,
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
    updateForm,
  };
}
