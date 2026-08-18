import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createResumeDocxBlob } from "../src/lib/docx-export";
import { createResumePdfBlob } from "../src/lib/pdf-export";
import {
  DEFAULT_SECTION_ORDER,
  defaultSettings,
  type ResumeData,
  type TemplateId,
} from "../src/lib/cv-types";

const outputDirectory = path.resolve(".export-validation");

const resume: ResumeData = {
  personal: {
    firstName: "Amelia",
    lastName: "Taylor",
    title: "Customer Service Assistant",
    email: "amelia.taylor@example.com",
    phone: "+44 7700 900123",
    city: "Manchester",
    country: "United Kingdom",
    linkedin: "linkedin.com/in/amelia-taylor",
    website: "",
  },
  targetJob: "Customer Service Assistant",
  summary:
    "Reliable customer service professional with experience supporting customers, resolving enquiries and maintaining accurate records in busy environments.",
  experience: [
    {
      id: "experience-1",
      jobTitle: "Customer Service Assistant",
      company: "Northern Retail Ltd",
      city: "Manchester",
      country: "United Kingdom",
      startDate: "March 2023",
      endDate: "",
      current: true,
      bullets: [
        "Respond to customer enquiries clearly and professionally across phone, email and in person.",
        "Resolve routine issues while escalating complex cases to the appropriate colleague.",
        "Maintain accurate customer records and follow company data protection procedures.",
      ],
    },
    {
      id: "experience-2",
      jobTitle: "Retail Assistant",
      company: "City Market",
      city: "Salford",
      country: "United Kingdom",
      startDate: "September 2021",
      endDate: "February 2023",
      current: false,
      bullets: [
        "Assisted customers with product queries and processed transactions accurately.",
        "Worked with colleagues to keep displays organised and service areas welcoming.",
      ],
    },
  ],
  education: [
    {
      id: "education-1",
      school: "Manchester College",
      qualification: "BTEC Level 3",
      field: "Business",
      location: "Manchester",
      startDate: "2019",
      endDate: "2021",
    },
  ],
  technicalSkills: ["CRM systems", "Microsoft Office", "Data entry"],
  softSkills: ["Communication", "Problem solving", "Teamwork"],
  languages: [
    { id: "language-1", language: "English", proficiency: "Fluent" },
    { id: "language-2", language: "Portuguese", proficiency: "Native" },
  ],
  certifications: [
    {
      id: "certification-1",
      name: "Customer Service Essentials",
      organisation: "OpenLearn",
      date: "2024",
      expiry: "",
    },
  ],
  extras: {
    projects: {
      enabled: true,
      items: [
        {
          id: "project-1",
          title: "Customer feedback guide",
          description: "Created a concise internal guide for recording common customer feedback.",
        },
      ],
    },
    awards: { enabled: false, items: [] },
    volunteering: { enabled: false, items: [] },
    courses: { enabled: false, items: [] },
    publications: { enabled: false, items: [] },
    interests: {
      enabled: true,
      items: [
        {
          id: "interest-1",
          title: "Interests",
          description: "Community events, reading and recreational running.",
        },
      ],
    },
    references: {
      enabled: true,
      items: [
        {
          id: "reference-1",
          title: "References",
          description: "Available on request.",
        },
      ],
    },
  },
  sectionOrder: [...DEFAULT_SECTION_ORDER],
};

const templates: TemplateId[] = [
  "professional",
  "modern",
  "minimal",
  "executive",
  "graduate",
  "creative",
];

await mkdir(outputDirectory, { recursive: true });

for (const template of templates) {
  const options = {
    data: resume,
    settings: defaultSettings,
    template,
    title: `Amelia Taylor - ${template}`,
  };
  const blob = await createResumePdfBlob(options);
  await writeFile(
    path.join(outputDirectory, `${template}.pdf`),
    Buffer.from(await blob.arrayBuffer()),
  );
}

const docxBlob = await createResumeDocxBlob({
  data: resume,
  settings: defaultSettings,
  template: "professional",
  title: "Amelia Taylor CV",
});
await writeFile(
  path.join(outputDirectory, "professional.docx"),
  Buffer.from(await docxBlob.arrayBuffer()),
);

console.log(`Validated exports written to ${outputDirectory}`);
