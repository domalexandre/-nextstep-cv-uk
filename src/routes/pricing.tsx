import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing | NextStep CV UK" },
      {
        name: "description",
        content:
          "Start free and upgrade when you need unlimited CVs, all templates, cover letters and ATS checks. Simple UK pricing.",
      },
      { property: "og:title", content: "Pricing | NextStep CV UK" },
      {
        property: "og:description",
        content: "Free to start. Affordable plans for serious job hunters.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pricing,
});

const PLANS = [
  {
    name: "Free",
    price: "£0",
    period: "forever",
    features: ["1 CV", "2 templates", "Live preview", "Basic ATS score", "PDF with watermark"],
    cta: "Start free",
  },
  {
    name: "Pro",
    price: "£9",
    period: "per month",
    highlight: true,
    features: [
      "Unlimited CVs",
      "All six templates",
      "Full ATS report and job matcher",
      "AI cover letters",
      "Clean PDF export",
      "Job application tracker",
    ],
    cta: "Go Pro",
  },
  {
    name: "Lifetime",
    price: "£49",
    period: "one-off",
    features: [
      "Everything in Pro",
      "Pay once, keep forever",
      "All future templates",
      "Priority support",
    ],
    cta: "Buy lifetime",
  },
];

function Pricing() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-center text-3xl font-bold sm:text-4xl">Simple, honest pricing</h1>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
          Build your CV for free. Upgrade only when you are ready to apply.
        </p>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <article
              key={plan.name}
              className={`surface-card flex flex-col p-6 ${plan.highlight ? "ring-2 ring-accent" : ""}`}
            >
              <h2 className="text-lg font-semibold">{plan.name}</h2>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>
              <ul className="mt-6 flex-1 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button className="mt-6" variant={plan.highlight ? "default" : "outline"} asChild>
                <Link to="/builder">{plan.cta}</Link>
              </Button>
            </article>
          ))}
        </div>
        <p className="mt-10 text-center text-sm text-muted-foreground">
          Card payments are coming soon. Everything on the free plan is available today.
        </p>
      </div>
    </SiteLayout>
  );
}
