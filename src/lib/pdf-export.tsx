import { Fragment, type ReactNode } from "react";
import { Document as PdfDocument, Page, StyleSheet, Text, View, pdf } from "@react-pdf/renderer";
import {
  EXTRA_SECTION_LABELS,
  dateRange,
  fullName,
  type ExtraSectionKey,
  type ResumeData,
  type ResumeSettings,
  type TemplateId,
} from "@/lib/cv-types";
import {
  accentColour,
  cleanBullets,
  cleanText,
  contactItems,
  deliverBlob,
  exportFileStem,
  type ExportOptions,
} from "@/lib/export-shared";

const ink = "#172033";
const muted = "#536072";
const lightRule = "#D9E0E8";

function buildStyles(settings: ResumeSettings, template: TemplateId) {
  const accent = accentColour(settings.accent);
  const margin = Math.max(22, Math.min(54, settings.margin * 0.75));
  const fontSize = Math.max(8.5, Math.min(13, settings.fontSize));
  const fontFamily = settings.fontFamily === "serif" ? "Times-Roman" : "Helvetica";
  const headingFamily = settings.fontFamily === "serif" ? "Times-Bold" : "Helvetica-Bold";

  return StyleSheet.create({
    page: {
      backgroundColor: "#FFFFFF",
      color: ink,
      fontFamily,
      fontSize,
      lineHeight: settings.lineHeight,
      paddingTop: margin,
      paddingRight: margin,
      paddingBottom: margin,
      paddingLeft: margin,
    },
    header: {
      marginBottom: fontSize * 1.2,
      paddingBottom: template === "modern" ? fontSize * 0.65 : 0,
      borderBottomWidth: template === "modern" ? 2 : 0,
      borderBottomColor: accent,
      backgroundColor: template === "executive" ? "#F3F6F9" : "#FFFFFF",
      padding: template === "executive" ? fontSize * 0.8 : 0,
      textAlign: template === "modern" || template === "graduate" ? "center" : "left",
    },
    name: {
      color: template === "minimal" ? "#111111" : accent,
      fontFamily: headingFamily,
      fontSize: template === "executive" ? fontSize * 2 : fontSize * 1.75,
      lineHeight: 1.12,
      letterSpacing: template === "executive" ? 1.2 : -0.1,
      textTransform: template === "executive" ? "uppercase" : "none",
    },
    jobTitle: {
      color: "#394557",
      fontSize: fontSize * 1.06,
      marginTop: fontSize * 0.2,
    },
    contact: {
      color: muted,
      fontSize: fontSize * 0.86,
      marginTop: fontSize * 0.45,
    },
    section: {
      marginBottom: fontSize * 0.95,
    },
    sectionTitle: {
      color: template === "minimal" ? "#111111" : accent,
      fontFamily: headingFamily,
      fontSize: fontSize * 1.01,
      letterSpacing: template === "executive" ? 1.15 : 0.55,
      textTransform: "uppercase",
      paddingBottom: template === "professional" || template === "executive" ? fontSize * 0.18 : 0,
      marginBottom: template === "modern" ? fontSize * 0.22 : fontSize * 0.34,
      borderBottomWidth: template === "professional" || template === "executive" ? 0.7 : 0,
      borderBottomColor: lightRule,
    },
    modernRule: {
      backgroundColor: accent,
      height: 1.8,
      width: 34,
      marginBottom: fontSize * 0.42,
    },
    paragraph: {
      margin: 0,
    },
    item: {
      marginBottom: fontSize * 0.62,
    },
    itemHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    itemTitle: {
      fontFamily: headingFamily,
      paddingRight: 10,
      flexGrow: 1,
      flexBasis: 0,
    },
    itemDate: {
      color: muted,
      fontSize: fontSize * 0.88,
      flexShrink: 0,
      textAlign: "right",
    },
    itemMeta: {
      color: muted,
      marginTop: fontSize * 0.08,
    },
    bulletRow: {
      flexDirection: "row",
      marginTop: fontSize * 0.18,
      paddingLeft: fontSize * 0.32,
    },
    bulletMark: {
      width: fontSize * 1.05,
    },
    bulletText: {
      flexGrow: 1,
      flexBasis: 0,
    },
    label: {
      fontFamily: headingFamily,
    },
    creativeLayout: {
      flexDirection: "row",
    },
    creativeSidebar: {
      width: "31%",
      paddingRight: fontSize * 1.15,
      borderRightWidth: 1.5,
      borderRightColor: lightRule,
    },
    creativeMain: {
      width: "69%",
      paddingLeft: fontSize * 1.35,
    },
    creativeName: {
      color: accent,
      fontFamily: headingFamily,
      fontSize: fontSize * 1.48,
      lineHeight: 1.1,
    },
    creativeContact: {
      color: muted,
      fontSize: fontSize * 0.84,
      marginTop: fontSize * 0.75,
    },
    creativeContactLine: {
      marginBottom: fontSize * 0.24,
    },
  });
}

