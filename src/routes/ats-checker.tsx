import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SiteLayout } from "@/components/site/SiteLayout";
import { analyseCV, analyseJobMatch } from "@/lib/ai.functions";

export const Route = createFileRoute("/ats-checker")({
  head: () => ({
    meta: [
      { title: "Free ATS CV Checker | NextStep CV UK" },
      {
        name: "description",
        content:
          "Paste your CV and get an instant ATS score out of 100, plus keyword gaps and practical fixes for UK applications.",
      },
      { property: "og:title", content: "Free ATS CV Checker | NextStep CV UK" },
      {
        property: "og:description",
        content: "Score your CV against ATS systems and job descriptions in seconds.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AtsChecker,
});

function AtsChecker() {
  const runAnalyse = useServerFn(analyseCV);
  const runMatch = useServerFn(analyseJobMatch);
  const [cv, setCv] = useState("");
  const [targetJob, setTargetJob] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    strong: string[];
    improve: string[];
    keywords: string[];
  } | null>(null);
  const [match, setMatch] = useState<{
    score: number;
    matching: string[];
    missing: string[];
    recommendations: string[];
  } | null>(null);

  async function analyse() {
    if (cv.trim().length < 80) {
      toast.error("Paste a bit more of your CV first");
      return;
    }
    setBusy(true);
    try {
      const [scoreResult, matchResult] = await Promise.all([
        runAnalyse({ data: { cv, targetJob: targetJob || undefined } }),
        jobDescription.trim().length > 60
          ? runMatch({ data: { cv, jobDescription } })
          : Promise.resolve(null),
      ]);
      setResult(scoreResult);
      setMatch(matchResult);
    } catch {
      toast.error("Could not analyse your CV. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-3xl font-bold sm:text-4xl">ATS CV Checker</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Paste your CV below to get an ATS score out of 100, the keywords recruiters look for, and
          clear suggestions. Add a job description to see how well you match the role.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="surface-card space-y-4 p-6">
            <Input
              placeholder="Target job title (optional)"
              value={targetJob}
              onChange={(event) => setTargetJob(event.target.value)}
            />
            <Textarea
              rows={14}
              placeholder="Paste the full text of your CV here…"
              value={cv}
              onChange={(event) => setCv(event.target.value)}
            />
            <Textarea
              rows={8}
              placeholder="Paste a job description (optional)"
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
            />
            <Button onClick={analyse} disabled={busy}>
              {busy ? "Analysing…" : "Check my CV"}
            </Button>
          </div>

          <div className="space-y-6">
            {result ? (
              <div className="surface-card p-6">
                <div className="text-sm text-muted-foreground">ATS score</div>
                <div className="text-5xl font-bold">{result.score}/100</div>
                <Section title="What works well" items={result.strong} />
                <Section title="What to improve" items={result.improve} />
                <Section title="Keywords to include" items={result.keywords} />
              </div>
            ) : (
              <div className="surface-card p-6 text-sm text-muted-foreground">
                Your results will appear here.
              </div>
            )}
            {match && (
              <div className="surface-card p-6">
                <div className="text-sm text-muted-foreground">Job match</div>
                <div className="text-4xl font-bold">{match.score}%</div>
                <Section title="Matching skills" items={match.matching} />
                <Section title="Missing keywords" items={match.missing} />
                <Section title="Recommendations" items={match.recommendations} />
              </div>
            )}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <div className="mt-5">
      <h2 className="text-sm font-semibold">{title}</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
