import type { CSSProperties } from "react";
import {
  EXTRA_SECTION_LABELS,
  dateRange,
  fullName,
  type ExtraSectionKey,
  type ResumeData,
  type ResumeSettings,
  type TemplateId,
} from "@/lib/cv-types";

interface Props {
  data: ResumeData;
  settings: ResumeSettings;
  template: TemplateId;
}

function Section({
  title,
  accent,
  template,
  children,
}: {
  title: string;
  accent: string;
  template: TemplateId;
  children: React.ReactNode;
}) {
  const headingStyle: CSSProperties = {
    color: template === "minimal" ? "#111" : accent,
    fontSize: "1.02em",
    fontWeight: 700,
    letterSpacing: template === "executive" ? "0.14em" : "0.06em",
    textTransform: "uppercase",
    marginBottom: "0.35em",
    borderBottom:
      template === "professional" || template === "executive" ? `1px solid ${accent}33` : "none",
    paddingBottom: template === "professional" || template === "executive" ? "0.2em" : 0,
  };
  return (
    <section style={{ marginBottom: "1.1em" }}>
      <h2 style={headingStyle}>{title}</h2>
      {template === "modern" && (
        <div style={{ height: 2, width: 42, background: accent, marginBottom: "0.5em" }} />
      )}
      {children}
    </section>
  );
}

export function cleanBullet(text: string) {
  return text
    .replace(/^\s*(?:[*•\-–—]|\d+[.)])\s+/, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/^\*+|\*+$/g, "")
    .trim();
}

export function toBulletList(input: string | string[]): string[] {
  const raw = Array.isArray(input) ? input : input.split(/\r?\n|(?:\s+[•*]\s+)/);
  return raw
    .flatMap((line) => line.split(/\r?\n/))
    .map(cleanBullet)
    .filter(Boolean);
}

function Bullets({ items }: { items: string[] }) {
  const cleaned = toBulletList(items);
  if (!cleaned.length) return null;
  return (
    <ul style={{ margin: "0.25em 0 0 1.1em", padding: 0, listStyle: "disc" }}>
      {cleaned.map((item, index) => (
        <li key={index} style={{ marginBottom: "0.15em" }}>
          {item}
        </li>
      ))}
    </ul>
  );
}

