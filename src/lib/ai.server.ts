const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

export const AI_GUARDRAIL = `You are NextStep AI, a British English CV expert for the UK job market.
Absolute rule: you may rewrite and improve how information is presented, but you must NEVER invent
jobs, employers, dates, qualifications, certificates, metrics or results that the user did not provide.
If information is missing, say what the user should add instead of fabricating it.
Always use British English spelling. Never use em dashes.`;

export async function chat(
  messages: { role: "system" | "user"; content: string }[],
  options?: { temperature?: number },
): Promise<string> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured");

  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3.5-flash",
      temperature: options?.temperature ?? 0.6,
      messages,
    }),
  });

  if (res.status === 429)
    throw new Error("Too many AI requests just now. Please try again shortly.");
  if (res.status === 402) throw new Error("AI credits are exhausted for this workspace.");
  if (!res.ok) throw new Error(`AI request failed (${res.status})`);

  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return json.choices?.[0]?.message?.content?.trim() ?? "";
}

export function parseJson<T>(raw: string, fallback: T): T {
  const match = raw.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (!match) return fallback;
  try {
    return JSON.parse(match[0]) as T;
  } catch {
    return fallback;
  }
}

export function toLines(raw: string): string[] {
  return raw
    .split("\n")
    .map((line) => line.replace(/^\s*[-*\u2022\d.]+\s*/, "").trim())
    .filter((line) => line.length > 3)
    .slice(0, 8);
}
