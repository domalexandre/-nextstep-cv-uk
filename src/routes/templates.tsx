import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site/SiteLayout";
import { CvDocument } from "@/components/cv/CvDocument";
import { TEMPLATES, defaultSettings, emptyResume, type ResumeData } from "@/lib/cv-types";

export const Route = createFileRoute("/templates")({
  head: () => ({
    meta: [
      { title: "Professional CV Templates for the UK | NextStep CV UK" },
      {
        name: "description",
        content:
          "Six ATS-friendly, A4 CV templates designed for UK recruiters: Professional, Modern, Minimal, Executive, Graduate and Creative.",
      },
      { property: "og:title", content: "Professional CV Templates | NextStep CV UK" },
      {
        property: "og:description",
        content: "ATS-friendly A4 CV templates built for UK recruiters.",
      },
    ],
  }),
  component: TemplatesPage,
});

function sample(): ResumeData {
  const data = emptyResume();
  data.personal = {
    ...data.personal,
    firstName: "Alex",
    lastName: "Morgan",
    title: "Customer Service Assistant",
    email: "alex.morgan@email.co.uk",
    phone: "07700 900123",
    city: "Manchester",
  };
  data.summary =
    "Reliable customer service assistant with two years of retail experience, known for calm problem solving and clear communication with customers and colleagues.";
  data.experience = [
    {
      id: "1",
      jobTitle: "Customer Service Assistant",
      company: "Highstreet Retail",
      city: "Manchester",
      country: "United Kingdom",
      startDate: "2023",
      endDate: "",
      current: true,
      bullets: [
        "Supported customers at the till and on the shop floor during busy trading periods.",
        "Resolved queries and complaints politely, escalating complex cases to the duty manager.",
      ],
    },
  ];
  data.education = [
    {
      id: "1",
      school: "Manchester College",
      qualification: "BTEC Level 3",
      field: "Business",
      location: "Manchester",
      startDate: "2020",
      endDate: "2022",
    },
  ];
  data.technicalSkills = ["EPOS systems", "Stock handling", "Microsoft Office"];
  data.softSkills = ["Communication", "Teamwork", "Problem solving"];
  return data;
}

function TemplatesPage() {
  const data = sample();
  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-4xl font-bold">Professional CV templates</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Every template is A4, print-ready and designed to be read cleanly by applicant tracking
          systems.
        </p>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((template) => (
            <article key={template.id} className="surface-card overflow-hidden">
              <div className="h-64 overflow-hidden bg-muted/40">
                <div className="origin-top-left scale-[0.31]">
                  <CvDocument data={data} settings={defaultSettings} template={template.id} />
                </div>
              </div>
              <div className="border-t border-border p-5">
                <h2 className="font-semibold">{template.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{template.blurb}</p>
                <Button size="sm" className="mt-4" asChild>
                  <Link to="/builder">Use this template</Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}
