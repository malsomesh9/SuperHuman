"use server";

import { cookies, headers } from "next/headers";
import { createAuthActions } from "@insforge/sdk/ssr";
import { z } from "zod";

const credentials = z.object({ email: z.email(), password: z.string().min(8).max(1024) });

async function appOrigin() {
  if (process.env.NEXT_PUBLIC_APP_URL) return new URL(process.env.NEXT_PUBLIC_APP_URL).origin;
  if (process.env.NODE_ENV === "production") throw new Error("Application URL is not configured.");
  const origin = (await headers()).get("origin");
  if (!origin || !["localhost", "127.0.0.1"].includes(new URL(origin).hostname)) throw new Error("Invalid application origin.");
  return new URL(origin).origin;
}

export async function emailSignIn(email: string, password: string) {
  const auth = createAuthActions({ cookies: await cookies() });
  const { data, error } = await auth.signInWithPassword(credentials.parse({ email, password }));
  if (error || !data?.user) throw new Error(error?.message ?? "Sign in failed.");
  return { user: data.user };
}

export async function emailSignUp(name: string, email: string, password: string) {
  const input = credentials.extend({ name: z.string().trim().min(1).max(120) }).parse({ name, email, password });
  const auth = createAuthActions({ cookies: await cookies() });
  const { data, error } = await auth.signUp({ ...input, redirectTo: `${await appOrigin()}/login?verified=true` });
  if (error) throw new Error(error.message);
  return { user: data?.requireEmailVerification ? null : data?.user ?? null, requiresVerification: Boolean(data?.requireEmailVerification) };
}

export async function accountSignOut() {
  const store = await cookies();
  if (!store.has("insforge_access_token") && !store.has("insforge_refresh_token")) return;
  const auth = createAuthActions({ cookies: store });
  const { error } = await auth.signOut();
  if (error) throw new Error(error.message);
}

export async function startGoogleLogin() {
  const store = await cookies();
  const auth = createAuthActions({ cookies: store });
  const { data, error } = await auth.signInWithOAuth("google", {
    redirectTo: `${await appOrigin()}/api/auth/callback`, skipBrowserRedirect: true
  });
  if (error || !data?.url || !data.codeVerifier) throw new Error(error?.message ?? "Google login is unavailable.");
  store.set("insforge_code_verifier", data.codeVerifier, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 600
  });
  return { url: data.url };
}
