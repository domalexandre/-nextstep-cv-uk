import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  TextRun,
  type ISectionOptions,
} from "docx";
import {
  EXTRA_SECTION_LABELS,
  dateRange,
  fullName,
  type ExtraSectionKey,
  type ResumeData,
} from "@/lib/cv-types";
import {
  cleanBullets,
  cleanText,
  contactItems,
  deliverBlob,
  exportFileStem,
  wordColour,
  type ExportOptions,
} from "@/lib/export-shared";

function run(text: string, options: { bold?: boolean; colour?: string; size?: number } = {}) {
  return new TextRun({
    text,
    bold: options.bold,
    color: options.colour,
    size: options.size,
  });
}

function sectionHeading(title: string, accent: string, fontSize: number) {
  return new Paragraph({
    spacing: { before: 160, after: 85 },
    border: {
      bottom: {
        color: accent,
        style: BorderStyle.SINGLE,
        size: 5,
        space: 3,
      },
    },
    children: [
      run(title.toUpperCase(), {
        bold: true,
        colour: accent,
        size: Math.round(fontSize * 2.02),
      }),
    ],
    keepNext: true,
  });
}

function itemTitle(title: string, date: string, fontSize: number, meta?: string) {
  const titleLine = [cleanText(title), cleanText(date)].filter(Boolean).join("  |  ");
  const paragraphs = [
    new Paragraph({
      spacing: { before: 55, after: meta ? 20 : 45 },
      keepNext: Boolean(meta),
      children: [run(titleLine, { bold: true, size: fontSize * 2 })],
    }),
  ];

  if (cleanText(meta ?? "")) {
    paragraphs.push(
      new Paragraph({
        spacing: { after: 45 },
        keepNext: true,
        children: [
          run(cleanText(meta ?? ""), { colour: "566273", size: Math.round(fontSize * 1.82) }),
        ],
      }),
    );
  }

  return paragraphs;
}

function bulletParagraph(text: string, fontSize: number) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 35 },
    children: [run(text, { size: fontSize * 2 })],
  });
}

function extraParagraphs(data: ResumeData, key: ExtraSectionKey, accent: string, fontSize: number) {
  const extra = data.extras[key];
  if (!extra?.enabled || !extra.items.length) return [];

  const paragraphs: Paragraph[] = [sectionHeading(EXTRA_SECTION_LABELS[key], accent, fontSize)];
  extra.items.forEach((item) => {
    const title = cleanText(item.title);
    const description = cleanText(item.description);
    if (title) {
      paragraphs.push(
        new Paragraph({
          spacing: { before: 45, after: description ? 20 : 45 },
          keepNext: Boolean(description),
          children: [run(title, { bold: true, size: fontSize * 2 })],
        }),
      );
    }
    if (description) {
      paragraphs.push(
        new Paragraph({
          spacing: { after: 55 },
          children: [run(description, { size: fontSize * 2 })],
        }),
      );
    }
  });
  return paragraphs;
}

function buildSection(
  key: string,
  data: ResumeData,
  accent: string,
  fontSize: number,
): Paragraph[] {
  if (key === "experience" && data.experience.length) {
    const paragraphs: Paragraph[] = [sectionHeading("Work Experience", accent, fontSize)];
    data.experience.forEach((item) => {
      paragraphs.push(
        ...itemTitle(
          item.jobTitle || "Job title",
          dateRange(item.startDate, item.endDate, item.current),
          fontSize,
          [item.company, item.city, item.country].map(cleanText).filter(Boolean).join(", "),
        ),
      );
      cleanBullets(item.bullets).forEach((bullet) =>
        paragraphs.push(bulletParagraph(bullet, fontSize)),
      );
    });
    return paragraphs;
  }

  if (key === "education" && data.education.length) {
    const paragraphs: Paragraph[] = [sectionHeading("Education", accent, fontSize)];
    data.education.forEach((item) => {
      paragraphs.push(
        ...itemTitle(
          [item.qualification, item.field].map(cleanText).filter(Boolean).join(" – "),
          dateRange(item.startDate, item.endDate),
          fontSize,
          [item.school, item.location].map(cleanText).filter(Boolean).join(", "),
        ),
      );
    });
    return paragraphs;
  }

  if (key === "skills" && (data.technicalSkills.length || data.softSkills.length)) {
    const paragraphs: Paragraph[] = [sectionHeading("Skills", accent, fontSize)];
    if (data.technicalSkills.length) {
      paragraphs.push(
        new Paragraph({
          spacing: { after: 45 },
          children: [
            run("Technical: ", { bold: true, size: fontSize * 2 }),
            run(data.technicalSkills.map(cleanText).filter(Boolean).join(" • "), {
              size: fontSize * 2,
            }),
          ],
        }),
      );
    }
    if (data.softSkills.length) {
      paragraphs.push(
        new Paragraph({
          spacing: { after: 45 },
          children: [
            run("Soft: ", { bold: true, size: fontSize * 2 }),
            run(data.softSkills.map(cleanText).filter(Boolean).join(" • "), {
              size: fontSize * 2,
            }),
          ],
        }),
      );
    }
    return paragraphs;
  }

  if (key === "languages" && data.languages.length) {
    return [
      sectionHeading("Languages", accent, fontSize),
      ...data.languages.map(
        (item) =>
          new Paragraph({
            spacing: { after: 30 },
            children: [
              run(`${cleanText(item.language)} — ${item.proficiency}`, { size: fontSize * 2 }),
            ],
          }),
      ),
    ];
  }

  if (key === "certifications" && data.certifications.length) {
    const paragraphs: Paragraph[] = [sectionHeading("Certifications", accent, fontSize)];
    data.certifications.forEach((item) => {
      paragraphs.push(
        ...itemTitle(
          [item.name, item.organisation].map(cleanText).filter(Boolean).join(", "),
          [item.date, item.expiry ? `Expires ${item.expiry}` : ""].filter(Boolean).join(" · "),
          fontSize,
        ),
      );
    });
    return paragraphs;
  }

  if (key in EXTRA_SECTION_LABELS) {
    return extraParagraphs(data, key as ExtraSectionKey, accent, fontSize);
  }

  return [];
}

