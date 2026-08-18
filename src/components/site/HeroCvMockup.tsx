import { Check, FileText, Sparkles } from "lucide-react";

export function HeroCvMockup() {
  return (
    <div
      role="img"
      aria-label="NextStep CV UK editor with a live professional CV preview"
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-lift"
    >
      <div className="flex items-center justify-between border-b border-border bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <FileText className="size-3.5" />
          </span>
          <span className="text-xs font-semibold text-primary">NextStep CV UK</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-border" />
          <span className="size-1.5 rounded-full bg-border" />
          <span className="size-1.5 rounded-full bg-accent" />
        </div>
      </div>

      <div className="grid min-h-[390px] grid-cols-[0.82fr_1.18fr] bg-secondary/45 sm:min-h-[470px]">
        <div className="border-r border-border bg-white p-3 sm:p-5">
          <div className="mb-5 flex items-center gap-1">
            {[true, true, false, false].map((complete, index) => (
              <span
                key={index}
                className={`h-1.5 flex-1 rounded-full ${complete ? "bg-accent" : "bg-secondary"}`}
              />
            ))}
          </div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-accent sm:text-[10px]">
            Professional summary
          </p>
          <p className="mt-1.5 text-[11px] font-semibold text-primary sm:text-sm">
            What job are you looking for?
          </p>
          <div className="mt-3 rounded-md border border-border bg-white px-2.5 py-2 text-[9px] text-foreground shadow-sm sm:text-[11px]">
            Customer Service Assistant
          </div>
          <div className="mt-3 rounded-md border border-border bg-white p-2.5">
            <div className="h-1.5 w-full rounded bg-secondary" />
            <div className="mt-2 h-1.5 w-[94%] rounded bg-secondary" />
            <div className="mt-2 h-1.5 w-[82%] rounded bg-secondary" />
            <div className="mt-2 h-1.5 w-[68%] rounded bg-secondary" />
          </div>
          <button
            type="button"
            tabIndex={-1}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md bg-primary px-2 py-2 text-[9px] font-semibold text-primary-foreground sm:text-[11px]"
          >
            <Sparkles className="size-3 text-accent" />
            Improve with AI
          </button>
          <div className="mt-5 space-y-2">
            {["Work experience", "Education", "Skills"].map((label, index) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-md border border-border px-2.5 py-2 text-[8px] text-muted-foreground sm:text-[10px]"
              >
                {label}
                <span className="flex size-4 items-center justify-center rounded-full bg-accent/10 text-accent">
                  {index < 2 ? <Check className="size-2.5" /> : index + 1}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-start justify-center p-3 sm:p-6">
          <div className="w-full max-w-[270px] bg-white px-[8%] py-[9%] shadow-[0_12px_35px_-15px_rgba(18,58,99,0.3)]">
            <div className="border-b-2 border-primary pb-3 text-center">
              <div className="mx-auto h-2.5 w-[58%] rounded-sm bg-primary" />
              <div className="mx-auto mt-2 h-1.5 w-[42%] rounded bg-slate-300" />
              <div className="mx-auto mt-2 h-1 w-[78%] rounded bg-slate-200" />
            </div>
            <div className="mt-4">
              <div className="h-1.5 w-[45%] rounded bg-primary" />
              <div className="mt-2 h-1 w-full rounded bg-slate-200" />
              <div className="mt-1.5 h-1 w-[96%] rounded bg-slate-200" />
              <div className="mt-1.5 h-1 w-[88%] rounded bg-slate-200" />
            </div>
            <div className="mt-4">
              <div className="h-1.5 w-[38%] rounded bg-primary" />
              <div className="mt-3 flex justify-between">
                <div className="h-1.5 w-[45%] rounded bg-slate-600" />
                <div className="h-1 w-[23%] rounded bg-slate-300" />
              </div>
              <div className="mt-1.5 h-1 w-[55%] rounded bg-slate-300" />
              {[96, 91, 83].map((width) => (
                <div key={width} className="mt-2 flex items-center gap-1.5">
                  <span className="size-1 rounded-full bg-accent" />
                  <span className="h-1 rounded bg-slate-200" style={{ width: `${width}%` }} />
                </div>
              ))}
            </div>
            <div className="mt-4">
              <div className="h-1.5 w-[31%] rounded bg-primary" />
              <div className="mt-2 h-1 w-full rounded bg-slate-200" />
              <div className="mt-1.5 h-1 w-[84%] rounded bg-slate-200" />
            </div>
            <div className="mt-4 rounded bg-accent/10 px-2 py-1.5 text-center text-[7px] font-semibold uppercase tracking-wider text-accent sm:text-[8px]">
              ATS-friendly · Ready to download
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
