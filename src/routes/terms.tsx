import { createFileRoute } from "@tanstack/react-router";
import { Block, ContentPage } from "@/components/site/ContentPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service | NextStep CV UK" },
      {
        name: "description",
        content:
          "The terms that apply when you use the NextStep CV UK builder, checker and cover letter tools.",
      },
      { property: "og:title", content: "Terms of Service | NextStep CV UK" },
      {
        property: "og:description",
        content: "Fair, plain-English terms for using NextStep CV UK.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <ContentPage title="Terms of Service" intro="By using NextStep CV UK you agree to these terms.">
      <Block heading="Your account">
        <p>
          You are responsible for the accuracy of the information you enter and for keeping your
          login safe.
        </p>
      </Block>
      <Block heading="Acceptable use">
        <p>Do not use the service to create misleading CVs or to submit content you do not own.</p>
      </Block>
      <Block heading="AI suggestions">
        <p>
          AI output is a drafting aid. Always review it before applying; we cannot guarantee
          interviews or job offers.
        </p>
      </Block>
      <Block heading="Billing">
        <p>
          Paid plans renew until cancelled. You can cancel at any time and keep access to the end of
          the period.
        </p>
      </Block>
    </ContentPage>
  ),
});
