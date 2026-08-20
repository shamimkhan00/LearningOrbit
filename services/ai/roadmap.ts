import { generateWithGroq } from "./groq";

type RoadmapProfile = {
  exam: string;
  educationLevel: string;
  examDate: string;
  preparationLevel?: "easy" | "medium" | "hard";
  minimumStudyHours?: number;
  additionalInfo?: string;
};

export async function generateRoadmap(profile: RoadmapProfile) {
  return await generateWithGroq(profile);
}
