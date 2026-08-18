import { Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const NAV = [
  { to: "/builder", label: "CV Builder" },
  { to: "/templates", label: "Templates" },
  { to: "/ats-checker", label: "ATS Checker" },
  { to: "/cover-letter", label: "Cover Letter" },
  { to: "/pricing", label: "Pricing" },
] as const;

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <FileText className="size-4" />
      </span>
      <span className="font-display text-base font-bold tracking-tight">
        NextStep <span className="text-accent">CV</span> UK
      </span>
    </Link>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();

  return (
    <header className="no-print sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo />
        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-sm text-foreground font-medium" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.navigate({ to: "/dashboard" })}
              >
                Dashboard
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await signOut();
                  router.navigate({ to: "/" });
                }}
              >
                Log out
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => router.navigate({ to: "/auth" })}>
              Login
            </Button>
          )}
          <Button size="sm" onClick={() => router.navigate({ to: "/builder" })}>
            Create CV
          </Button>
        </div>
        <button
          className="md:hidden"
          aria-label="Toggle menu"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {NAV.map((item) => (
              <Link key={item.to} to={item.to} onClick={() => setOpen(false)} className="text-sm">
                {item.label}
              </Link>
            ))}
            <Link
              to={user ? "/dashboard" : "/auth"}
              onClick={() => setOpen(false)}
              className="text-sm"
            >
              {user ? "Dashboard" : "Login"}
            </Link>
            <Button
              size="sm"
              onClick={() => {
                setOpen(false);
                router.navigate({ to: "/builder" });
              }}
            >
              Create CV
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

const FOOTER = [
  {
    heading: "Product",
    links: [
      { to: "/builder", label: "CV Builder" },
      { to: "/templates", label: "Templates" },
      { to: "/ats-checker", label: "ATS Checker" },
      { to: "/cover-letter", label: "Cover Letter" },
    ],
  },
  {
    heading: "Company",
    links: [
      { to: "/about", label: "About" },
      { to: "/contact", label: "Contact" },
      { to: "/privacy", label: "Privacy" },
      { to: "/terms", label: "Terms" },
    ],
  },
  {
    heading: "Support",
    links: [
      { to: "/help", label: "Help Centre" },
      { to: "/faq", label: "FAQ" },
      { to: "/pricing", label: "Pricing" },
      { to: "/tracker", label: "Job Tracker" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="no-print border-t border-border bg-secondary/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Your experience. Your next opportunity. Professional, ATS-friendly CVs built for the UK
            job market.
          </p>
        </div>
        {FOOTER.map((group) => (
          <div key={group.heading}>
            <h3 className="text-sm font-semibold">{group.heading}</h3>
            <ul className="mt-3 space-y-2">
              {group.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} NextStep CV UK. Built in British English.
      </div>
    </footer>
  );
}

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