type PdfStyles = ReturnType<typeof buildStyles>;

function Section({
  title,
  template,
  styles,
  children,
}: {
  title: string;
  template: TemplateId;
  styles: PdfStyles;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {template === "modern" ? <View style={styles.modernRule} /> : null}
      {children}
    </View>
  );
}

function BulletList({ items, styles }: { items: string[]; styles: PdfStyles }) {
  const bullets = cleanBullets(items);
  if (!bullets.length) return null;

  return (
    <View>
      {bullets.map((bullet, index) => (
        <View key={`${bullet}-${index}`} style={styles.bulletRow}>
          <Text style={styles.bulletMark}>•</Text>
          <Text style={styles.bulletText}>{bullet}</Text>
        </View>
      ))}
    </View>
  );
}

function buildSections(
  data: ResumeData,
  settings: ResumeSettings,
  template: TemplateId,
  styles: PdfStyles,
) {
  const blocks: Partial<Record<string, ReactNode>> = {};

  if (data.experience.length) {
    blocks.experience = (
      <Section title="Work Experience" template={template} styles={styles}>
        {data.experience.map((item) => (
          <View key={item.id} style={styles.item} minPresenceAhead={36}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle}>{cleanText(item.jobTitle) || "Job title"}</Text>
              <Text style={styles.itemDate}>
                {dateRange(item.startDate, item.endDate, item.current)}
              </Text>
            </View>
            <Text style={styles.itemMeta}>
              {[item.company, item.city, item.country].map(cleanText).filter(Boolean).join(", ")}
            </Text>
            <BulletList items={item.bullets} styles={styles} />
          </View>
        ))}
      </Section>
    );
  }

  if (data.education.length) {
    blocks.education = (
      <Section title="Education" template={template} styles={styles}>
        {data.education.map((item) => (
          <View key={item.id} style={styles.item} wrap={false}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle}>
                {[item.qualification, item.field].map(cleanText).filter(Boolean).join(" – ")}
              </Text>
              <Text style={styles.itemDate}>{dateRange(item.startDate, item.endDate)}</Text>
            </View>
            <Text style={styles.itemMeta}>
              {[item.school, item.location].map(cleanText).filter(Boolean).join(", ")}
            </Text>
          </View>
        ))}
      </Section>
    );
  }

  if (data.technicalSkills.length || data.softSkills.length) {
    blocks.skills = (
      <Section title="Skills" template={template} styles={styles}>
        {data.technicalSkills.length ? (
          <Text>
            <Text style={styles.label}>Technical: </Text>
            {data.technicalSkills.map(cleanText).filter(Boolean).join(" • ")}
          </Text>
        ) : null}
        {data.softSkills.length ? (
          <Text>
            <Text style={styles.label}>Soft: </Text>
            {data.softSkills.map(cleanText).filter(Boolean).join(" • ")}
          </Text>
        ) : null}
      </Section>
    );
  }

  if (data.languages.length) {
    blocks.languages = (
      <Section title="Languages" template={template} styles={styles}>
        {data.languages.map((item) => (
          <Text key={item.id}>
            {cleanText(item.language)} — {item.proficiency}
          </Text>
        ))}
      </Section>
    );
  }

  if (data.certifications.length) {
    blocks.certifications = (
      <Section title="Certifications" template={template} styles={styles}>
        {data.certifications.map((item) => (
          <View key={item.id} style={styles.itemHeader} wrap={false}>
            <Text style={styles.itemTitle}>
              {[item.name, item.organisation].map(cleanText).filter(Boolean).join(", ")}
            </Text>
            <Text style={styles.itemDate}>
              {[item.date, item.expiry ? `Expires ${item.expiry}` : ""].filter(Boolean).join(" · ")}
            </Text>
          </View>
        ))}
      </Section>
    );
  }

  (Object.keys(EXTRA_SECTION_LABELS) as ExtraSectionKey[]).forEach((key) => {
    const extra = data.extras[key];
    if (!extra?.enabled || !extra.items.length) return;
    blocks[key] = (
      <Section title={EXTRA_SECTION_LABELS[key]} template={template} styles={styles}>
        {extra.items.map((item) => (
          <View key={item.id} style={styles.item} minPresenceAhead={20}>
            {cleanText(item.title) ? (
              <Text style={styles.label}>{cleanText(item.title)}</Text>
            ) : null}
            {cleanText(item.description) ? <Text>{cleanText(item.description)}</Text> : null}
          </View>
        ))}
      </Section>
    );
  });

  return blocks;
}

