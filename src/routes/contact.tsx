import { createFileRoute } from "@tanstack/react-router";
import { Block, ContentPage } from "@/components/site/ContentPage";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact | NextStep CV UK" },
      {
        name: "description",
        content:
          "Get in touch with the NextStep CV UK team about your account, billing or feedback.",
      },
      { property: "og:title", content: "Contact | NextStep CV UK" },
      {
        property: "og:description",
        content: "Questions, feedback or billing help — we reply within two working days.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <ContentPage title="Contact us" intro="We usually reply within two working days.">
      <Block heading="Support">
        <p>support@nextstepcv.uk — account, billing and technical questions.</p>
      </Block>
      <Block heading="Feedback">
        <p>hello@nextstepcv.uk — feature ideas and template requests are always welcome.</p>
      </Block>
      <Block heading="Privacy requests">
        <p>privacy@nextstepcv.uk — data access, export or deletion under UK GDPR.</p>
      </Block>
    </ContentPage>
  ),
});
