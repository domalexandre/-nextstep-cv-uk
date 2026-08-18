import { createFileRoute, useParams } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { CvBuilder } from "@/components/cv/CvBuilder";

export const Route = createFileRoute("/builder/$id")({
  head: () => ({
    meta: [
      { title: "Edit your CV | NextStep CV UK" },
      {
        name: "description",
        content: "Edit and update a saved CV in your NextStep CV UK account.",
      },
      { property: "og:title", content: "Edit your CV | NextStep CV UK" },
      { property: "og:description", content: "Update a saved CV with live preview and autosave." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EditResume,
});

function EditResume() {
  const { id } = useParams({ from: "/builder/$id" });
  return (
    <SiteLayout>
      <CvBuilder resumeId={id} />
    </SiteLayout>
  );
}
