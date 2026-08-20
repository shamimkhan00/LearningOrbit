export interface RoadmapTopic {
  id: string;
  subject: string;
  chapter: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  weightage: "low" | "medium" | "high";
  estimatedMinutes?: number;
  completed: boolean;
}

export interface RoadmapSubject {
  id: string;
  name: string;
}

export interface StudyPlanTask {
  id: string;
  subject: string;
  chapter: string;
  topic: string;
  taskType: "learn" | "revision" | "weekly_test" | "pyq" | "final_revision" | "buffer";
  estimatedMinutes: number;
  note?: string;
}

export interface StudyPlanDay {
  date: string;
  label: string;
  focus: string;
  dayType: "study" | "revision" | "weekly_test" | "pyq" | "final_revision" | "buffer";
  studyHours: number;
  tasks: StudyPlanTask[];
}
export interface RoadmapResponse {
  metadata?: {
    exam?: string;
    generatedAt?: string;
    version?: number;
  };
  roadmap?: RoadmapTopic[];
  studyPlan?: StudyPlanDay[];
}

export interface RoadmapPayload {
  topics: RoadmapTopic[];
  subjects: RoadmapSubject[];
  studyPlan?: StudyPlanDay[];
  metadata?: {
    exam?: string;
    generatedAt?: string;
    version?: number;
  };
}
