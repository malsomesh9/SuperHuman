"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { ArrowRight, Database, Mail, ShieldCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/lib/auth/session";
import { continueWithGoogle, signInWithInsForgeEmail } from "@/lib/insforge/auth";
import { useApi } from "@/lib/query/api-provider";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Use at least 8 characters.")
});
type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const api = useApi();
  const router = useRouter();
  const params = useSearchParams();
  const { setSession } = useSession();
  const [demoPending, setDemoPending] = useState(false);
  const form = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });
  const requestedNext = params.get("next");
  const next = requestedNext?.startsWith("/") && !requestedNext.startsWith("//") && !requestedNext.includes("\\") ? requestedNext : "/settings";

  async function signIn(values: LoginValues) {
    try {
      const session = await signInWithInsForgeEmail(values.email, values.password);
      setSession(session);
      toast.success("Signed in with InsForge");
      router.push(next);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sign in failed");
    }
  }

  async function demoSignIn() {
    setDemoPending(true);
    try {
      const session = await api.demoLogin();
      setSession(session);
      toast.success("Demo account ready");
      router.push("/today");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Demo is unavailable. Please retry.");
    } finally { setDemoPending(false); }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1fr_430px]">
        <section className="hidden lg:block">
          <div className="grid size-10 place-items-center rounded-md border border-border bg-surface text-sm font-semibold shadow-fine">SE</div>
          <h1 className="mt-8 max-w-xl text-4xl font-semibold leading-tight tracking-normal">Communication in. Work completed.</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">SmartEmail connects your inbox, commitments, approvals, policies, and audit trail so founders can manage exceptions instead of chasing every thread.</p>
          <div className="mt-8 grid max-w-xl gap-3">
            {[
              ["InsForge Auth", "Real email/password accounts with backend sessions."],
              ["Private demo sessions", "Your sample-data changes are stored separately from other visitors."],
              ["Workflow demo", "Explore drafting and approvals. No real email or payment is sent."]
            ].map(([title, body]) => (
              <div key={title} className="flex gap-3 rounded-md border border-border bg-surface p-3">
                <ShieldCheck size={18} className="mt-0.5 text-success" aria-hidden />
                <div>
                  <div className="text-sm font-medium">{title}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{body}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
        <Card className="w-full">
          <CardContent className="p-6">
            <div className="grid size-9 place-items-center rounded-md bg-foreground text-sm font-semibold text-background">SE</div>
            <h2 className="mt-5 text-2xl font-semibold">Sign in to SmartEmail</h2>
            <p className="mt-1 text-sm text-muted-foreground">Use InsForge Auth or open the seeded demo account.</p>
            <form className="mt-6 grid gap-4" onSubmit={form.handleSubmit(signIn)}>
              <div className="grid gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" autoComplete="email" placeholder="you@company.com" {...form.register("email")} />
                {form.formState.errors.email ? <p className="text-xs text-danger">{form.formState.errors.email.message}</p> : null}
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" autoComplete="current-password" placeholder="Your password" {...form.register("password")} />
                {form.formState.errors.password ? <p className="text-xs text-danger">{form.formState.errors.password.message}</p> : null}
              </div>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
                <ArrowRight size={16} />
              </Button>
            </form>
            <div className="mt-3 grid gap-2">
              <Button variant="outline" onClick={() => void continueWithGoogle().catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Google sign-in is not configured yet."))}>
                <Mail size={16} /> Continue with Google
              </Button>
              {process.env.NEXT_PUBLIC_DEMO_MODE === "true" && <Button variant="secondary" onClick={demoSignIn} disabled={demoPending}>
                <Database size={16} /> {demoPending ? "Opening demo..." : "Demo account"}
              </Button>}
            </div>
            <p className="mt-5 text-center text-sm text-muted-foreground">
              New to SmartEmail? <Link className="font-medium text-foreground underline-offset-4 hover:underline" href="/signup">Create an account</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
