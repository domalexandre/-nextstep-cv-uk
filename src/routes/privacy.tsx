import { createFileRoute } from "@tanstack/react-router";
import { Block, ContentPage } from "@/components/site/ContentPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | NextStep CV UK" },
      {
        name: "description",
        content:
          "How NextStep CV UK collects, stores and protects your personal data under UK GDPR.",
      },
      { property: "og:title", content: "Privacy Policy | NextStep CV UK" },
      {
        property: "og:description",
        content: "Your CV data is yours: stored securely, never sold, deletable at any time.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <ContentPage
      title="Privacy Policy"
      intro="Last updated: 2026. This policy explains how we handle your data."
    >
      <Block heading="What we collect">
        <p>
          Your account email, the CV content you enter, and basic usage data needed to run the
          service.
        </p>
      </Block>
      <Block heading="How we use it">
        <p>
          Solely to provide the CV builder, ATS checks and cover letters. CV text may be sent to our
          AI provider to generate suggestions; it is not used to train public models.
        </p>
      </Block>
      <Block heading="Your rights">
        <p>
          Under UK GDPR you can access, correct, export or delete your data at any time. Deleting a
          CV removes it permanently from our database.
        </p>
      </Block>
      <Block heading="Security">
        <p>
          Data is encrypted in transit and access is restricted so only you can read your own
          records.
        </p>
      </Block>
    </ContentPage>
  ),
});
