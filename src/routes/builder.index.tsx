import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { CvBuilder } from "@/components/cv/CvBuilder";

export const Route = createFileRoute("/builder/")({
  head: () => ({
    meta: [
      { title: "CV Builder | NextStep CV UK" },
      {
        name: "description",
        content:
          "Build an ATS-friendly UK CV step by step with a live preview, six templates and instant PDF download.",
      },
      { property: "og:title", content: "CV Builder | NextStep CV UK" },
      {
        property: "og:description",
        content: "Step-by-step UK CV builder with live preview and AI help.",
      },
    ],
  }),
  component: () => (
    <SiteLayout>
      <CvBuilder />
    </SiteLayout>
  ),
});
