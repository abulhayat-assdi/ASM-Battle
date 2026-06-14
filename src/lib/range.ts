import type { DateRange } from "@/lib/stats";

// Parse ?from=YYYY-MM-DD&to=YYYY-MM-DD into a DateRange (inclusive end-of-day).
export function parseRange(searchParams: {
  from?: string;
  to?: string;
}): DateRange {
  const range: DateRange = {};
  if (searchParams.from) {
    const d = new Date(searchParams.from);
    if (!Number.isNaN(d.getTime())) range.from = d;
  }
  if (searchParams.to) {
    const d = new Date(searchParams.to);
    if (!Number.isNaN(d.getTime())) {
      d.setHours(23, 59, 59, 999);
      range.to = d;
    }
  }
  return range;
}

export function rangeLabel(range: DateRange): string {
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  if (range.from && range.to) return `${fmt(range.from)} → ${fmt(range.to)}`;
  if (range.from) return `${fmt(range.from)} থেকে`;
  if (range.to) return `${fmt(range.to)} পর্যন্ত`;
  return "সর্বকালীন (All time)";
}