export function CvDocument({ data, settings, template }: Props) {
  const accent = settings.accent;
  const { personal } = data;
  const name = fullName(personal) || "Your Name";
  const contact = [
    personal.email,
    personal.phone,
    [personal.city, personal.country].filter(Boolean).join(", "),
    personal.linkedin,
    personal.website,
  ].filter(Boolean);

  const blocks: Record<string, React.ReactNode> = {
    experience: data.experience.length ? (
      <Section key="experience" title="Work Experience" accent={accent} template={template}>
        {data.experience.map((item) => (
          <div key={item.id} style={{ marginBottom: "0.7em" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "1em" }}>
              <strong>{item.jobTitle || "Job title"}</strong>
              <span style={{ whiteSpace: "nowrap", color: "#555" }}>
                {dateRange(item.startDate, item.endDate, item.current)}
              </span>
            </div>
            <div style={{ color: "#555" }}>
              {[item.company, item.city, item.country].filter(Boolean).join(", ")}
            </div>
            <Bullets items={item.bullets.filter(Boolean)} />
          </div>
        ))}
      </Section>
    ) : null,
    education: data.education.length ? (
      <Section key="education" title="Education" accent={accent} template={template}>
        {data.education.map((item) => (
          <div key={item.id} style={{ marginBottom: "0.5em" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "1em" }}>
              <strong>{[item.qualification, item.field].filter(Boolean).join(" – ")}</strong>
              <span style={{ whiteSpace: "nowrap", color: "#555" }}>
                {dateRange(item.startDate, item.endDate)}
              </span>
            </div>
            <div style={{ color: "#555" }}>
              {[item.school, item.location].filter(Boolean).join(", ")}
            </div>
          </div>
        ))}
      </Section>
    ) : null,
    skills:
      data.technicalSkills.length || data.softSkills.length ? (
        <Section key="skills" title="Skills" accent={accent} template={template}>
          {data.technicalSkills.length > 0 && (
            <div>
              <strong>Technical: </strong>
              {data.technicalSkills.join(" • ")}
            </div>
          )}
          {data.softSkills.length > 0 && (
            <div>
              <strong>Soft: </strong>
              {data.softSkills.join(" • ")}
            </div>
          )}
        </Section>
      ) : null,
    languages: data.languages.length ? (
      <Section key="languages" title="Languages" accent={accent} template={template}>
        {data.languages.map((item) => (
          <div key={item.id}>
            {item.language} — {item.proficiency}
          </div>
        ))}
      </Section>
    ) : null,
    certifications: data.certifications.length ? (
      <Section key="certifications" title="Certifications" accent={accent} template={template}>
        {data.certifications.map((item) => (
          <div
            key={item.id}
            style={{ display: "flex", justifyContent: "space-between", gap: "1em" }}
          >
            <span>{[item.name, item.organisation].filter(Boolean).join(", ")}</span>
            <span style={{ whiteSpace: "nowrap", color: "#555" }}>{item.date}</span>
          </div>
        ))}
      </Section>
    ) : null,
  };

  (Object.keys(EXTRA_SECTION_LABELS) as ExtraSectionKey[]).forEach((key) => {
    const section = data.extras[key];
    if (!section?.enabled || !section.items.length) return;
    blocks[key] = (
      <Section key={key} title={EXTRA_SECTION_LABELS[key]} accent={accent} template={template}>
        {section.items.map((item) => (
          <div key={item.id} style={{ marginBottom: "0.35em" }}>
            {item.title && <strong>{item.title}</strong>}
            {item.description && <div>{item.description}</div>}
          </div>
        ))}
      </Section>
    );
  });

  const ordered = data.sectionOrder.map((key) => blocks[key]).filter(Boolean);

  const pageStyle: CSSProperties = {
    width: "210mm",
    minHeight: "297mm",
    background: "#fff",
    color: "#1a1a1a",
    padding: `${settings.margin}px`,
    ["--cv-margin" as string]: `${settings.margin}px`,
    fontFamily:
      settings.fontFamily === "serif"
        ? "Georgia, 'Times New Roman', serif"
        : "Arial, Helvetica, sans-serif",
    fontSize: `${settings.fontSize}pt`,
    lineHeight: settings.lineHeight,
    boxSizing: "border-box",
  };

  const header = (
    <header
      style={{
        marginBottom: "1.1em",
        textAlign: template === "modern" || template === "graduate" ? "center" : "left",
        borderBottom: template === "modern" ? `2px solid ${accent}` : "none",
        paddingBottom: template === "modern" ? "0.6em" : 0,
        background: template === "executive" ? `${accent}0f` : "transparent",
        padding: template === "executive" ? "0.8em" : undefined,
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: template === "executive" ? "2em" : "1.75em",
          letterSpacing: template === "executive" ? "0.05em" : "-0.01em",
          color: template === "minimal" ? "#111" : accent,
          textTransform: template === "executive" ? "uppercase" : "none",
        }}
      >
        {name}
      </h1>
      {personal.title && (
        <div style={{ fontSize: "1.05em", color: "#444", marginTop: "0.15em" }}>
          {personal.title}
        </div>
      )}
      <div style={{ marginTop: "0.4em", color: "#555", fontSize: "0.92em" }}>
        {contact.join("  |  ")}
      </div>
    </header>
  );

  const summaryBlock = data.summary ? (
    <Section title="Professional Summary" accent={accent} template={template}>
      <p style={{ margin: 0 }}>{data.summary}</p>
    </Section>
  ) : null;

  if (template === "creative") {
    return (
      <div style={pageStyle} className="print-page">
        <div style={{ display: "flex", gap: "1.4em" }}>
          <aside
            style={{ width: "32%", borderRight: `2px solid ${accent}22`, paddingRight: "1em" }}
          >
            <h1 style={{ margin: 0, fontSize: "1.5em", color: accent }}>{name}</h1>
            {personal.title && <div style={{ color: "#444" }}>{personal.title}</div>}
            <div style={{ marginTop: "0.8em", color: "#555", fontSize: "0.92em" }}>
              {contact.map((line) => (
                <div key={line} style={{ marginBottom: "0.2em", wordBreak: "break-word" }}>
                  {line}
                </div>
              ))}
            </div>
            <div style={{ marginTop: "1em" }}>{blocks["skills"]}</div>
            <div>{blocks["languages"]}</div>
          </aside>
          <main style={{ flex: 1 }}>
            {summaryBlock}
            {data.sectionOrder
              .filter((key) => key !== "skills" && key !== "languages")
              .map((key) => blocks[key])
              .filter(Boolean)}
          </main>
        </div>
      </div>
    );
  }

  if (template === "graduate") {
    return (
      <div style={pageStyle} className="print-page">
        {header}
        {summaryBlock}
        {blocks["education"]}
        {data.sectionOrder
          .filter((key) => key !== "education")
          .map((key) => blocks[key])
          .filter(Boolean)}
      </div>
    );
  }

  return (
    <div style={pageStyle} className="print-page">
      {header}
      {summaryBlock}
      {ordered}
    </div>
  );
}

export function resumeToPlainText(data: ResumeData) {
  const lines: string[] = [];
  lines.push(fullName(data.personal), data.personal.title, `Target role: ${data.targetJob}`);
  if (data.summary) lines.push("SUMMARY", data.summary);
  if (data.experience.length) {
    lines.push("EXPERIENCE");
    data.experience.forEach((item) => {
      lines.push(
        `${item.jobTitle} at ${item.company} (${dateRange(item.startDate, item.endDate, item.current)})`,
      );
      item.bullets.forEach((bullet) => lines.push(`- ${bullet}`));
    });
  }
  if (data.education.length) {
    lines.push("EDUCATION");
    data.education.forEach((item) =>
      lines.push(
        `${item.qualification} ${item.field} - ${item.school} (${dateRange(item.startDate, item.endDate)})`,
      ),
    );
  }
  if (data.technicalSkills.length)
    lines.push(`TECHNICAL SKILLS: ${data.technicalSkills.join(", ")}`);
  if (data.softSkills.length) lines.push(`SOFT SKILLS: ${data.softSkills.join(", ")}`);
  if (data.languages.length)
    lines.push(
      `LANGUAGES: ${data.languages.map((l) => `${l.language} (${l.proficiency})`).join(", ")}`,
    );
  if (data.certifications.length)
    lines.push(
      `CERTIFICATIONS: ${data.certifications.map((c) => `${c.name} ${c.organisation}`).join(", ")}`,
    );
  return lines.filter(Boolean).join("\n");
}
