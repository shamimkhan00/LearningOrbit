import Groq from "groq-sdk";

type RoadmapProfile = {
  exam: string;
  educationLevel: string;
  dailyStudyHours: number;
  additionalInfo?: string;
};

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY ?? "",
});

export async function generateWithGroq(profile: RoadmapProfile) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error(
      "Missing GROQ_API_KEY. Add it to your environment before generating a roadmap."
    );
  }

  const prompt = `
You are an expert educational planner specializing in competitive exam preparation.

Your task is to generate a COMPLETE syllabus roadmap for the student.

Student Profile

Exam: ${profile.exam}
Education Level: ${profile.educationLevel}
Daily Study Hours: ${profile.dailyStudyHours}
Additional Information: ${profile.additionalInfo ?? "None"}

Instructions:

- Cover the COMPLETE syllabus for the selected exam: ${profile.exam}.
- Tailor the roadmap to ${profile.exam}; do not assume JEE unless the selected exam is JEE.
- Organize every topic into its correct Subject and Chapter.
- Return topics in the recommended learning sequence, starting from fundamentals and progressing to advanced concepts.
- Do not skip any important topics.
- Avoid duplicate topics.
- Generate one object for every study topic.
- If the exam is NEET, include Biology, Chemistry, and Physics topics.
- If the exam is GATE, include the relevant engineering/technical subjects and core concepts.
- If the exam is UPSC/CAT, include subject areas appropriate to that exam.

Difficulty Rules

Use ONLY one of:

- easy
- medium
- hard

Weightage Rules

Use ONLY one of:

- low
- medium
- high

Output Rules

Return ONLY valid JSON.

DO NOT:

- Explain anything.
- Add markdown.
- Wrap the response inside \`\`\`.
- Add comments.
- Add text before or after the JSON.

Return this exact schema:

{
  "metadata": {
    "exam": "${profile.exam}",
    "generatedAt": "2026-07-29T12:00:00.000Z",
    "version": 1
  },
  "roadmap": [
    {
      "id": "physics-mechanics-units-and-dimensions",
      "subject": "Physics",
      "chapter": "Mechanics",
      "topic": "Units and Dimensions",
      "difficulty": "easy",
      "weightage": "high",
      "completed": false
    }
  ]
}
`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
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
          version: 1,
          ...(parsed.metadata || {}),
        },
        roadmap: parsed.roadmap,
      };
    }

    throw new Error("Groq response did not include a roadmap array.");
  } catch {
    throw new Error("Groq returned invalid JSON.");
  }
}