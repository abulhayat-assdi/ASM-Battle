import { buildReportData } from "@/lib/stats";
import { parseRange, rangeLabel } from "@/lib/range";
import DateRangeFilter from "@/components/DateRangeFilter";
import ExportButton from "@/components/ExportButton";

export const dynamic = "force-dynamic";

const taka = (n: number) => "৳" + n.toLocaleString("en-IN");

export default async function ReportPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string };
}) {
  const range = parseRange(searchParams);
  const data = await buildReportData(range);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Final Report</h1>
          <p className="text-sm text-slate-500">
            নিচের সারসংক্ষেপটি প্রিভিউ। ডান পাশের বোতামে Word ফাইল হিসেবে ডাউনলোড করুন।
            <br />
            পরিসর: <span className="font-medium">{rangeLabel(range)}</span>
          </p>
        </div>
        <ExportButton />
      </div>

      <DateRangeFilter />

      {/* Preview */}
      <div className="card space-y-6 p-6">
        <Block title="১. সারসংক্ষেপ">
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="মোট Sales" value={taka(data.totals.sales)} />
            <Stat label="মোট Profit" value={taka(data.totals.profit)} />
            <Stat label="Conversion" value={data.totals.conversion + "%"} />
            <Stat label="Cumulative" value={taka(data.totals.cumulativeProfit)} />
            <Stat label="Individual Reports" value={String(data.individualCount)} />
            <Stat label="Team Reports" value={String(data.teamReportCount)} />
            <Stat label="Approached" value={String(data.totals.approached)} />
            <Stat label="Purchased" value={String(data.totals.purchased)} />
          </dl>
        </Block>

        <Block title="২. Team Leaderboard">
          <PreviewList
            rows={data.teamStandings.map(
              (t, i) =>
                `${i + 1}. ${t.teamName} — Profit ${taka(t.totalProfit)}, Sales ${taka(
                  t.totalSales
                )}, Conv ${t.conversion}%`
            )}
          />
        </Block>

        <Block title="৩. Top Individuals">
          <PreviewList
            rows={data.memberStandings
              .slice(0, 10)
              .map(
                (m, i) =>
                  `${i + 1}. ${m.name} (${m.teamName}) — Profit ${taka(
                    m.totalProfit
                  )}, Rating ${m.avgSelfRating}/10`
              )}
          />
        </Block>

        <Block title="৪. Objection বিশ্লেষণ (Individual)">
          <PreviewList
            rows={data.objectionBreakdown.map((o) => `${o.label} — ${o.count}`)}
          />
        </Block>

        <Block title="৫. সেরা Selling Approach">
          <PreviewList
            rows={data.approachBreakdown.map((o) => `${o.label} — ${o.count}`)}
          />
        </Block>
      </div>

      <p className="text-center text-xs text-slate-400">
        Word ফাইলে আরও বিস্তারিত — সব breakdown, সেরা pitch, ভুল ও আগামীকালের strategy — অন্তর্ভুক্ত থাকবে।
      </p>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 border-b border-slate-100 pb-2 font-bold text-brand-700">
        {title}
      </h2>
      {children}
    </section>
  );
}
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <div className="text-lg font-bold text-slate-900">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}
function PreviewList({ rows }: { rows: string[] }) {
  if (!rows.length)
    return <p className="text-sm text-slate-400">কোনো ডেটা নেই।</p>;
  return (
    <ul className="space-y-1 text-sm text-slate-700">
      {rows.map((r, i) => (
        <li key={i}>{r}</li>
      ))}
    </ul>
  );
}
