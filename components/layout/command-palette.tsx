"use client";

import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const commands = [
  { label: "Go to Needs You", href: "/needs-you" },
  { label: "Go to Today", href: "/today" },
  { label: "Search inbox", href: "/search" },
  { label: "Show commitments", href: "/commitments" },
  { label: "Show waiting", href: "/waiting" },
  { label: "Review approvals", href: "/actions" },
  { label: "Find person", href: "/people" },
  { label: "Open project", href: "/projects" },
  { label: "Create task", href: "/commitments" },
  { label: "Show overdue commitments", href: "/commitments?status=overdue" }
];

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0">
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <Command className="overflow-hidden rounded-lg border border-border bg-surface shadow-drawer">
          <Command.Input className="h-12 w-full border-b border-border bg-transparent px-4 outline-none" placeholder="Go to Today, search inbox, show waiting..." />
          <Command.List className="max-h-[360px] overflow-y-auto p-2">
            <Command.Empty className="px-3 py-6 text-sm text-muted-foreground">No command found.</Command.Empty>
            {commands.map((command) => (
              <Command.Item
                key={command.label}
                value={command.label}
                className="cursor-pointer rounded-md px-3 py-2 text-sm aria-selected:bg-muted"
                onSelect={() => {
                  router.push(command.href);
                  onOpenChange(false);
                }}
              >
                {command.label}
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
