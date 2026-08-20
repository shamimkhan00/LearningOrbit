import {
  doc,
  serverTimestamp,
  Timestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export async function completeUserSetup(
  uid: string,
  formData: {
    exam: string;
    educationLevel: string;
    examDate: string;
    preparationLevel: "easy" | "medium" | "hard";
    minimumStudyHours: number;
    additionalInfo: string;
  }
) {
  const userRef = doc(db, "users", uid);

  await setDoc(
    userRef,
    {
      profile: {
        exam: formData.exam,
        educationLevel: formData.educationLevel,
        examDate: Timestamp.fromDate(new Date(formData.examDate)),
        preparationLevel: formData.preparationLevel,
        minimumStudyHours: formData.minimumStudyHours,
        dailyStudyHours: formData.minimumStudyHours,
        additionalInfo: formData.additionalInfo,
      },
      setupCompleted: true,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
