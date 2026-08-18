import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { AI_GUARDRAIL, chat, parseJson, toLines } from "./ai.server";

export const generateProfessionalSummary = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        targetJob: z.string().max(120),
        context: z.string().max(6000),
        style: z.enum(["default", "shorter", "professional", "confident"]).default("default"),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const styleNote = {
      default: "",
      shorter: "Keep it to two short sentences.",
      professional: "Make the tone more formal and professional.",
      confident: "Make the tone more confident, without exaggerating facts.",
    }[data.style];
    const text = await chat([
      { role: "system", content: AI_GUARDRAIL },
      {
        role: "user",
        content: `Write a professional summary (3 to 4 sentences max) for a UK CV.
Target role: ${data.targetJob || "not specified"}.
Only use the facts below. ${styleNote}
Return the paragraph only, no headings.

CV facts:
${data.context}`,
      },
    ]);
    return { text };
  });

export const improveExperience = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        jobTitle: z.string().max(120),
        company: z.string().max(120),
        text: z.string().max(4000),
        targetJob: z.string().max(120).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const raw = await chat([
      { role: "system", content: AI_GUARDRAIL },
      {
        role: "user",
        content: `Rewrite these notes into 3 to 5 professional CV bullet points for a ${data.jobTitle} at ${data.company}${
          data.targetJob ? `, aimed at a ${data.targetJob} role` : ""
        }. Start each with a strong action verb. Do not invent numbers or achievements.
Return one bullet per line, no bullet characters.

Notes:
${data.text}`,
      },
    ]);
    return { bullets: toLines(raw) };
  });

export const generateBulletPoints = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({ jobTitle: z.string().max(120), company: z.string().max(120).optional() })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const raw = await chat([
      { role: "system", content: AI_GUARDRAIL },
      {
        role: "user",
        content: `Suggest 5 realistic, generic CV bullet points describing typical duties of a ${data.jobTitle} in the UK.
No invented numbers, employers or achievements. One per line, no bullet characters.`,
      },
    ]);
    return { bullets: toLines(raw) };
  });

export const suggestSkills = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z.object({ targetJob: z.string().max(120), context: z.string().max(4000) }).parse(data),
  )
  .handler(async ({ data }) => {
    const raw = await chat([
      { role: "system", content: AI_GUARDRAIL },
      {
        role: "user",
        content: `Suggest relevant CV skills for a ${data.targetJob} in the UK based on this background:
${data.context}

Reply with JSON only: {"technical":["..."],"soft":["..."]} with up to 8 items each.`,
      },
    ]);
    return parseJson<{ technical: string[]; soft: string[] }>(raw, { technical: [], soft: [] });
  });

export const analyseCV = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z.object({ cv: z.string().max(12000), targetJob: z.string().max(120).optional() }).parse(data),
  )
  .handler(async ({ data }) => {
    const raw = await chat([
      { role: "system", content: AI_GUARDRAIL },
      {
        role: "user",
        content: `Score this UK CV for ATS compatibility and quality (0-100). Target role: ${
          data.targetJob || "unspecified"
        }.
Assess structure, length, keywords, skills, experience, summary, readability, essential sections and consistency.
Reply with JSON only:
{"score":number,"strong":["..."],"improve":["..."],"keywords":["..."]}

CV:
${data.cv}`,
      },
    ]);
    return parseJson(raw, { score: 0, strong: [], improve: [], keywords: [] as string[] });
  });

export const analyseJobMatch = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z.object({ cv: z.string().max(12000), jobDescription: z.string().max(12000) }).parse(data),
  )
  .handler(async ({ data }) => {
    const raw = await chat([
      { role: "system", content: AI_GUARDRAIL },
      {
        role: "user",
        content: `Compare this CV against the job description. Never invent experience to raise the score.
Reply with JSON only:
{"score":number,"matching":["..."],"missing":["..."],"recommendations":["..."]}

CV:
${data.cv}

JOB DESCRIPTION:
${data.jobDescription}`,
      },
    ]);
    return parseJson(raw, {
      score: 0,
      matching: [] as string[],
      missing: [] as string[],
      recommendations: [] as string[],
    });
  });

export const generateCoverLetter = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        cv: z.string().max(12000),
        company: z.string().max(160),
        jobTitle: z.string().max(160),
        jobDescription: z.string().max(8000).optional(),
        hiringManager: z.string().max(120).optional(),
        tone: z.enum(["professional", "friendly", "confident", "concise"]).default("professional"),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const text = await chat([
      { role: "system", content: AI_GUARDRAIL },
      {
        role: "user",
        content: `Write a ${data.tone} British English cover letter for the role of ${data.jobTitle} at ${data.company}.
Address it to ${data.hiringManager || "the Hiring Manager"}. Keep it under 350 words, no invented facts.

CANDIDATE CV:
${data.cv}

JOB DESCRIPTION:
${data.jobDescription || "not provided"}`,
      },
    ]);
    return { text };
  });

export const careerAssistant = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z.object({ question: z.string().max(2000), cv: z.string().max(12000).optional() }).parse(data),
  )
  .handler(async ({ data }) => {
    const text = await chat([
      { role: "system", content: AI_GUARDRAIL },
      {
        role: "user",
        content: `Question: ${data.question}\n\nThe user's current CV content:\n${data.cv || "empty"}\n\nAnswer helpfully and concisely.`,
      },
    ]);
    return { text };
  });
