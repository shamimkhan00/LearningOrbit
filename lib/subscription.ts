import { Timestamp } from "firebase/firestore";

export type SubscriptionData = {
  plan?: "trial" | "monthly";
  subscriptionStatus?: "trial" | "active" | "expired";
  trialEndsAt?: Timestamp | null;
  subscriptionEndsAt?: Timestamp | null;
};

export function hasActiveAccess(data: SubscriptionData | undefined) {
  if (!data) return false;

  const now = Date.now();

  if (
    data.subscriptionStatus === "trial" &&
    data.trialEndsAt
  ) {
    return data.trialEndsAt.toMillis() > now;
  }

  if (
    data.subscriptionStatus === "active" &&
    data.subscriptionEndsAt
  ) {
    return data.subscriptionEndsAt.toMillis() > now;
  }

  return false;
}