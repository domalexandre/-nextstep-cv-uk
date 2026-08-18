import { createFileRoute } from "@tanstack/react-router";
import { Block, ContentPage } from "@/components/site/ContentPage";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Frequently Asked Questions | NextStep CV UK" },
      {
        name: "description",
        content:
          "Answers about CV length, ATS scoring, photos on UK CVs, pricing and data privacy.",
      },
      { property: "og:title", content: "Frequently Asked Questions | NextStep CV UK" },
      {
        property: "og:description",
        content: "Common questions about building a UK CV with NextStep CV UK.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <ContentPage title="Frequently asked questions">
      <Block heading="How long should a UK CV be?">
        <p>Two pages is the standard. Graduates and career changers can often do it in one.</p>
      </Block>
      <Block heading="Should I include a photo?">
        <p>No. UK employers expect no photo, no date of birth and no marital status.</p>
      </Block>
      <Block heading="What is an ATS score?">
        <p>
          A measure of how easily applicant tracking software can read and rank your CV, based on
          structure, keywords and formatting.
        </p>
      </Block>
      <Block heading="Is it really free?">
        <p>
          Yes — you can build, preview and check a CV for free. Paid plans unlock unlimited CVs and
          exports.
        </p>
      </Block>
      <Block heading="Who can see my CV?">
        <p>Only you. Your data is private and you can delete it at any time.</p>
      </Block>
    </ContentPage>
  ),
});
