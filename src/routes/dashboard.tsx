import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, FileText, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Your dashboard | NextStep CV UK" },
      {
        name: "description",
        content: "Manage your saved CVs, cover letters and job applications.",
      },
      { property: "og:title", content: "Your dashboard | NextStep CV UK" },
      { property: "og:description", content: "All your CVs and applications in one place." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [firstName, setFirstName] = useState("");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("first_name")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => setFirstName(data?.first_name ?? ""));
  }, [user]);

  const resumes = useQuery({
    queryKey: ["resumes", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resumes")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const counts = useQuery({
    queryKey: ["dashboard-counts", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const [letters, applications] = await Promise.all([
        supabase.from("cover_letters").select("id", { count: "exact", head: true }),
        supabase.from("job_applications").select("id", { count: "exact", head: true }),
      ]);
      return { letters: letters.count ?? 0, applications: applications.count ?? 0 };
    },
  });

  async function createResume() {
    if (!user) return;
    const { data, error } = await supabase
      .from("resumes")
      .insert({ user_id: user.id, title: "Untitled CV" })
      .select("id")
      .single();
    if (error || !data) {
      toast.error("Could not create a CV");
      return;
    }
    navigate({ to: "/builder/$id", params: { id: data.id } });
  }

  if (loading || !user) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-6xl px-4 py-20 text-sm text-muted-foreground">Loading…</div>
      </SiteLayout>
    );
  }

  const list = resumes.data ?? [];

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Welcome back{firstName ? `, ${firstName}` : ""}</h1>
            <p className="mt-1 text-sm text-muted-foreground">Pick up where you left off.</p>
          </div>
          <Button onClick={createResume}>
            <Plus className="mr-1 size-4" /> Create New CV
          </Button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "My CVs", value: list.length, to: "/dashboard" as const },
            {
              label: "Cover Letters",
              value: counts.data?.letters ?? 0,
              to: "/cover-letter" as const,
            },
            { label: "Job Matches", value: "—", to: "/ats-checker" as const },
            {
              label: "Applications",
              value: counts.data?.applications ?? 0,
              to: "/tracker" as const,
            },
          ].map((card) => (
            <Link
              key={card.label}
              to={card.to}
              className="surface-card p-5 transition-shadow hover:shadow-lift"
            >
              <div className="text-sm text-muted-foreground">{card.label}</div>
              <div className="mt-1 text-2xl font-bold">{card.value}</div>
            </Link>
          ))}
        </div>

        <h2 className="mt-12 text-xl font-semibold">My CVs</h2>
        {resumes.isLoading ? (
          <p className="mt-4 text-sm text-muted-foreground">Loading your CVs…</p>
        ) : list.length === 0 ? (
          <div className="surface-card mt-4 p-10 text-center">
            <FileText className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              You have not created a CV yet. It takes about ten minutes.
            </p>
            <Button className="mt-5" onClick={createResume}>
              Create New CV
            </Button>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {list.map((resume) => (
              <article key={resume.id} className="surface-card p-5">
                <h3 className="font-semibold">{resume.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {resume.target_job || "No target role"} · {resume.template} ·{" "}
                  {new Date(resume.updated_at).toLocaleDateString("en-GB")}
                </p>
                <p className="mt-2 text-xs">
                  ATS score: <strong>{resume.ats_score ?? "not checked"}</strong>
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" asChild>
                    <Link to="/builder/$id" params={{ id: resume.id }}>
                      <Pencil className="mr-1 size-3.5" /> Edit
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      const { error } = await supabase.from("resumes").insert({
                        user_id: user.id,
                        title: `${resume.title} (copy)`,
                        template: resume.template,
                        target_job: resume.target_job,
                        data: resume.data,
                        settings: resume.settings,
                      });
                      if (error) toast.error("Could not duplicate");
                      else {
                        toast.success("CV duplicated");
                        queryClient.invalidateQueries({ queryKey: ["resumes", user.id] });
                      }
                    }}
                  >
                    <Copy className="mr-1 size-3.5" /> Duplicate
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      const name = window.prompt("Rename CV", resume.title);
                      if (!name) return;
                      await supabase
                        .from("resumes")
                        .update({ title: name.slice(0, 120) })
                        .eq("id", resume.id);
                      queryClient.invalidateQueries({ queryKey: ["resumes", user.id] });
                    }}
                  >
                    Rename
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      if (!window.confirm("Delete this CV permanently?")) return;
                      await supabase.from("resumes").delete().eq("id", resume.id);
                      queryClient.invalidateQueries({ queryKey: ["resumes", user.id] });
                    }}
                  >
                    <Trash2 className="mr-1 size-3.5" /> Delete
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
