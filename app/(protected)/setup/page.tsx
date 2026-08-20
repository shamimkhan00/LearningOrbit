"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";
import { completeUserSetup } from "@/services/user.service";

export default function SetupPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    exam: "",
    educationLevel: "",
    examDate: "",
    preparationLevel: "medium",
    minimumStudyHours: "",
    additionalInfo: "",
  });

  const router = useRouter();

  const next = () => {
    if (step < 6) setStep(step + 1);
  };

  const back = () => {
    if (step > 1) setStep(step - 1);
  };

  const update = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    try {
      const user = getAuth().currentUser;
      if (!user) return;
      setLoading(true);
      await completeUserSetup(user.uid, {
        ...formData,
        preparationLevel: formData.preparationLevel as "easy" | "medium" | "hard",
        minimumStudyHours: Number(formData.minimumStudyHours),
      });
      router.push("/roadmap");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const canContinue = () => {
    if (step === 1) return formData.exam.trim() !== "";
    if (step === 2) return formData.educationLevel.trim() !== "";
    if (step === 3) return formData.examDate !== "";
    if (step === 4) return formData.preparationLevel !== "";
    if (step === 5) return formData.minimumStudyHours !== "" && Number(formData.minimumStudyHours) > 0;
    return true;
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-5">
      <div className="w-full max-w-md">
        <div className="mb-10">
          <p className="text-sm text-zinc-400">Step {step} of 6</p>
          <div className="w-full h-2 bg-zinc-800 rounded-full mt-3">
            <div
              className="bg-white h-2 rounded-full transition-all"
              style={{ width: `${(step / 6) * 100}%` }}
            />
          </div>
        </div>

        {step === 1 && (
          <>
            <h1 className="text-3xl font-bold mb-2">What exam are you preparing for?</h1>
            <div className="space-y-3 mt-8">
              {["JEE", "NEET", "GATE", "UPSC", "CAT", "Other"].map((exam) => (
                <button
                  key={exam}
                  onClick={() => update("exam", exam)}
                  className={`w-full rounded-xl border p-4 transition ${formData.exam === exam ? "bg-white text-black" : "border-zinc-700"}`}
                >
                  {exam}
                </button>
              ))}
            </div>
            {formData.exam === "Other" && (
              <input
                className="w-full mt-5 bg-zinc-900 rounded-xl p-4"
                placeholder="Enter exam name"
                onChange={(e) => update("exam", e.target.value)}
              />
            )}
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-3xl font-bold">Current Education Level</h1>
            <input
              value={formData.educationLevel}
              onChange={(e) => update("educationLevel", e.target.value)}
              placeholder="Class 12 / B.Tech CSE"
              className="w-full mt-8 bg-zinc-900 rounded-xl p-4"
            />
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="text-3xl font-bold">Exam Date</h1>
            <input
              type="date"
              className="w-full mt-8 bg-zinc-900 rounded-xl p-4"
              value={formData.examDate}
              onChange={(e) => update("examDate", e.target.value)}
            />
          </>
        )}

        {step === 4 && (
          <>
            <h1 className="text-3xl font-bold">Preparation Level</h1>
            <p className="text-sm text-zinc-400 mt-3">
              Tell us how hard the current syllabus feels.
            </p>
            <div className="space-y-3 mt-8">
              {[
                { key: "easy", label: "Easy", desc: "More revision, slower pace, lighter daily load" },
                { key: "medium", label: "Medium", desc: "Balanced pace between new topics and revision" },
                { key: "hard", label: "Hard", desc: "Aggressive plan with faster syllabus coverage" },
              ].map((level) => (
                <button
                  key={level.key}
                  onClick={() => update("preparationLevel", level.key)}
                  className={`w-full rounded-xl border p-4 text-left transition ${formData.preparationLevel === level.key ? "bg-white text-black" : "border-zinc-700"}`}
                >
                  <div className="font-semibold">{level.label}</div>
                  <div className="text-sm mt-1 opacity-80">{level.desc}</div>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 5 && (
          <>
            <h1 className="text-3xl font-bold">Minimum Study Hours</h1>
            <p className="text-sm text-zinc-400 mt-3">
              How many hours do you want to study each day at minimum?
            </p>
            <input
              type="number"
              min="0.5"
              max="24"
              step="0.5"
              className="w-full mt-8 bg-zinc-900 rounded-xl p-4"
              placeholder="For example, 2"
              value={formData.minimumStudyHours}
              onChange={(e) => update("minimumStudyHours", e.target.value)}
            />
          </>
        )}

        {step === 6 && (
          <>
            <h1 className="text-3xl font-bold">Additional Information</h1>
            <textarea
              rows={6}
              placeholder="Anything we should know? (weak areas, prior knowledge, etc.)"
              className="w-full mt-8 bg-zinc-900 rounded-xl p-4"
              value={formData.additionalInfo}
              onChange={(e) => update("additionalInfo", e.target.value)}
            />
          </>
        )}

        <div className="flex justify-between mt-12">
          <button disabled={step === 1} onClick={back} className="text-zinc-400">
            Back
          </button>

          {step < 6 ? (
            <button
              onClick={next}
              disabled={!canContinue()}
              className="bg-white text-black rounded-xl px-6 py-3 disabled:opacity-40"
            >
              Next
            </button>
          ) : (
            <button
              className="bg-white text-black rounded-xl px-6 py-3 disabled:opacity-40"
              disabled={loading}
              onClick={handleSubmit}
            >
              {loading ? "Saving..." : "Generate Study Plan"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
