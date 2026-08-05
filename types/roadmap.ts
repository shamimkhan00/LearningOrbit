export interface RoadmapTopic {
  id: string;
  subject: string;
  chapter: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  weightage: "low" | "medium" | "high";
  completed: boolean;
}

export interface RoadmapSubject {
  id: string;
  name: string;
}

export interface RoadmapResponse {
  metadata?: {
    exam?: string;
    generatedAt?: string;
    version?: number;
  };
  roadmap?: RoadmapTopic[];
}

export interface RoadmapPayload {
  topics: RoadmapTopic[];
  subjects: RoadmapSubject[];
  metadata?: {
    exam?: string;
    generatedAt?: string;
    version?: number;
  };
}