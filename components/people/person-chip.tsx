import type { PersonSummary } from "@/types/domain";
import { PersonAvatar } from "@/components/people/person-avatar";

export function PersonChip({ person }: { person?: PersonSummary }) {
  if (!person) return <span className="text-muted-foreground">No person</span>;
  return (
    <span className="inline-flex items-center gap-2 text-sm">
      <PersonAvatar name={person.name} email={person.primaryEmail} className="size-6" />
      <span>{person.name ?? person.primaryEmail}</span>
      {person.company ? <span className="text-muted-foreground">- {person.company}</span> : null}
    </span>
  );
}
