import { useState } from "react";
import { Download, FileText, Loader2, Printer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { ResumeData, ResumeSettings, TemplateId } from "@/lib/cv-types";
import type { DeliveryMethod, ExportOptions } from "@/lib/export-shared";

interface Props {
  data: ResumeData;
  settings: ResumeSettings;
  template: TemplateId;
  title: string;
  compact?: boolean;
}

type ExportKind = "pdf" | "docx";

function successMessage(format: "PDF" | "Word", method: DeliveryMethod) {
  if (method === "shared") return `${format} ready — choose Save to Files or another app`;
  return `${format} downloaded to your device`;
}

export function ResumeExportButtons({ data, settings, template, title, compact = false }: Props) {
  const [exporting, setExporting] = useState<ExportKind | null>(null);
  const options: ExportOptions = { data, settings, template, title };

  async function exportFile(kind: ExportKind) {
    setExporting(kind);
    try {
      const method =
        kind === "pdf"
          ? await import("@/lib/pdf-export").then(({ downloadResumePdf }) =>
              downloadResumePdf(options),
            )
          : await import("@/lib/docx-export").then(({ downloadResumeDocx }) =>
              downloadResumeDocx(options),
            );

      if (method !== "cancelled") {
        toast.success(successMessage(kind === "pdf" ? "PDF" : "Word", method));
      }
    } catch (error) {
      console.error(error);
      toast.error(
        `Could not create the ${kind === "pdf" ? "PDF" : "Word file"}. Please try again.`,
      );
    } finally {
      setExporting(null);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="CV download options">
      <Button
        type="button"
        size="sm"
        onClick={() => exportFile("pdf")}
        disabled={exporting !== null}
      >
        {exporting === "pdf" ? (
          <Loader2 className="mr-1 size-4 animate-spin" />
        ) : (
          <Download className="mr-1 size-4" />
        )}
        {compact ? "PDF" : "Download PDF"}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => exportFile("docx")}
        disabled={exporting !== null}
      >
        {exporting === "docx" ? (
          <Loader2 className="mr-1 size-4 animate-spin" />
        ) : (
          <FileText className="mr-1 size-4" />
        )}
        {compact ? "Word" : "Download Word"}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => window.print()}
        disabled={exporting !== null}
      >
        <Printer className="mr-1 size-4" />
        {compact ? "Print" : "Print CV"}
      </Button>
    </div>
  );
}
