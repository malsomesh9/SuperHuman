import { differenceInCalendarDays, format, isToday, isTomorrow, parseISO } from "date-fns";

export function formatSmartDate(value: string | null | undefined) {
  if (!value) return "No deadline";
  const date = parseISO(value);
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return format(date, "MMM d");
}

export function formatWaitingDuration(value: number | string) {
  const days = typeof value === "number" ? value : Math.max(1, Math.abs(differenceInCalendarDays(new Date(), parseISO(value))));
  if (days <= 0) return "Today";
  return `Waiting ${days} day${days === 1 ? "" : "s"}`;
}

export function formatOverdue(value: string | null | undefined) {
  if (!value) return "";
  const days = differenceInCalendarDays(new Date(), parseISO(value));
  if (days <= 0) return "Due today";
  return `${days} day${days === 1 ? "" : "s"} overdue`;
}
