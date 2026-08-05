import { NextResponse } from "next/server";

import { generateRoadmap } from "@/services/ai/roadmap";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));

    const profile = {
      exam: typeof body?.exam === "string" && body.exam.trim() ? body.exam.trim() : "JEE",
      educationLevel:
        typeof body?.educationLevel === "string" && body.educationLevel.trim()
          ? body.educationLevel.trim()
          : "Class 12",
      dailyStudyHours: Number.isFinite(Number(body?.dailyStudyHours)) ? Number(body.dailyStudyHours) : 6,
      additionalInfo: typeof body?.additionalInfo === "string" ? body.additionalInfo : "",
    };

    const roadmap = await generateRoadmap(profile);

    return NextResponse.json(roadmap);
  } catch (error) {
    console.error("Roadmap generation failed:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Unable to generate roadmap.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}