import { useEffect, useState } from "react";
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

function getStudySessionStorageKey(userId: string) {
  return `learningorbit:study-sessions:v2:${userId}`;
}

function loadStoredStudySessions(userId: string): StudySession[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(getStudySessionStorageKey(userId));
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored) as StudySession[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistStudySessions(userId: string, sessions: StudySession[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(getStudySessionStorageKey(userId), JSON.stringify(sessions));
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
        const loadedStudySessions = loadStoredStudySessions(userId);
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
          void syncUserMetrics(userId, loadedTopics, loadedStudySessions, nextDailyStudyHours, profileData);
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

    setTopics((prev) => {
      const targetTopic = prev.find((topic) => topic.id === id);

      if (!targetTopic) {
        return prev;
      }

      const nextCompleted = !targetTopic.completed;

      if (user && nextCompleted) {
        const session: StudySession = {
          id: `${id}-${Date.now()}`,
          userId: user.uid,
          topicId: id,
          startTime: new Date(),
          endTime: new Date(),
          duration: 0,
          completed: true,
        };

        setStudySessions((prevSessions) => {
          const nextSessions = [...prevSessions, session];
          persistStudySessions(user.uid, nextSessions);
          return nextSessions;
        });
      }

      return prev.map((topic) => (topic.id === id ? { ...topic, completed: nextCompleted } : topic));
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

  function saveModal() {
    if (modalMode === "subject") {
      const trimmedSubject = subjectForm.trim();
      if (!trimmedSubject) {
        return;
      }

      ensureSubjectExists(trimmedSubject);
      setForm((prev) => ({ ...prev, subject: trimmedSubject }));
      showToast("Subject added");
      setModalOpen(false);
      return;
    }

    const trimmedTopic = form.topic.trim();
    const trimmedChapter = form.chapter.trim();
    if (!trimmedTopic || !trimmedChapter) {
      return;
    }

    if (modalMode === "edit" && editId) {
      setTopics((prev) => {
        const nextTopics = prev.map((topic) =>
          topic.id === editId
            ? {
              ...topic,
              topic: trimmedTopic,
              chapter: trimmedChapter,
              subject: form.subject,
              difficulty: form.difficulty as RoadmapTopic["difficulty"],
              weightage: form.weightage as RoadmapTopic["weightage"],
            }
            : topic
        );

        ensureSubjectExists(form.subject);
        return nextTopics;
      });
      showToast("Topic updated");
    } else {
      const newId = `${trimmedTopic.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;
      const newTopic: RoadmapTopic = {
        id: newId,
        subject: form.subject,
        chapter: trimmedChapter,
        topic: trimmedTopic,
        difficulty: form.difficulty as RoadmapTopic["difficulty"],
        weightage: form.weightage as RoadmapTopic["weightage"],
        completed: false,
      };

      setTopics((prev) => {
        const nextTopics = [...prev, newTopic];
        ensureSubjectExists(form.subject);
        return nextTopics;
      });
      showToast("Topic added");
    }

    setModalOpen(false);
  }

  function deleteTopic(id: string) {
    if (!window.confirm("Delete this topic?")) {
      return;
    }

    setTopics((prev) => prev.filter((topic) => topic.id !== id));
    showToast("Topic deleted");
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
      await saveRoadmapToFirebase(generatedTopics, generatedSubjects);
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
    toggleSection,
    saveToFirestore,
    generateRoadmapFromApi,
    updateForm,
  };
}
