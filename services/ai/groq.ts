import Groq from "groq-sdk";

type RoadmapProfile = {
  exam: string;
  educationLevel: string;
  examDate: string;
  preparationLevel?: "easy" | "medium" | "hard";
  minimumStudyHours?: number;
  additionalInfo?: string;
};

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY ?? "",
});

export async function generateWithGroq(profile: RoadmapProfile) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("Missing GROQ_API_KEY. Add it to your environment before generating a roadmap.");
  }

  const todayIso = new Date().toISOString();
  const prompt = `
You are an expert competitive exam curriculum architect.

Generate a COMPLETE and HIGHLY DETAILED syllabus roadmap.

Student profile:

Exam: ${profile.exam}
Education level: ${profile.educationLevel}
Preparation level: ${profile.preparationLevel ?? "medium"}

Generate the syllabus using:

Subject → Chapter → Topic

Rules:

* Generate the complete official syllabus for the selected exam.
* Every topic must be ONE atomic learning concept.
* Do not merge multiple concepts into one topic.
* Expand every chapter into all standard coaching-level topics.
* Arrange topics from fundamentals to advanced concepts.
* Include PYQ-important topics.
* Avoid duplicate topics.
* Do not generate a study plan.
* Do not summarize chapters.

For JEE and NEET, each major chapter should contain 10–30 detailed topics.

For UPSC, Polity, Economy, History, Geography, Environment, Ethics, and Essay should be expanded comprehensively.

For CAT, GATE, CA, and CLAT, generate detailed topic-level coverage.

Return ONLY valid JSON in this format:

{
"metadata": {
"exam": "${profile.exam}",
"version": 1
},
"roadmap": [
{
"id": "physics-rotational-motion-parallel-axis-theorem",
"subject": "Physics",
"chapter": "Rotational Motion",
"topic": "Parallel axis theorem",
"difficulty": "medium",
"weightage": "high",
"estimatedMinutes": 90,
"completed": false
}
]
}

`;

  const completion = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    temperature: 0.2,
    response_format: {
      type: "json_object",
    },
    messages: [
      {
        role: "system",
        content: "You only return valid JSON. Never return markdown.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = completion.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Groq returned an empty response.");
  }

  try {
    const parsed = JSON.parse(content);

    if (!parsed || typeof parsed !== "object") {
      throw new Error("Groq returned invalid JSON.");
    }

    if (Array.isArray(parsed.roadmap)) {
      return {
        metadata: {
          exam: profile.exam,
          generatedAt: new Date().toISOString(),
          version: 2,
          ...(parsed.metadata || {}),
        },
        roadmap: parsed.roadmap,
        studyPlan: Array.isArray(parsed.studyPlan) ? parsed.studyPlan : [],
      };
    }

    throw new Error("Groq response did not include a roadmap array.");
  } catch {
    throw new Error("Groq returned invalid JSON.");
  }
}
