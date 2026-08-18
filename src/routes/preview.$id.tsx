import { useEffect, useState } from "react";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { CvPreviewPage } from "@/components/cv/CvPreviewPage";
import { supabase } from "@/integrations/supabase/client";
import {
  defaultSettings,
  mergeResume,
  type ResumeData,
  type ResumeSettings,
  type TemplateId,
} from "@/lib/cv-types";

export const Route = createFileRoute("/preview/$id")({
  head: () => ({
    meta: [
      { title: "Your finished CV | NextStep CV UK" },
      {
        name: "description",
        content: "Preview and download your finished UK CV as a print-ready PDF.",
      },
      { property: "og:title", content: "Your finished CV | NextStep CV UK" },
      { property: "og:description", content: "Preview and download your finished UK CV." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PreviewSaved,
});

function PreviewSaved() {
  const { id } = useParams({ from: "/preview/$id" });
  const [state, setState] = useState<{
    data: ResumeData;
    settings: ResumeSettings;
    template: TemplateId;
    title: string;
  } | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("resumes")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data: row }) => {
        if (cancelled) return;
        if (!row) {
          setMissing(true);
          return;
        }
        setState({
          data: mergeResume(row.data),
          settings: { ...defaultSettings, ...(row.settings as Partial<ResumeSettings>) },
          template: (row.template as TemplateId) ?? "professional",
          title: row.title ?? "Untitled CV",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (missing) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-xl px-4 py-20 text-center">
          <h1 className="text-xl font-semibold">CV not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This CV may have been deleted or belongs to another account.
          </p>
        </div>
      </SiteLayout>
    );
  }

  if (!state) {
    return (
      <SiteLayout>
        <div className="px-4 py-20 text-center text-sm text-muted-foreground">Loading your CV…</div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <CvPreviewPage
        data={state.data}
        settings={state.settings}
        template={state.template}
        title={state.title}
        editTo={{ to: "/builder/$id", params: { id } }}
      />
    </SiteLayout>
  );
}
