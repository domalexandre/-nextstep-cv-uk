import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowDown, ArrowUp, Check, Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CvDocument, resumeToPlainText } from "@/components/cv/CvDocument";
import { ResumeExportButtons } from "@/components/cv/ResumeExportButtons";
import {
  DEFAULT_SECTION_ORDER,
  EXTRA_SECTION_LABELS,
  TEMPLATES,
  UK_JOB_EXAMPLES,
  defaultSettings,
  emptyResume,
  mergeResume,
  uid,
  type ExtraSectionKey,
  type ResumeData,
  type ResumeSettings,
  type TemplateId,
} from "@/lib/cv-types";
import {
  generateBulletPoints,
  generateProfessionalSummary,
  improveExperience,
  suggestSkills,
} from "@/lib/ai.functions";

const STEPS = [
  "Personal",
  "Summary",
  "Experience",
  "Education",
  "Skills",
  "Extras",
  "Design",
] as const;

const GUEST_KEY = "nextstep-guest-cv";

export function CvBuilder({ resumeId }: { resumeId?: string }) {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<ResumeData>(emptyResume);
  const [settings, setSettings] = useState<ResumeSettings>(defaultSettings);
  const [template, setTemplate] = useState<TemplateId>("professional");
  const [title, setTitle] = useState("Untitled CV");
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");
  const [busy, setBusy] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const firstRun = useRef(true);

  const aiSummary = useServerFn(generateProfessionalSummary);
  const aiImprove = useServerFn(improveExperience);
  const aiBullets = useServerFn(generateBulletPoints);
  const aiSkills = useServerFn(suggestSkills);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (resumeId) {
        const { data: row, error } = await supabase
          .from("resumes")
          .select("*")
          .eq("id", resumeId)
          .maybeSingle();
        if (!cancelled && row && !error) {
          setData(mergeResume(row.data));
          setSettings({ ...defaultSettings, ...(row.settings as Partial<ResumeSettings>) });
          setTemplate((row.template as TemplateId) ?? "professional");
          setTitle(row.title ?? "Untitled CV");
        }
      } else if (typeof window !== "undefined") {
        const stored = window.localStorage.getItem(GUEST_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setData(mergeResume(parsed.data));
            setSettings({ ...defaultSettings, ...parsed.settings });
            setTemplate(parsed.template ?? "professional");
            setTitle(parsed.title ?? "Untitled CV");
          } catch {
            /* ignore corrupt draft */
          }
        }
      }
      if (!cancelled) setLoaded(true);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [resumeId]);

  // Autosave
  useEffect(() => {
    if (!loaded) return;
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setStatus("saving");
    const timer = setTimeout(async () => {
      if (resumeId && user) {
        await supabase
          .from("resumes")
          .update({
            data: data as never,
            settings: settings as never,
            template,
            title,
            target_job: data.targetJob,
          })
          .eq("id", resumeId);
      } else if (typeof window !== "undefined") {
        window.localStorage.setItem(GUEST_KEY, JSON.stringify({ data, settings, template, title }));
      }
      setStatus("saved");
    }, 800);
    return () => clearTimeout(timer);
  }, [data, settings, template, title, resumeId, user, loaded]);

  const update = useCallback((patch: Partial<ResumeData>) => {
    setData((current) => ({ ...current, ...patch }));
  }, []);

  const plainText = useMemo(() => resumeToPlainText(data), [data]);

  async function runAi(key: string, action: () => Promise<void>) {
    setBusy(key);
    try {
      await action();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "AI request failed");
    } finally {
      setBusy(null);
    }
  }

  async function saveToAccount() {
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    const { data: row, error } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        title,
        template,
        target_job: data.targetJob,
        data: data as never,
        settings: settings as never,
      })
      .select("id")
      .single();
    if (error || !row) {
      toast.error("Could not save your CV");
      return;
    }
    toast.success("CV saved to your account");
    navigate({ to: "/builder/$id", params: { id: row.id } });
  }

  async function finishCv() {
    setFinishing(true);
    try {
      if (user) {
        if (resumeId) {
          const { error } = await supabase
            .from("resumes")
            .update({
              data: data as never,
              settings: settings as never,
              template,
              title,
              target_job: data.targetJob,
              completed: true,
              completed_at: new Date().toISOString(),
            })
            .eq("id", resumeId);
          if (error) throw error;
          toast.success("CV completed — here is your finished CV");
          navigate({ to: "/preview/$id", params: { id: resumeId } });
          return;
        }
        const { data: row, error } = await supabase
          .from("resumes")
          .insert({
            user_id: user.id,
            title,
            template,
            target_job: data.targetJob,
            data: data as never,
            settings: settings as never,
            completed: true,
            completed_at: new Date().toISOString(),
          })
          .select("id")
          .single();
        if (error || !row) throw error ?? new Error("Could not save your CV");
        toast.success("CV completed and saved to your account");
        navigate({ to: "/preview/$id", params: { id: row.id } });
        return;
      }
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          GUEST_KEY,
          JSON.stringify({ data, settings, template, title, completed: true }),
        );
      }
      toast.success("CV completed — here is your finished CV");
      navigate({ to: "/preview" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not finish your CV");
    } finally {
      setFinishing(false);
    }
  }

  const moveSection = (index: number, direction: -1 | 1) => {
    const order = [...data.sectionOrder];
    const target = index + direction;
    if (target < 0 || target >= order.length) return;
    const [item] = order.splice(index, 1);
    order.splice(target, 0, item as string);
    update({ sectionOrder: order });
  };

  return (
    <div className="mx-auto max-w-[1500px] px-3 py-4 lg:px-6">
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="h-9 w-52 font-medium"
            aria-label="CV name"
          />
          <span className="text-xs text-muted-foreground">
            {status === "saving" ? "Saving…" : status === "saved" ? "Saved" : ""}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-border p-0.5 lg:hidden">
            {(["edit", "preview"] as const).map((view) => (
              <button
                key={view}
                onClick={() => setMobileView(view)}
                className={`rounded-md px-3 py-1 text-xs capitalize ${
                  mobileView === view
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {view}
              </button>
            ))}
          </div>
          {!resumeId && (
            <Button variant="outline" size="sm" onClick={saveToAccount} disabled={authLoading}>
              Save to my account
            </Button>
          )}
          <ResumeExportButtons
            data={data}
            settings={settings}
            template={template}
            title={title}
            compact
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className={`no-print ${mobileView === "preview" ? "hidden lg:block" : ""}`}>
          <div className="surface-card p-4">
            <div className="mb-4 flex flex-wrap gap-1.5">
              {STEPS.map((label, index) => (
                <button
                  key={label}
                  onClick={() => setStep(index)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    step === index
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {index + 1}. {label}
                </button>
              ))}
            </div>

            {step === 0 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    ["firstName", "First Name"],
                    ["lastName", "Last Name"],
                    ["title", "Professional Title"],
                    ["email", "Email"],
                    ["phone", "Phone Number"],
                    ["city", "City"],
                    ["country", "Country"],
                    ["linkedin", "LinkedIn"],
                    ["website", "Portfolio / Website"],
                  ] as const
                ).map(([field, label]) => (
                  <div key={field} className="space-y-1.5">
                    <Label htmlFor={field}>{label}</Label>
                    <Input
                      id={field}
                      value={data.personal[field] ?? ""}
                      maxLength={200}
                      onChange={(event) =>
                        update({ personal: { ...data.personal, [field]: event.target.value } })
                      }
                    />
                  </div>
                ))}
                <p className="text-xs text-muted-foreground sm:col-span-2">
                  UK CVs should not include age, gender, marital status or a photo. Keep it to the
                  facts.
                </p>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="targetJob">What job are you looking for?</Label>
                  <Input
                    id="targetJob"
                    value={data.targetJob}
                    placeholder="e.g. Warehouse Operative"
                    onChange={(event) => update({ targetJob: event.target.value })}
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {UK_JOB_EXAMPLES.map((job) => (
                      <button
                        key={job}
                        onClick={() => update({ targetJob: job })}
                        className="rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        {job}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="summary">Professional Summary</Label>
                  <Textarea
                    id="summary"
                    rows={6}
                    value={data.summary}
                    maxLength={1200}
                    onChange={(event) => update({ summary: event.target.value })}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      ["default", "Generate with AI"],
                      ["shorter", "Make shorter"],
                      ["professional", "More professional"],
                      ["confident", "More confident"],
                    ] as const
                  ).map(([style, label]) => (
                    <Button
                      key={style}
                      size="sm"
                      variant={style === "default" ? "default" : "outline"}
                      disabled={busy !== null}
                      onClick={() =>
                        runAi(`summary-${style}`, async () => {
                          const result = await aiSummary({
                            data: {
                              targetJob: data.targetJob,
                              context: `${plainText}\n\nCurrent summary: ${data.summary}`,
                              style,
                            },
                          });
                          update({ summary: result.text });
                        })
                      }
                    >
                      {busy === `summary-${style}` ? (
                        <Loader2 className="mr-1 size-4 animate-spin" />
                      ) : (
                        <Sparkles className="mr-1 size-4" />
                      )}
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                {data.experience.map((item, index) => (
                  <div key={item.id} className="rounded-lg border border-border p-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {(
                        [
                          ["jobTitle", "Job Title"],
                          ["company", "Company"],
                          ["city", "City"],
                          ["country", "Country"],
                          ["startDate", "Start Date"],
                          ["endDate", "End Date"],
                        ] as const
                      ).map(([field, label]) => (
                        <div key={field} className="space-y-1.5">
                          <Label>{label}</Label>
                          <Input
                            value={item[field]}
                            disabled={field === "endDate" && item.current}
                            onChange={(event) => {
                              const next = [...data.experience];
                              next[index] = { ...item, [field]: event.target.value };
                              update({ experience: next });
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Switch
                        checked={item.current}
                        onCheckedChange={(checked) => {
                          const next = [...data.experience];
                          next[index] = { ...item, current: checked };
                          update({ experience: next });
                        }}
                      />
                      <span className="text-sm">Current position</span>
                    </div>
                    <div className="mt-3 space-y-2">
                      <Label>Responsibilities and achievements</Label>
                      {item.bullets.map((bullet, bulletIndex) => (
                        <div key={bulletIndex} className="flex gap-2">
                          <Textarea
                            rows={2}
                            value={bullet}
                            onChange={(event) => {
                              const bullets = [...item.bullets];
                              bullets[bulletIndex] = event.target.value;
                              const next = [...data.experience];
                              next[index] = { ...item, bullets };
                              update({ experience: next });
                            }}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Remove bullet"
                            onClick={() => {
                              const bullets = item.bullets.filter((_, i) => i !== bulletIndex);
                              const next = [...data.experience];
                              next[index] = { ...item, bullets };
                              update({ experience: next });
                            }}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      ))}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const next = [...data.experience];
                            next[index] = { ...item, bullets: [...item.bullets, ""] };
                            update({ experience: next });
                          }}
                        >
                          <Plus className="mr-1 size-4" /> Add bullet
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busy !== null}
                          onClick={() =>
                            runAi(`improve-${item.id}`, async () => {
                              const result = await aiImprove({
                                data: {
                                  jobTitle: item.jobTitle,
                                  company: item.company,
                                  text: item.bullets.join("\n") || item.jobTitle,
                                  targetJob: data.targetJob,
                                },
                              });
                              if (!result.bullets.length) {
                                toast.info(
                                  "Add a few notes first so the AI has something to work with.",
                                );
                                return;
                              }
                              const next = [...data.experience];
                              next[index] = { ...item, bullets: result.bullets };
                              update({ experience: next });
                            })
                          }
                        >
                          {busy === `improve-${item.id}` ? (
                            <Loader2 className="mr-1 size-4 animate-spin" />
                          ) : (
                            <Sparkles className="mr-1 size-4" />
                          )}
                          Improve with AI
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={busy !== null || !item.jobTitle}
                          onClick={() =>
                            runAi(`bullets-${item.id}`, async () => {
                              const result = await aiBullets({
                                data: { jobTitle: item.jobTitle, company: item.company },
                              });
                              const next = [...data.experience];
                              next[index] = {
                                ...item,
                                bullets: [...item.bullets, ...result.bullets],
                              };
                              update({ experience: next });
                            })
                          }
                        >
                          Suggest bullet points
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            update({ experience: data.experience.filter((_, i) => i !== index) })
                          }
                        >
                          <Trash2 className="mr-1 size-4" /> Remove role
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() =>
                    update({
                      experience: [
                        ...data.experience,
                        {
                          id: uid(),
                          jobTitle: "",
                          company: "",
                          city: "",
                          country: "United Kingdom",
                          startDate: "",
                          endDate: "",
                          current: false,
                          bullets: [""],
                        },
                      ],
                    })
                  }
                >
                  <Plus className="mr-1 size-4" /> Add work experience
                </Button>
                {data.experience.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No experience added yet. Even short or informal roles count.
                  </p>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                {data.education.map((item, index) => (
                  <div
                    key={item.id}
                    className="grid gap-3 rounded-lg border border-border p-3 sm:grid-cols-2"
                  >
                    {(
                      [
                        ["school", "School / University"],
                        ["qualification", "Qualification"],
                        ["field", "Field of Study"],
                        ["location", "Location"],
                        ["startDate", "Start Date"],
                        ["endDate", "End Date"],
                      ] as const
                    ).map(([field, label]) => (
                      <div key={field} className="space-y-1.5">
                        <Label>{label}</Label>
                        <Input
                          value={item[field]}
                          onChange={(event) => {
                            const next = [...data.education];
                            next[index] = { ...item, [field]: event.target.value };
                            update({ education: next });
                          }}
                        />
                      </div>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-self-start"
                      onClick={() =>
                        update({ education: data.education.filter((_, i) => i !== index) })
                      }
                    >
                      <Trash2 className="mr-1 size-4" /> Remove
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() =>
                    update({
                      education: [
                        ...data.education,
                        {
                          id: uid(),
                          school: "",
                          qualification: "",
                          field: "",
                          location: "",
                          startDate: "",
                          endDate: "",
                        },
                      ],
                    })
                  }
                >
                  <Plus className="mr-1 size-4" /> Add education
                </Button>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-5">
                {(
                  [
                    ["technicalSkills", "Technical Skills"],
                    ["softSkills", "Soft Skills"],
                  ] as const
                ).map(([field, label]) => (
                  <div key={field} className="space-y-2">
                    <Label>{label}</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {data[field].map((skill, index) => (
                        <Badge
                          key={`${skill}-${index}`}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() =>
                            update({ [field]: data[field].filter((_, i) => i !== index) })
                          }
                        >
                          {skill} ✕
                        </Badge>
                      ))}
                    </div>
                    <Input
                      placeholder="Type a skill and press Enter"
                      onKeyDown={(event) => {
                        if (event.key !== "Enter") return;
                        event.preventDefault();
                        const value = event.currentTarget.value.trim().slice(0, 60);
                        if (!value) return;
                        update({ [field]: [...data[field], value] });
                        event.currentTarget.value = "";
                      }}
                    />
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={busy !== null}
                  onClick={() =>
                    runAi("skills", async () => {
                      const result = await aiSkills({
                        data: { targetJob: data.targetJob, context: plainText },
                      });
                      update({
                        technicalSkills: Array.from(
                          new Set([...data.technicalSkills, ...(result.technical ?? [])]),
                        ),
                        softSkills: Array.from(
                          new Set([...data.softSkills, ...(result.soft ?? [])]),
                        ),
                      });
                    })
                  }
                >
                  {busy === "skills" ? (
                    <Loader2 className="mr-1 size-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-1 size-4" />
                  )}
                  Suggest skills with AI
                </Button>

                <div className="space-y-2 border-t border-border pt-4">
                  <Label>Languages</Label>
                  {data.languages.map((item, index) => (
                    <div key={item.id} className="flex gap-2">
                      <Input
                        value={item.language}
                        placeholder="Language"
                        onChange={(event) => {
                          const next = [...data.languages];
                          next[index] = { ...item, language: event.target.value };
                          update({ languages: next });
                        }}
                      />
                      <Select
                        value={item.proficiency}
                        onValueChange={(value) => {
                          const next = [...data.languages];
                          next[index] = { ...item, proficiency: value as typeof item.proficiency };
                          update({ languages: next });
                        }}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["Native", "Fluent", "Advanced", "Intermediate", "Basic"].map(
                            (level) => (
                              <SelectItem key={level} value={level}>
                                {level}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Remove language"
                        onClick={() =>
                          update({ languages: data.languages.filter((_, i) => i !== index) })
                        }
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      update({
                        languages: [
                          ...data.languages,
                          { id: uid(), language: "", proficiency: "Fluent" },
                        ],
                      })
                    }
                  >
                    <Plus className="mr-1 size-4" /> Add language
                  </Button>
                </div>

                <div className="space-y-2 border-t border-border pt-4">
                  <Label>Certifications</Label>
                  {data.certifications.map((item, index) => (
                    <div key={item.id} className="grid gap-2 sm:grid-cols-4">
                      {(
                        [
                          ["name", "Certification"],
                          ["organisation", "Organisation"],
                          ["date", "Date"],
                          ["expiry", "Expiry"],
                        ] as const
                      ).map(([field, label]) => (
                        <Input
                          key={field}
                          placeholder={label}
                          value={item[field]}
                          onChange={(event) => {
                            const next = [...data.certifications];
                            next[index] = { ...item, [field]: event.target.value };
                            update({ certifications: next });
                          }}
                        />
                      ))}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      update({
                        certifications: [
                          ...data.certifications,
                          { id: uid(), name: "", organisation: "", date: "", expiry: "" },
                        ],
                      })
                    }
                  >
                    <Plus className="mr-1 size-4" /> Add certification
                  </Button>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-5">
                {(Object.keys(EXTRA_SECTION_LABELS) as ExtraSectionKey[]).map((key) => {
                  const section = data.extras[key];
                  return (
                    <div key={key} className="rounded-lg border border-border p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{EXTRA_SECTION_LABELS[key]}</span>
                        <Switch
                          checked={section.enabled}
                          onCheckedChange={(checked) =>
                            update({
                              extras: { ...data.extras, [key]: { ...section, enabled: checked } },
                            })
                          }
                        />
                      </div>
                      {section.enabled && (
                        <div className="mt-3 space-y-2">
                          {section.items.map((item, index) => (
                            <div key={item.id} className="space-y-2">
                              <Input
                                placeholder="Title"
                                value={item.title}
                                onChange={(event) => {
                                  const items = [...section.items];
                                  items[index] = { ...item, title: event.target.value };
                                  update({
                                    extras: { ...data.extras, [key]: { ...section, items } },
                                  });
                                }}
                              />
                              <Textarea
                                rows={2}
                                placeholder="Description"
                                value={item.description}
                                onChange={(event) => {
                                  const items = [...section.items];
                                  items[index] = { ...item, description: event.target.value };
                                  update({
                                    extras: { ...data.extras, [key]: { ...section, items } },
                                  });
                                }}
                              />
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              update({
                                extras: {
                                  ...data.extras,
                                  [key]: {
                                    ...section,
                                    items: [
                                      ...section.items,
                                      { id: uid(), title: "", description: "" },
                                    ],
                                  },
                                },
                              })
                            }
                          >
                            <Plus className="mr-1 size-4" /> Add entry
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {step === 6 && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label>Template</Label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {TEMPLATES.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setTemplate(item.id)}
                        className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                          template === item.id
                            ? "border-accent bg-accent/10"
                            : "border-border hover:border-accent/50"
                        }`}
                      >
                        <span className="font-medium">{item.name}</span>
                        {template === item.id && (
                          <Check className="ml-1 inline size-3.5 text-accent" />
                        )}
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {item.blurb}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Font</Label>
                    <Select
                      value={settings.fontFamily}
                      onValueChange={(value) =>
                        setSettings({
                          ...settings,
                          fontFamily: value as ResumeSettings["fontFamily"],
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sans">Sans serif (Arial)</SelectItem>
                        <SelectItem value="serif">Serif (Georgia)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Accent colour</Label>
                    <input
                      type="color"
                      value={settings.accent}
                      onChange={(event) => setSettings({ ...settings, accent: event.target.value })}
                      className="h-9 w-full cursor-pointer rounded-md border border-border bg-card"
                      aria-label="Accent colour"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Font size ({settings.fontSize}pt)</Label>
                    <Slider
                      value={[settings.fontSize]}
                      min={9}
                      max={13}
                      step={0.5}
                      onValueChange={([value]) =>
                        setSettings({ ...settings, fontSize: value as number })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Line spacing ({settings.lineHeight})</Label>
                    <Slider
                      value={[settings.lineHeight]}
                      min={1.1}
                      max={1.8}
                      step={0.05}
                      onValueChange={([value]) =>
                        setSettings({ ...settings, lineHeight: value as number })
                      }
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Margins ({settings.margin}px)</Label>
                    <Slider
                      value={[settings.margin]}
                      min={24}
                      max={72}
                      step={2}
                      onValueChange={([value]) =>
                        setSettings({ ...settings, margin: value as number })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Section order</Label>
                  {data.sectionOrder.map((key, index) => (
                    <div
                      key={key}
                      className="flex items-center justify-between rounded-md border border-border px-3 py-1.5 text-sm capitalize"
                    >
                      {EXTRA_SECTION_LABELS[key as ExtraSectionKey] ?? key}
                      <span className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Move up"
                          onClick={() => moveSection(index, -1)}
                        >
                          <ArrowUp className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Move down"
                          onClick={() => moveSection(index, 1)}
                        >
                          <ArrowDown className="size-4" />
                        </Button>
                      </span>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => update({ sectionOrder: [...DEFAULT_SECTION_ORDER] })}
                  >
                    Reset order
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-between border-t border-border pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={step === 0}
                onClick={() => setStep(step - 1)}
              >
                Back
              </Button>
              {step === STEPS.length - 1 ? (
                <Button size="sm" onClick={finishCv} disabled={finishing}>
                  {finishing ? (
                    <Loader2 className="mr-1 size-4 animate-spin" />
                  ) : (
                    <Check className="mr-1 size-4" />
                  )}
                  Finish CV
                </Button>
              ) : (
                <Button size="sm" onClick={() => setStep(step + 1)}>
                  Next
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className={mobileView === "edit" ? "hidden lg:block" : ""}>
          <div className="sticky top-20">
            <div className="no-print overflow-auto rounded-xl border border-border bg-muted/40 p-3 shadow-card">
              <div className="screen-scale origin-top-left scale-[0.42] sm:scale-[0.55] lg:scale-[0.6] xl:scale-[0.72]">
                <CvDocument data={data} settings={settings} template={template} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="print-root hidden print:block">
        <CvDocument data={data} settings={settings} template={template} />
      </div>
    </div>
  );
}

export function usePlainResume(data: ResumeData) {
  return useMemo(() => resumeToPlainText(data), [data]);
}

export const Tabbed = { Tabs, TabsContent, TabsList, TabsTrigger };
