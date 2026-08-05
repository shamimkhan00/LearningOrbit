import { generateWithGroq } from "./groq";

type RoadmapProfile = {
  exam: string;
  educationLevel: string;
  dailyStudyHours: number;
  additionalInfo?: string;
};

export async function generateRoadmap(profile: RoadmapProfile) {
  return await generateWithGroq(profile);
}