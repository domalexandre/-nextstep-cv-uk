import { createFileRoute } from "@tanstack/react-router";
import { Block, ContentPage } from "@/components/site/ContentPage";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help Centre | NextStep CV UK" },
      {
        name: "description",
        content:
          "Guides for building your CV, improving your ATS score and exporting a recruiter-ready PDF.",
      },
      { property: "og:title", content: "Help Centre | NextStep CV UK" },
      {
        property: "og:description",
        content: "Step-by-step guides for every part of NextStep CV UK.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <ContentPage title="Help Centre" intro="Short guides to get the most out of every tool.">
      <Block heading="Building your first CV">
        <p>
          Open the CV Builder, work through each step, and watch the live preview update. Your work
          saves automatically once you are signed in.
        </p>
      </Block>
      <Block heading="Improving your ATS score">
        <p>
          Paste your CV into the ATS Checker with a target job title. Add the missing keywords it
          lists, then re-run the check.
        </p>
      </Block>
      <Block heading="Exporting a PDF">
        <p>
          Use the download button in the builder. The export keeps text selectable so applicant
          tracking systems can read it.
        </p>
      </Block>
      <Block heading="Still stuck?">
        <p>Email support@nextstepcv.uk and we will help.</p>
      </Block>
    </ContentPage>
  ),
});
