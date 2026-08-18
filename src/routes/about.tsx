import { createFileRoute } from "@tanstack/react-router";
import { Block, ContentPage } from "@/components/site/ContentPage";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About NextStep CV UK" },
      {
        name: "description",
        content:
          "Why we built a CV builder specifically for the UK job market, and the principles behind it.",
      },
      { property: "og:title", content: "About NextStep CV UK" },
      {
        property: "og:description",
        content: "A CV builder made for UK recruiters and applicant tracking systems.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <ContentPage
      title="About NextStep CV UK"
      intro="We help people in the UK present their real experience clearly, so the right roles notice them."
    >
      <Block heading="Built for the UK">
        <p>
          UK CVs have their own conventions: no photographs, no date of birth, British English
          spelling, and two pages at most. Every template and every suggestion here follows those
          norms.
        </p>
      </Block>
      <Block heading="Honest by design">
        <p>
          Our AI sharpens the wording of what you have actually done. It never invents employers,
          dates or qualifications.
        </p>
      </Block>
      <Block heading="Accessible pricing">
        <p>
          You can build and preview a full CV for free, and upgrade only when you are ready to
          apply.
        </p>
      </Block>
    </ContentPage>
  ),
});
