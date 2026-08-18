import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SiteLayout } from "@/components/site/SiteLayout";
import { generateCoverLetter } from "@/lib/ai.functions";

export const Route = createFileRoute("/cover-letter")({
  head: () => ({
    meta: [
      { title: "AI Cover Letter Generator | NextStep CV UK" },
      {
        name: "description",
        content:
          "Generate a tailored British English cover letter from your CV and the job advert in seconds, then edit and download it.",
      },
      { property: "og:title", content: "AI Cover Letter Generator | NextStep CV UK" },
      {
        property: "og:description",
        content: "Tailored UK cover letters written from your own CV.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CoverLetterPage,
});

const TONES = ["professional", "friendly", "confident", "concise"] as const;

function CoverLetterPage() {
  const generate = useServerFn(generateCoverLetter);
  const [cv, setCv] = useState("");
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [hiringManager, setHiringManager] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [tone, setTone] = useState<(typeof TONES)[number]>("professional");
  const [letter, setLetter] = useState("");
  const [busy, setBusy] = useState(false);

  async function run() {
    if (!company || !jobTitle || cv.trim().length < 80) {
      toast.error("Add the company, job title and your CV text");
      return;
    }
    setBusy(true);
    try {
      const { text } = await generate({
        data: {
          cv,
          company,
          jobTitle,
          tone,
          hiringManager: hiringManager || undefined,
          jobDescription: jobDescription || undefined,
        },
      });
      setLetter(text);
    } catch {
      toast.error("Could not generate the letter. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-3xl font-bold sm:text-4xl">Cover Letter Generator</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Written in British English from your real experience — no invented facts.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="surface-card space-y-4 p-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                placeholder="Company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
              <Input
                placeholder="Job title"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </div>
            <Input
              placeholder="Hiring manager (optional)"
              value={hiringManager}
              onChange={(e) => setHiringManager(e.target.value)}
            />
            <Select
              value={tone}
              onValueChange={(value) => setTone(value as (typeof TONES)[number])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tone" />
              </SelectTrigger>
              <SelectContent>
                {TONES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              rows={10}
              placeholder="Paste your CV text here…"
              value={cv}
              onChange={(e) => setCv(e.target.value)}
            />
            <Textarea
              rows={6}
              placeholder="Paste the job advert (optional)"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
            <Button onClick={run} disabled={busy}>
              {busy ? "Writing…" : "Generate cover letter"}
            </Button>
          </div>

          <div className="surface-card p-6">
            <Textarea
              rows={26}
              value={letter}
              onChange={(e) => setLetter(e.target.value)}
              placeholder="Your cover letter will appear here, ready to edit."
            />
            {letter && (
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(letter);
                    toast.success("Copied to clipboard");
                  }}
                >
                  Copy
                </Button>
                <Button variant="outline" onClick={() => window.print()}>
                  Print / Save as PDF
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
