import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, FileSearch, PenLine, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site/SiteLayout";
import { HeroCvMockup } from "@/components/site/HeroCvMockup";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NextStep CV UK — ATS-friendly CV Builder for the UK" },
      {
        name: "description",
        content:
          "Build a professional, ATS-friendly CV for the UK job market in minutes, with intelligent guidance, templates and direct PDF or Word downloads.",
      },
      { property: "og:title", content: "NextStep CV UK — Build a CV that gets you noticed" },
      {
        property: "og:description",
        content:
          "Create a professional, ATS-friendly CV in minutes with guidance every step of the way.",
      },
    ],
  }),
  component: Index,
});

const STEPS = [
  {
    icon: PenLine,
    title: "Tell us about yourself",
    body: "Add your experience, education, skills and career goals in a guided, plain-English form.",
  },
  {
    icon: Sparkles,
    title: "Let AI improve your CV",
    body: "Sharpen your descriptions, skills and professional summary without inventing anything.",
  },
  {
    icon: FileSearch,
    title: "Download and apply",
    body: "Pick a template, check your ATS score and download a recruiter-ready PDF or Word file.",
  },
];

function Index() {
  return (
    <SiteLayout>
      <section className="hero-surface border-b border-border">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <ShieldCheck className="size-3.5 text-accent" /> Built for the UK job market
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.08] sm:text-5xl lg:text-6xl">
              Build a CV that gets you noticed.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Create a professional, ATS-friendly CV in minutes with intelligent guidance every step
              of the way.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/builder">
                  Create My CV <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/ats-checker">Improve My Existing CV</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Your experience. Your next opportunity. No credit card needed to start.
            </p>
          </div>
          <div className="relative">
            <HeroCvMockup />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-center text-3xl font-bold sm:text-4xl">
          Build your CV in 3 simple steps
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <article key={step.title} className="surface-card p-6">
              <span className="flex size-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <step.icon className="size-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">
                {index + 1}. {step.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-secondary/40">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold">Everything you need to land the interview</h2>
            <p className="mt-3 text-muted-foreground">
              From your first draft to a tailored application, NextStep CV UK keeps every stage in
              one place.
            </p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              "Six professional A4 templates",
              "Live preview as you type",
              "ATS CV score out of 100",
              "Job description matcher",
              "AI cover letter generator",
              "Job application tracker",
              "Autosave to your account",
              "Direct PDF and Word downloads",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-accent" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h2 className="text-3xl font-bold">Start your next step today</h2>
        <p className="mt-3 text-muted-foreground">
          Whether it is your first job in the UK or your next promotion, your CV should do you
          justice.
        </p>
        <Button size="lg" className="mt-7" asChild>
          <Link to="/builder">Create My CV</Link>
        </Button>
      </section>
    </SiteLayout>
  );
}
