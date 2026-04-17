import "server-only";

import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function getRequiredAdminEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not set.`);
  }

  return value;
}

const projectId = getRequiredAdminEnv("FIREBASE_PROJECT_ID");
const clientEmail = getRequiredAdminEnv("FIREBASE_CLIENT_EMAIL");
const privateKey = getRequiredAdminEnv("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n");

const adminApp = getApps().length
  ? getApp()
  : initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      projectId,
    });

const adminAuth = getAuth(adminApp);

export { adminApp, adminAuth };
