import type { RoadmapSubject, RoadmapTopic } from "@/types/roadmap";

export function createSubjectId(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || `subject-${Date.now()}`;
}

export function buildSubjectsFromTopics(topics: RoadmapTopic[]): RoadmapSubject[] {
  const uniqueSubjects = Array.from(new Set(topics.map((topic) => topic.subject)));

  return uniqueSubjects.map((name) => ({
    id: createSubjectId(name),
    name,
  }));
}

export function getProgressPercentage(completedCount: number, totalCount: number) {
  if (!totalCount) {
    return 0;
  }

  return Math.round((completedCount / totalCount) * 100);
}
