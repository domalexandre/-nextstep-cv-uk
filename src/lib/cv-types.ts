export type ProficiencyLevel = "Native" | "Fluent" | "Advanced" | "Intermediate" | "Basic";

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  linkedin: string;
  website: string;
  photoUrl?: string;
}

export interface ExperienceItem {
  id: string;
  jobTitle: string;
  company: string;
  city: string;
  country: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface EducationItem {
  id: string;
  school: string;
  qualification: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string;
}

export interface LanguageItem {
  id: string;
  language: string;
  proficiency: ProficiencyLevel;
}

export interface CertificationItem {
  id: string;
  name: string;
  organisation: string;
  date: string;
  expiry: string;
}

export interface SimpleItem {
  id: string;
  title: string;
  description: string;
}

export type ExtraSectionKey =
  "projects" | "awards" | "volunteering" | "courses" | "publications" | "interests" | "references";

export interface ResumeData {
  personal: PersonalInfo;
  targetJob: string;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  technicalSkills: string[];
  softSkills: string[];
  languages: LanguageItem[];
  certifications: CertificationItem[];
  extras: Record<ExtraSectionKey, { enabled: boolean; items: SimpleItem[] }>;
  sectionOrder: string[];
}

export interface ResumeSettings {
  fontFamily: "sans" | "serif";
  fontSize: number;
  lineHeight: number;
  accent: string;
  margin: number;
}

export const TEMPLATES = [
  {
    id: "professional",
    name: "Professional",
    blurb: "Timeless single column, recruiter friendly.",
  },
  { id: "modern", name: "Modern", blurb: "Clean accent rules and confident headings." },
  { id: "minimal", name: "Minimal", blurb: "Quiet typography, maximum readability." },
  { id: "executive", name: "Executive", blurb: "Senior-level structure with strong hierarchy." },
  { id: "graduate", name: "Graduate", blurb: "Education first, ideal with little experience." },
  { id: "creative", name: "Creative", blurb: "Sidebar layout that stays ATS-safe." },
] as const;

export type TemplateId = (typeof TEMPLATES)[number]["id"];

export const UK_JOB_EXAMPLES = [
  "Warehouse Operative",
  "Cleaner",
  "Software Developer",
  "Customer Service Assistant",
  "Porter",
  "Security Officer",
  "Chef",
  "Administrative Assistant",
  "Sales Assistant",
  "Project Manager",
];

export const EXTRA_SECTION_LABELS: Record<ExtraSectionKey, string> = {
  projects: "Projects",
  awards: "Awards",
  volunteering: "Volunteering",
  courses: "Courses",
  publications: "Publications",
  interests: "Interests",
  references: "References",
};

export const DEFAULT_SECTION_ORDER = [
  "experience",
  "education",
  "skills",
  "languages",
  "certifications",
  "projects",
  "awards",
  "volunteering",
  "courses",
  "publications",
  "interests",
  "references",
];

export const defaultSettings: ResumeSettings = {
  fontFamily: "sans",
  fontSize: 10.5,
  lineHeight: 1.45,
  accent: "#123a63",
  margin: 40,
};

export function emptyResume(): ResumeData {
  return {
    personal: {
      firstName: "",
      lastName: "",
      title: "",
      email: "",
      phone: "",
      city: "",
      country: "United Kingdom",
      linkedin: "",
      website: "",
    },
    targetJob: "",
    summary: "",
    experience: [],
    education: [],
    technicalSkills: [],
    softSkills: [],
    languages: [],
    certifications: [],
    extras: {
      projects: { enabled: false, items: [] },
      awards: { enabled: false, items: [] },
      volunteering: { enabled: false, items: [] },
      courses: { enabled: false, items: [] },
      publications: { enabled: false, items: [] },
      interests: { enabled: false, items: [] },
      references: { enabled: false, items: [] },
    },
    sectionOrder: [...DEFAULT_SECTION_ORDER],
  };
}

export function mergeResume(raw: unknown): ResumeData {
  const base = emptyResume();
  if (!raw || typeof raw !== "object") return base;
  const value = raw as Partial<ResumeData>;
  return {
    ...base,
    ...value,
    personal: { ...base.personal, ...(value.personal ?? {}) },
    extras: { ...base.extras, ...(value.extras ?? {}) },
    sectionOrder: value.sectionOrder?.length ? value.sectionOrder : base.sectionOrder,
  };
}

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function fullName(personal: PersonalInfo) {
  return [personal.firstName, personal.lastName].filter(Boolean).join(" ");
}

export function dateRange(start: string, end: string, current?: boolean) {
  const to = current ? "Present" : end;
  return [start, to].filter(Boolean).join(" – ");
}