function ResumePdf({ data, settings, template, title }: ExportOptions) {
  const styles = buildStyles(settings, template);
  const blocks = buildSections(data, settings, template, styles);
  const personName = fullName(data.personal) || "Your Name";
  const contacts = contactItems(data);
  const summary = cleanText(data.summary);
  const summaryBlock = summary ? (
    <Section title="Professional Summary" template={template} styles={styles}>
      <Text style={styles.paragraph}>{summary}</Text>
    </Section>
  ) : null;

  const header = (
    <View style={styles.header}>
      <Text style={styles.name}>{personName}</Text>
      {cleanText(data.personal.title) ? (
        <Text style={styles.jobTitle}>{cleanText(data.personal.title)}</Text>
      ) : null}
      {contacts.length ? <Text style={styles.contact}>{contacts.join("  |  ")}</Text> : null}
    </View>
  );

  const renderBlocks = (keys: string[]) =>
    keys.map((key) => (blocks[key] ? <Fragment key={key}>{blocks[key]}</Fragment> : null));
  const ordered = renderBlocks(data.sectionOrder);

  return (
    <PdfDocument
      title={cleanText(title) || `${personName} CV`}
      author={personName}
      subject={data.targetJob ? `CV for ${cleanText(data.targetJob)}` : "Curriculum Vitae"}
      keywords={[data.targetJob, ...data.technicalSkills, ...data.softSkills]
        .map(cleanText)
        .filter(Boolean)
        .join(", ")}
      creator="NextStep CV UK"
      producer="NextStep CV UK"
    >
      <Page size="A4" style={styles.page} wrap>
        {template === "creative" ? (
          <View style={styles.creativeLayout}>
            <View style={styles.creativeSidebar}>
              <Text style={styles.creativeName}>{personName}</Text>
              {cleanText(data.personal.title) ? (
                <Text style={styles.jobTitle}>{cleanText(data.personal.title)}</Text>
              ) : null}
              {contacts.length ? (
                <View style={styles.creativeContact}>
                  {contacts.map((contact) => (
                    <Text key={contact} style={styles.creativeContactLine}>
                      {contact}
                    </Text>
                  ))}
                </View>
              ) : null}
              {blocks.skills}
              {blocks.languages}
            </View>
            <View style={styles.creativeMain}>
              {summaryBlock}
              {renderBlocks(
                data.sectionOrder.filter((key) => key !== "skills" && key !== "languages"),
              )}
            </View>
          </View>
        ) : template === "graduate" ? (
          <>
            {header}
            {summaryBlock}
            {blocks.education}
            {renderBlocks(data.sectionOrder.filter((key) => key !== "education"))}
          </>
        ) : (
          <>
            {header}
            {summaryBlock}
            {ordered}
          </>
        )}
      </Page>
    </PdfDocument>
  );
}

export async function createResumePdfBlob(options: ExportOptions) {
  return pdf(<ResumePdf {...options} />).toBlob();
}

export async function downloadResumePdf(options: ExportOptions) {
  const blob = await createResumePdfBlob(options);
  const fileName = `${exportFileStem(options.title, options.data)}.pdf`;
  return deliverBlob(blob, fileName);
}
