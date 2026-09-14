"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Database, Mail, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/lib/auth/session";
import { continueWithGoogle, signUpWithInsForgeEmail } from "@/lib/insforge/auth";
import { useApi } from "@/lib/query/api-provider";

const signupSchema = z.object({
  name: z.string().min(2, "Enter your name."),
  email: z.string().email(),
  password: z.string().min(8, "Use at least 8 characters.")
});

type SignupValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const api = useApi();
  const { setSession } = useSession();
  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "" }
  });

  async function signUp(values: SignupValues) {
    try {
      const result = await signUpWithInsForgeEmail(values.name, values.email, values.password);
      if (result.session) {
        setSession(result.session);
        toast.success("Account created");
        router.push("/settings");
        return;
      }
      toast.success(result.requiresVerification ? "Check your email to verify your account." : "Account created. Sign in to continue.");
      router.push("/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sign up failed");
    }
  }

  async function demoSignIn() {
    const session = await api.demoLogin();
    setSession(session);
    toast.success("Demo account ready");
    router.push("/needs-you");
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[430px_1fr]">
        <Card className="w-full">
          <CardContent className="p-6">
            <div className="grid size-9 place-items-center rounded-md bg-foreground text-sm font-semibold text-background">SE</div>
            <h1 className="mt-5 text-2xl font-semibold">Create your SmartEmail account</h1>
            <p className="mt-1 text-sm text-muted-foreground">InsForge stores your account and isolates your SmartEmail records by user.</p>
            <form className="mt-6 grid gap-4" onSubmit={form.handleSubmit(signUp)}>
              <div className="grid gap-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" autoComplete="name" placeholder="Somesh Mal" {...form.register("name")} />
                {form.formState.errors.name ? <p className="text-xs text-danger">{form.formState.errors.name.message}</p> : null}
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" autoComplete="email" placeholder="you@company.com" {...form.register("email")} />
                {form.formState.errors.email ? <p className="text-xs text-danger">{form.formState.errors.email.message}</p> : null}
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" autoComplete="new-password" placeholder="At least 8 characters" {...form.register("password")} />
                {form.formState.errors.password ? <p className="text-xs text-danger">{form.formState.errors.password.message}</p> : null}
              </div>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creating account..." : "Create account"}
                <ArrowRight size={16} />
              </Button>
            </form>
            <div className="mt-3 grid gap-2">
              <Button variant="outline" onClick={() => void continueWithGoogle().catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Google sign-up is not configured yet."))}>
                <Mail size={16} /> Continue with Google
              </Button>
              {process.env.NEXT_PUBLIC_DEMO_MODE === "true" && <Button variant="secondary" onClick={demoSignIn}>
                <Database size={16} /> Try demo account
              </Button>}
            </div>
            <p className="mt-5 text-center text-sm text-muted-foreground">
              Already have an account? <Link className="font-medium text-foreground underline-offset-4 hover:underline" href="/login">Sign in</Link>
            </p>
          </CardContent>
        </Card>
        <section>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Founder-ready prototype</p>
          <h2 className="mt-3 max-w-2xl text-4xl font-semibold leading-tight tracking-normal">Your inbox should complete the work behind every conversation.</h2>
          <div className="mt-8 grid gap-3 md:grid-cols-2">
            {[
              ["Connect", "Sign up with InsForge Auth and keep sessions backed by the backend."],
              ["Seed", "Your account gets private demo records for commitments, waiting, approvals, and decisions."],
              ["Review", "Needs You shows approval workflows, conflicts, policy, shadow mode, and smart attachments."],
              ["Verify", "The prototype API records execution, verification, citations, and audit events."]
            ].map(([title, body]) => (
              <div key={title} className="rounded-md border border-border bg-surface p-4">
                <CheckCircle2 size={17} className="text-success" aria-hidden />
                <h3 className="mt-3 text-sm font-semibold">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck size={16} className="text-success" aria-hidden />
            RLS keeps account records scoped to the signed-in user.
          </div>
        </section>
      </div>
    </main>
  );
}
