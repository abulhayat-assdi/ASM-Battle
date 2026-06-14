import { buildReportData } from "@/lib/stats";
import { parseRange, rangeLabel } from "@/lib/range";
import DateRangeFilter from "@/components/DateRangeFilter";
import {
  ProfitBarChart,
  BreakdownPie,
  ConversionBarChart,
} from "@/components/Charts";

export const dynamic = "force-dynamic";

const taka = (n: number) => "৳" + n.toLocaleString("en-IN");

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string };
}) {
  const range = parseRange(searchParams);
  const data = await buildReportData(range);

  const stats = [
    { label: "Individual Reports", value: data.individualCount, icon: "🧍" },
    { label: "Team Reports", value: data.teamReportCount, icon: "👥" },
    { label: "মোট Sales", value: taka(data.totals.sales), icon: "💰" },
    { label: "মোট Profit", value: taka(data.totals.profit), icon: "📈" },
    { label: "Approached", value: data.totals.approached, icon: "🤝" },
    { label: "Purchased", value: data.totals.purchased, icon: "🛒" },
    { label: "Conversion", value: data.totals.conversion + "%", icon: "🎯" },
    {
      label: "Cumulative Profit",
      value: taka(data.totals.cumulativeProfit),
      icon: "🏆",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">পরিসর: {rangeLabel(range)}</p>
        </div>
        <DateRangeFilter />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-4">
            <div className="text-xl">{s.icon}</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">
              {s.value}
            </div>
            <div className="text-xs text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      {data.teamStandings.length === 0 ? (
        <div className="card p-10 text-center text-slate-400">
          এখনো কোনো রিপোর্ট জমা পড়েনি।
        </div>
      ) : (
        <>
          {/* Charts */}
          <div className="grid gap-5 lg:grid-cols-2">
            <ChartCard title="Team Sales ও Profit">
              <ProfitBarChart
                data={data.teamStandings.map((t) => ({
                  teamName: t.teamName,
                  profit: t.totalProfit,
                  sales: t.totalSales,
                }))}
              />
            </ChartCard>
            <ChartCard title="Team Conversion Rate">
              <ConversionBarChart
                data={data.teamStandings.map((t) => ({
                  teamName: t.teamName,
                  conversion: t.conversion,
                }))}
              />
            </ChartCard>
            <ChartCard title="সবচেয়ে কঠিন Objection (Individual)">
              <BreakdownPie data={data.objectionBreakdown} />
            </ChartCard>
            <ChartCard title="সেরা Selling Approach (Team)">
              <BreakdownPie data={data.approachBreakdown} />
            </ChartCard>
          </div>

          {/* Team leaderboard */}
          <div className="card overflow-hidden">
            <h2 className="border-b border-slate-100 px-5 py-3 font-semibold text-slate-800">
              🏆 Team Leaderboard
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                  <tr>
                    <Th>#</Th>
                    <Th>Team</Th>
                    <Th>Reports</Th>
                    <Th>Sales</Th>
                    <Th>Profit</Th>
                    <Th>Conv.</Th>
                    <Th>Cumulative</Th>
                  </tr>
                </thead>
                <tbody>
                  {data.teamStandings.map((t, i) => (
                    <tr key={t.teamName} className="border-t border-slate-100">
                      <Td>{medal(i)}</Td>
                      <Td className="font-medium text-slate-900">{t.teamName}</Td>
                      <Td>{t.reports}</Td>
                      <Td>{taka(t.totalSales)}</Td>
                      <Td className="font-semibold text-brand-700">
                        {taka(t.totalProfit)}
                      </Td>
                      <Td>{t.conversion}%</Td>
                      <Td>
                        {t.latestCumulativeProfit != null
                          ? taka(t.latestCumulativeProfit)
                          : "—"}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Member leaderboard */}
          <div className="card overflow-hidden">
            <h2 className="border-b border-slate-100 px-5 py-3 font-semibold text-slate-800">
              🥇 Top Individuals (by Profit)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                  <tr>
                    <Th>#</Th>
                    <Th>Name</Th>
                    <Th>Team</Th>
                    <Th>Reports</Th>
                    <Th>Sales</Th>
                    <Th>Profit</Th>
                    <Th>Conv.</Th>
                    <Th>Avg Rating</Th>
                  </tr>
                </thead>
                <tbody>
                  {data.memberStandings.slice(0, 15).map((m, i) => (
                    <tr
                      key={m.name + m.teamName}
                      className="border-t border-slate-100"
                    >
                      <Td>{medal(i)}</Td>
                      <Td className="font-medium text-slate-900">{m.name}</Td>
                      <Td>{m.teamName}</Td>
                      <Td>{m.reports}</Td>
                      <Td>{taka(m.totalSales)}</Td>
                      <Td className="font-semibold text-brand-700">
                        {taka(m.totalProfit)}
                      </Td>
                      <Td>{m.conversion}%</Td>
                      <Td>{m.avgSelfRating}/10</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card p-5">
      <h3 className="mb-3 font-semibold text-slate-800">{title}</h3>
      {children}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-2.5 font-semibold">{children}</th>;
}
function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-2.5 ${className}`}>{children}</td>;
}
function medal(i: number) {
  return ["🥇", "🥈", "🥉"][i] ?? i + 1;
}