export function createResumeDocx(options: ExportOptions) {
  const { data, settings, template, title } = options;
  const accent = wordColour(settings.accent);
  const fontSize = Math.max(9, Math.min(13, settings.fontSize));
  const font = settings.fontFamily === "serif" ? "Georgia" : "Arial";
  const personName = fullName(data.personal) || "Your Name";
  const alignHeader =
    template === "modern" || template === "graduate" ? AlignmentType.CENTER : AlignmentType.LEFT;
  const margin = Math.max(420, Math.min(1100, Math.round(settings.margin * 15)));
  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      alignment: alignHeader,
      spacing: { after: 40 },
      keepNext: true,
      children: [
        run(personName, {
          bold: true,
          colour: template === "minimal" ? "111111" : accent,
          size: Math.round(fontSize * (template === "executive" ? 4 : 3.5)),
        }),
      ],
    }),
  );

  if (cleanText(data.personal.title)) {
    children.push(
      new Paragraph({
        alignment: alignHeader,
        spacing: { after: 45 },
        keepNext: true,
        children: [
          run(cleanText(data.personal.title), {
            colour: "394557",
            size: Math.round(fontSize * 2.15),
          }),
        ],
      }),
    );
  }

  const contacts = contactItems(data);
  if (contacts.length) {
    children.push(
      new Paragraph({
        alignment: alignHeader,
        spacing: { after: 120 },
        border:
          template === "modern"
            ? {
                bottom: {
                  color: accent,
                  style: BorderStyle.SINGLE,
                  size: 10,
                  space: 5,
                },
              }
            : undefined,
        children: [
          run(contacts.join("  |  "), {
            colour: "566273",
            size: Math.round(fontSize * 1.72),
          }),
        ],
      }),
    );
  }

  if (cleanText(data.summary)) {
    children.push(
      sectionHeading("Professional Summary", accent, fontSize),
      new Paragraph({
        spacing: { after: 55 },
        children: [run(cleanText(data.summary), { size: fontSize * 2 })],
      }),
    );
  }

  const order =
    template === "graduate"
      ? ["education", ...data.sectionOrder.filter((key) => key !== "education")]
      : data.sectionOrder;
  order.forEach((key) => children.push(...buildSection(key, data, accent, fontSize)));

  const section: ISectionOptions = {
    properties: {
      page: {
        size: {
          width: 11_906,
          height: 16_838,
        },
        margin: {
          top: margin,
          right: margin,
          bottom: margin,
          left: margin,
        },
      },
    },
    children,
  };

  return new Document({
    creator: "NextStep CV UK",
    title: cleanText(title) || `${personName} CV`,
    description: data.targetJob
      ? `CV for ${cleanText(data.targetJob)}`
      : "Professional curriculum vitae",
    keywords: [data.targetJob, ...data.technicalSkills, ...data.softSkills]
      .map(cleanText)
      .filter(Boolean)
      .join(", "),
    styles: {
      default: {
        document: {
          run: {
            font,
            size: Math.round(fontSize * 2),
            color: "172033",
          },
          paragraph: {
            spacing: {
              line: Math.round(240 * settings.lineHeight),
            },
          },
        },
      },
    },
    sections: [section],
  });
}

export async function createResumeDocxBlob(options: ExportOptions) {
  return Packer.toBlob(createResumeDocx(options));
}

export async function downloadResumeDocx(options: ExportOptions) {
  const blob = await createResumeDocxBlob(options);
  const fileName = `${exportFileStem(options.title, options.data)}.docx`;
  return deliverBlob(blob, fileName);
}
