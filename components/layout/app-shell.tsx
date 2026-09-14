"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Activity, Archive, Bot, CircleHelp, Clock3, Inbox, ListChecks, LogOut, MailCheck, Pencil, Search, Settings, Sparkles, Users, Workflow } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CommandPalette } from "@/components/layout/command-palette";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/lib/auth/session";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/needs-you", label: "Needs You", icon: Bot, count: 5 },
  { href: "/today", label: "Today", icon: Sparkles, count: 5 },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/commitments", label: "Commitments", icon: ListChecks, count: 3 },
  { href: "/waiting", label: "Waiting", icon: Clock3, count: 1 },
  { href: "/follow-ups", label: "Follow-ups", icon: MailCheck, count: 2 },
  { href: "/people", label: "People", icon: Users },
  { href: "/projects", label: "Projects", icon: Archive },
  { href: "/search", label: "Search", icon: Search },
  { href: "/actions", label: "Approvals", icon: Bot, count: 2 },
  { href: "/automations", label: "Automations", icon: Workflow },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/settings", label: "Settings", icon: Settings }
];

const mobileItems = navItems.slice(0, 4);

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, token, signOut } = useSession();
  const isDemo = token === "demo-token";
  const [commandOpen, setCommandOpen] = useState(false);
  const [sequence, setSequence] = useState("");

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(true);
        return;
      }
      if (isTyping) return;
      if (event.key === "?") setCommandOpen(true);
      if (isDemo && event.key.toLowerCase() === "r") router.push(`/thread/thread_acme`);
      if (event.key.toLowerCase() === "e") window.dispatchEvent(new CustomEvent("smartemail:complete-first"));
      if (sequence === "g") {
        const key = event.key.toLowerCase();
        const routes: Record<string, string> = { t: "/today", i: "/inbox", c: "/commitments", w: "/waiting" };
        if (routes[key]) {
          event.preventDefault();
          router.push(routes[key]);
        }
        setSequence("");
      } else if (event.key.toLowerCase() === "g") {
        setSequence("g");
        window.setTimeout(() => setSequence(""), 900);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router, sequence, isDemo]);

  const accountLabel = useMemo(() => user?.email ?? "Demo account", [user?.email]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[252px] border-r border-border bg-muted/55 px-3 py-4 lg:flex lg:flex-col">
        <Link href="/today" className="mb-4 flex items-center gap-2 px-2">
          <span className="grid size-7 place-items-center rounded-md border border-border bg-surface text-[12px] font-semibold text-foreground shadow-fine">SE</span>
          <span className="font-semibold">SmartEmail</span>
        </Link>
        <Button className="mb-4 justify-start bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => isDemo ? setCommandOpen(true) : router.push("/inbox?compose=true")}>
          <Pencil size={15} /> Compose
        </Button>
        <nav className="grid min-h-0 gap-0.5 overflow-y-auto" aria-label="Main navigation">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn("grid min-h-9 grid-cols-[18px_1fr_auto] items-center gap-2 rounded-md px-2 text-sm text-muted-foreground hover:bg-surface hover:text-foreground", pathname === item.href && "bg-surface text-foreground shadow-fine")}
            >
              <item.icon size={16} aria-hidden />
              <span>{item.label}</span>
              {isDemo && item.count ? <Badge tone="accent">{item.count}</Badge> : null}
            </Link>
          ))}
        </nav>
        <div className="mt-auto grid shrink-0 gap-2 border-t border-border pt-3">
          {isDemo && <div className="rounded-md border border-border bg-surface p-2 text-xs">
            <div className="font-medium">This week</div>
            <div className="mt-1 text-muted-foreground"><span className="font-semibold text-foreground">3h 24m</span> saved</div>
            <div className="text-muted-foreground"><span className="font-semibold text-foreground">42</span> actions completed safely</div>
          </div>}
          <div className="rounded-md border border-border bg-background p-2">
            <div className="text-xs font-medium">{isDemo ? "Demo account" : "SmartEmail account"}</div>
            <div className="mt-1 truncate text-xs text-muted-foreground">{accountLabel}</div>
            {isDemo && <div className="mt-2 text-xs text-muted-foreground">Sample mailbox</div>}
          </div>
          <Button variant="ghost" className="justify-start" onClick={() => setCommandOpen(true)}><CircleHelp size={16} /> Help and shortcuts</Button>
          <Button variant="ghost" className="justify-start" onClick={signOut}><LogOut size={16} /> Sign out</Button>
        </div>
      </aside>
      <main className="min-h-screen pb-16 lg:pl-[252px]">
        {isDemo && <div role="status" className="border-b border-border bg-muted px-4 py-2 text-xs">Interactive demo · Sample data · Drafts are templates · Sends, refunds, and integrations are simulated. Changes last 24 hours.</div>}
        {children}
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-surface/95 px-2 py-1 backdrop-blur lg:hidden" aria-label="Mobile navigation">
        {mobileItems.map((item) => (
          <Link key={item.href} href={item.href} className={cn("grid min-h-12 place-items-center rounded-md text-[11px] text-muted-foreground", pathname === item.href && "text-foreground")}>
            <item.icon size={18} />
            <span>{item.label}</span>
          </Link>
        ))}
        <button className="grid min-h-12 place-items-center rounded-md text-[11px] text-muted-foreground" onClick={() => setCommandOpen(true)}>
          <Search size={18} />
          <span>More</span>
        </button>
      </nav>
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  );
}
