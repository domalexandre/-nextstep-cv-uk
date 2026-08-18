import type { ResumeData, ResumeSettings, TemplateId } from "@/lib/cv-types";
import { fullName } from "@/lib/cv-types";

export type DeliveryMethod = "downloaded" | "shared" | "cancelled";

export interface ExportOptions {
  data: ResumeData;
  settings: ResumeSettings;
  template: TemplateId;
  title: string;
}

export function cleanText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function cleanBullet(value: string) {
  return cleanText(
    value
      .replace(/^\s*(?:[*•\-–—]|\d+[.)])\s+/, "")
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/^\*+|\*+$/g, ""),
  );
}

export function cleanBullets(items: string[]) {
  return items.map(cleanBullet).filter(Boolean);
}

export function accentColour(value: string) {
  return /^#[0-9a-f]{6}$/i.test(value) ? value.toUpperCase() : "#123A63";
}

export function wordColour(value: string) {
  return accentColour(value).slice(1);
}

export function contactItems(data: ResumeData) {
  const { personal } = data;
  return [
    personal.email,
    personal.phone,
    [personal.city, personal.country].filter(Boolean).join(", "),
    personal.linkedin,
    personal.website,
  ]
    .map(cleanText)
    .filter(Boolean);
}

export function exportFileStem(title: string, data: ResumeData) {
  const source = cleanText(title) || fullName(data.personal) || "My CV";
  const safe = source
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return safe || "My-CV";
}

export async function deliverBlob(blob: Blob, fileName: string): Promise<DeliveryMethod> {
  const file = new File([blob], fileName, { type: blob.type });
  const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (mobile && navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: fileName });
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return "cancelled";
      // Fall through to a normal download when sharing is unavailable.
    }
  }

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
  return "downloaded";
}
