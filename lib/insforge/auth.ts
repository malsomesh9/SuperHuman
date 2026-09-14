"use client";

import { emailSignIn, emailSignUp, startGoogleLogin } from "@/lib/insforge/auth-actions";
import type { User } from "@/types/domain";

type InsForgeAuthUser = {
  id: string;
  email: string;
  profile?: {
    name?: string;
    avatar_url?: string;
  } | null;
};

export type AuthSession = {
  user: User;
  token: string;
};

function toAppSession(authUser: InsForgeAuthUser): AuthSession {
  return {
    user: {
      id: authUser.id,
      name: authUser.profile?.name ?? authUser.email.split("@")[0] ?? "SmartEmail user",
      email: authUser.email,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      locale: navigator.language
    },
    token: "insforge-session"
  };
}

export async function signInWithInsForgeEmail(email: string, password: string) {
  const data = await emailSignIn(email, password);
  return toAppSession(data.user as InsForgeAuthUser);
}

export async function signUpWithInsForgeEmail(name: string, email: string, password: string) {
  const data = await emailSignUp(name, email, password);

  if (data.user) {
    return { session: toAppSession(data.user as InsForgeAuthUser), requiresVerification: false };
  }

  return { session: null, requiresVerification: data.requiresVerification };
}

export async function continueWithGoogle() {
  const { url } = await startGoogleLogin();
  window.location.assign(url);
}
