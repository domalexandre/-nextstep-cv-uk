import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { CvPreviewPage } from "@/components/cv/CvPreviewPage";
import {
  defaultSettings,
  emptyResume,
  mergeResume,
  type ResumeData,
  type ResumeSettings,
  type TemplateId,
} from "@/lib/cv-types";

const GUEST_KEY = "nextstep-guest-cv";

export const Route = createFileRoute("/preview/")({
  head: () => ({
    meta: [
      { title: "CV preview | NextStep CV UK" },
      {
        name: "description",
        content: "Preview your CV draft and download it as a print-ready PDF.",
      },
      { property: "og:title", content: "CV preview | NextStep CV UK" },
      { property: "og:description", content: "Preview your CV draft and download it as a PDF." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PreviewDraft,
});

function PreviewDraft() {
  const [state, setState] = useState<{
    data: ResumeData;
    settings: ResumeSettings;
    template: TemplateId;
    title: string;
  }>({ data: emptyResume(), settings: defaultSettings, template: "professional", title: "My CV" });

  useEffect(() => {
    const stored = window.localStorage.getItem(GUEST_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored);
      setState({
        data: mergeResume(parsed.data),
        settings: { ...defaultSettings, ...parsed.settings },
        template: parsed.template ?? "professional",
        title: parsed.title ?? "My CV",
      });
    } catch {
      /* ignore corrupt draft */
    }
  }, []);

  return (
    <SiteLayout>
      <CvPreviewPage {...state} editTo={{ to: "/builder" }} />
    </SiteLayout>
  );
}
