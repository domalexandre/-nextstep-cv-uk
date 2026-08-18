import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/tracker")({
  head: () => ({
    meta: [
      { title: "Job Application Tracker | NextStep CV UK" },
      {
        name: "description",
        content:
          "Track every UK job application from applied to offer, with notes, salary and links in one board.",
      },
      { property: "og:title", content: "Job Application Tracker | NextStep CV UK" },
      {
        property: "og:description",
        content: "Keep every application organised in one simple board.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Tracker,
});

const STATUSES = ["applied", "interview", "offer", "rejected"] as const;

function Tracker() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const applications = useQuery({
    queryKey: ["job-applications", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_applications")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ["job-applications", user?.id] });
  }

  async function add() {
    if (!user || !company.trim() || !position.trim()) {
      toast.error("Add a company and a position");
      return;
    }
    const { error } = await supabase.from("job_applications").insert({
      user_id: user.id,
      company: company.trim(),
      position: position.trim(),
      status: "applied",
      application_date: new Date().toISOString().slice(0, 10),
    });
    if (error) toast.error("Could not add the application");
    else {
      setCompany("");
      setPosition("");
      refresh();
    }
  }

  if (loading || !user) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-6xl px-4 py-20 text-sm text-muted-foreground">Loading…</div>
      </SiteLayout>
    );
  }

  const list = applications.data ?? [];

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-3xl font-bold">Job Application Tracker</h1>
        <p className="mt-2 text-sm text-muted-foreground">Keep every application in one place.</p>

        <div className="surface-card mt-6 flex flex-wrap gap-3 p-4">
          <Input
            className="sm:max-w-[220px]"
            placeholder="Company"
            value={company}
            onChange={(event) => setCompany(event.target.value)}
          />
          <Input
            className="sm:max-w-[220px]"
            placeholder="Position"
            value={position}
            onChange={(event) => setPosition(event.target.value)}
          />
          <Button onClick={add}>Add application</Button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {STATUSES.map((status) => (
            <div key={status} className="rounded-xl bg-secondary/40 p-3">
              <h2 className="px-1 text-sm font-semibold capitalize">
                {status} ({list.filter((item) => item.status === status).length})
              </h2>
              <div className="mt-3 space-y-3">
                {list
                  .filter((item) => item.status === status)
                  .map((item) => (
                    <article key={item.id} className="surface-card p-4">
                      <h3 className="text-sm font-semibold">{item.position}</h3>
                      <p className="text-xs text-muted-foreground">{item.company}</p>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {STATUSES.filter((next) => next !== status).map((next) => (
                          <Button
                            key={next}
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs capitalize"
                            onClick={async () => {
                              await supabase
                                .from("job_applications")
                                .update({ status: next })
                                .eq("id", item.id);
                              refresh();
                            }}
                          >
                            {next}
                          </Button>
                        ))}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2"
                          onClick={async () => {
                            await supabase.from("job_applications").delete().eq("id", item.id);
                            refresh();
                          }}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </article>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}
