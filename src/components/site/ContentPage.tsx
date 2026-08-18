import type { ReactNode } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";

export function ContentPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
        {intro && <p className="mt-4 text-muted-foreground">{intro}</p>}
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
          {children}
        </div>
      </div>
    </SiteLayout>
  );
}

export function Block({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-semibold text-foreground">{heading}</h2>
      <div className="mt-2 space-y-2">{children}</div>
    </section>
  );
}
