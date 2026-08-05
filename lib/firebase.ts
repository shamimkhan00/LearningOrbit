"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { firebaseWebConfig } from "@/lib/firebase-config";
import { getStorage } from "firebase/storage";

const app = getApps().length ? getApp() : initializeApp(firebaseWebConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

let analyticsPromise: Promise<Analytics | null> | null = null;

export function getFirebaseAnalytics() {
  if (typeof window === "undefined") {
    return Promise.resolve(null);
  }

  if (!analyticsPromise) {
    analyticsPromise = isSupported().then((supported) => {
      if (!supported) {
        return null;
      }

      return getAnalytics(app);
    });
  }

  return analyticsPromise;
}

export { app, auth, db, storage };
