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
    dailyStudyHours: 4,
    additionalInfo: "",
  });

  const next = () => {
    if (step < 5) setStep(step + 1);
  };

  const back = () => {
    if (step > 1) setStep(step - 1);
  };

  const update = (key: keyof typeof formData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  //submit function
  const router = useRouter();

  const handleSubmit = async () => {
    try {

      const user = getAuth().currentUser;

      if (!user) return;

      setLoading(true);

      await completeUserSetup(
        user.uid,
        formData
      );

      router.push("/roadmap");

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-5">

      <div className="w-full max-w-md">

        {/* Progress */}

        <div className="mb-10">

          <p className="text-sm text-zinc-400">
            Step {step} of 5
          </p>

          <div className="w-full h-2 bg-zinc-800 rounded-full mt-3">

            <div
              className="bg-white h-2 rounded-full transition-all"
              style={{
                width: `${(step / 5) * 100}%`,
              }}
            />

          </div>

        </div>

        {/* STEP 1 */}

        {step === 1 && (
          <>
            <h1 className="text-3xl font-bold mb-2">
              What exam are you preparing for?
            </h1>

            <div className="space-y-3 mt-8">

              {[
                "JEE",
                "NEET",
                "GATE",
                "UPSC",
                "CAT",
                "Other",
              ].map((exam) => (
                <button
                  key={exam}
                  onClick={() => update("exam", exam)}
                  className={`w-full rounded-xl border p-4 transition

                  ${formData.exam === exam
                      ? "bg-white text-black"
                      : "border-zinc-700"
                    }`}
                >
                  {exam}
                </button>
              ))}

            </div>

            {formData.exam === "Other" && (
              <input
                className="w-full mt-5 bg-zinc-900 rounded-xl p-4"
                placeholder="Enter exam name"
                onChange={(e) =>
                  update("exam", e.target.value)
                }
              />
            )}
          </>
        )}

        {/* STEP 2 */}

        {step === 2 && (
          <>
            <h1 className="text-3xl font-bold">
              Current Education Level
            </h1>

            <input
              value={formData.educationLevel}
              onChange={(e) =>
                update("educationLevel", e.target.value)
              }
              placeholder="Class 12 / B.Tech CSE"
              className="w-full mt-8 bg-zinc-900 rounded-xl p-4"
            />
          </>
        )}

        {/* STEP 3 */}

        {step === 3 && (
          <>
            <h1 className="text-3xl font-bold">
              Exam Date
            </h1>

            <input
              type="date"
              className="w-full mt-8 bg-zinc-900 rounded-xl p-4"
              value={formData.examDate}
              onChange={(e) =>
                update("examDate", e.target.value)
              }
            />
          </>
        )}

        {/* STEP 4 */}

        {step === 4 && (
          <>
            <h1 className="text-3xl font-bold">
              Daily Study Hours
            </h1>

            <div className="mt-10">

              <input
                type="range"
                min={1}
                max={12}
                value={formData.dailyStudyHours}
                onChange={(e) =>
                  update(
                    "dailyStudyHours",
                    Number(e.target.value)
                  )
                }
                className="w-full"
              />

              <p className="text-center text-2xl mt-4">
                {formData.dailyStudyHours} Hours
              </p>

            </div>
          </>
        )}

        {/* STEP 5 */}

        {step === 5 && (
          <>
            <h1 className="text-3xl font-bold">
              Additional Information
            </h1>

            <textarea
              rows={6}
              placeholder="Anything we should know?"
              className="w-full mt-8 bg-zinc-900 rounded-xl p-4"
              value={formData.additionalInfo}
              onChange={(e) =>
                update("additionalInfo", e.target.value)
              }
            />
          </>
        )}

        {/* Navigation */}

        <div className="flex justify-between mt-12">

          <button
            disabled={step === 1}
            onClick={back}
            className="text-zinc-400"
          >
            Back
          </button>

          {step < 5 ? (
            <button
              onClick={next}
              disabled={
                step === 1 && formData.exam === ""
              }
              className="bg-white text-black rounded-xl px-6 py-3 disabled:opacity-40"
            >
              Next
            </button>
          ) : (
            <button
              className="bg-white text-black rounded-xl px-6 py-3"
              onClick={handleSubmit}
            >
              Generate Study Plan
            </button>
          )}

        </div>

      </div>

    </main>
  );
}