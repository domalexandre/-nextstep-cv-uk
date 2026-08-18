import { Link } from "@tanstack/react-router";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CvDocument } from "@/components/cv/CvDocument";
import { ResumeExportButtons } from "@/components/cv/ResumeExportButtons";
import type { ResumeData, ResumeSettings, TemplateId } from "@/lib/cv-types";

interface Props {
  data: ResumeData;
  settings: ResumeSettings;
  template: TemplateId;
  title: string;
  editTo?: { to: "/builder/$id"; params: { id: string } } | { to: "/builder" };
}

export function CvPreviewPage({ data, settings, template, title, editTo }: Props) {
  return (
    <div className="mx-auto w-full max-w-[1100px] px-3 py-6 lg:px-6">
      <div className="no-print mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">
            Your CV is ready. Download a PDF or Word file directly, or print a copy.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {editTo && (
            <Button variant="outline" size="sm" asChild>
              {"params" in editTo ? (
                <Link to={editTo.to} params={editTo.params}>
                  <Pencil className="mr-1 size-4" /> Edit CV
                </Link>
              ) : (
                <Link to="/builder">
                  <Pencil className="mr-1 size-4" /> Edit CV
                </Link>
              )}
            </Button>
          )}
          <ResumeExportButtons data={data} settings={settings} template={template} title={title} />
        </div>
      </div>

      <div className="no-print overflow-x-auto rounded-xl border border-border bg-muted/40 p-2 shadow-card sm:p-3">
        <div className="screen-scale [zoom:0.42] sm:[zoom:0.62] md:[zoom:0.8] lg:[zoom:1]">
          <CvDocument data={data} settings={settings} template={template} />
        </div>
      </div>

      <div className="print-root hidden print:block">
        <CvDocument data={data} settings={settings} template={template} />
      </div>
    </div>
  );
}
