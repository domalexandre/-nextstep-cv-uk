import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in or create an account | NextStep CV UK" },
      {
        name: "description",
        content: "Log in to NextStep CV UK to save, edit and download your CVs.",
      },
      { property: "og:title", content: "Sign in | NextStep CV UK" },
      {
        property: "og:description",
        content: "Access your saved CVs, cover letters and job applications.",
      },
    ],
  }),
  component: AuthPage,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
  firstName: z.string().trim().max(60).optional(),
  lastName: z.string().trim().max(60).optional(),
});

function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [form, setForm] = useState({ email: "", password: "", firstName: "", lastName: "" });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate({ to: "/dashboard" });
  }, [user, navigate]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      if (mode === "forgot") {
        const email = z.string().email().parse(form.email.trim());
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Password reset email sent");
        return;
      }

      const parsed = schema.parse(form);
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: parsed.email,
          password: parsed.password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { first_name: parsed.firstName, last_name: parsed.lastName },
          },
        });
        if (error) throw error;
        toast.success("Account created. Check your inbox if confirmation is required.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: parsed.email,
          password: parsed.password,
        });
        if (error) throw error;
      }
    } catch (error) {
      const message =
        error instanceof z.ZodError
          ? (error.issues[0]?.message ?? "Please check your details")
          : error instanceof Error
            ? error.message
            : "Something went wrong";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard" });
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="surface-card p-7">
          <h1 className="text-2xl font-bold">
            {mode === "signup"
              ? "Create your account"
              : mode === "forgot"
                ? "Reset your password"
                : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your experience. Your next opportunity.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    value={form.firstName}
                    maxLength={60}
                    onChange={(event) => setForm({ ...form, firstName: event.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input
                    id="lastName"
                    value={form.lastName}
                    maxLength={60}
                    onChange={(event) => setForm({ ...form, lastName: event.target.value })}
                  />
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={form.email}
                maxLength={255}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
              />
            </div>
            {mode !== "forgot" && (
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={form.password}
                  maxLength={72}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                />
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {mode === "signup" ? "Sign up" : mode === "forgot" ? "Send reset link" : "Log in"}
            </Button>
          </form>

          {mode !== "forgot" && (
            <>
              <div className="my-4 text-center text-xs text-muted-foreground">or</div>
              <Button variant="outline" className="w-full" onClick={google}>
                Continue with Google
              </Button>
            </>
          )}

          <div className="mt-6 flex flex-col gap-2 text-sm text-muted-foreground">
            {mode !== "signup" && (
              <button onClick={() => setMode("signup")} className="text-left hover:text-foreground">
                Do not have an account? Sign up
              </button>
            )}
            {mode !== "login" && (
              <button onClick={() => setMode("login")} className="text-left hover:text-foreground">
                Already have an account? Log in
              </button>
            )}
            {mode !== "forgot" && (
              <button onClick={() => setMode("forgot")} className="text-left hover:text-foreground">
                Forgot your password?
              </button>
            )}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
