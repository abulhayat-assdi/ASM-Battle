import { prisma } from "@/lib/prisma";
import type { IndividualReport, TeamReport } from "@prisma/client";

export interface DateRange {
  from?: Date;
  to?: Date;
}

function dateFilter(range?: DateRange) {
  if (!range || (!range.from && !range.to)) return {};
  const date: Record<string, Date> = {};
  if (range.from) date.gte = range.from;
  if (range.to) date.lte = range.to;
  return { date };
}

export interface TeamStanding {
  teamName: string;
  reports: number;
  totalSales: number;
  totalProfit: number;
  approached: number;
  purchased: number;
  conversion: number; // %
  latestCumulativeProfit: number | null;
}

export interface MemberStanding {
  name: string;
  teamName: string;
  reports: number;
  totalSales: number;
  totalProfit: number;
  approached: number;
  purchased: number;
  conversion: number; // %
  avgSelfRating: number;
}

export interface Breakdown {
  label: string;
  count: number;
}

export interface ReportData {
  generatedAt: Date;
  range: DateRange;
  individualCount: number;
  teamReportCount: number;
  totals: {
    sales: number;
    profit: number;
    approached: number;
    purchased: number;
    conversion: number;
    cumulativeProfit: number;
  };
  teamStandings: TeamStanding[];
  memberStandings: MemberStanding[];
  objectionBreakdown: Breakdown[]; // from individual hardestObjection
  teamObjectionBreakdown: Breakdown[]; // from team commonObjection
  approachBreakdown: Breakdown[]; // from team bestApproach
  saleOutcomeBreakdown: Breakdown[];
  teamIssuesBreakdown: Breakdown[];
  topMistakes: { name: string; teamName: string; text: string }[];
  bestPitches: { name: string; teamName: string; text: string }[];
  tomorrowStrategies: { teamName: string; text: string }[];
}

function pct(part: number, whole: number) {
  if (!whole) return 0;
  return Math.round((part / whole) * 1000) / 10;
}

function tally(items: string[]): Breakdown[] {
  const map = new Map<string, number>();
  for (const it of items) {
    if (!it) continue;
    map.set(it, (map.get(it) || 0) + 1);
  }
  return [...map.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

export async function buildReportData(range?: DateRange): Promise<ReportData> {
  const where = dateFilter(range);

  const [individuals, teamReports] = await Promise.all([
    prisma.individualReport.findMany({ where, orderBy: { date: "asc" } }),
    prisma.teamReport.findMany({ where, orderBy: { date: "asc" } }),
  ]);

  // ---- Member standings (from individual reports) ----
  const memberMap = new Map<string, MemberStanding & { ratingSum: number }>();
  for (const r of individuals) {
    const key = `${r.name}||${r.teamName}`;
    const m =
      memberMap.get(key) ??
      {
        name: r.name,
        teamName: r.teamName,
        reports: 0,
        totalSales: 0,
        totalProfit: 0,
        approached: 0,
        purchased: 0,
        conversion: 0,
        avgSelfRating: 0,
        ratingSum: 0,
      };
    m.reports += 1;
    m.totalSales += r.salesAmount;
    m.totalProfit += r.profit;
    m.approached += r.approached;
    m.purchased += r.purchased;
    m.ratingSum += r.selfRating;
    memberMap.set(key, m);
  }
  const memberStandings: MemberStanding[] = [...memberMap.values()]
    .map((m) => ({
      name: m.name,
      teamName: m.teamName,
      reports: m.reports,
      totalSales: m.totalSales,
      totalProfit: m.totalProfit,
      approached: m.approached,
      purchased: m.purchased,
      conversion: pct(m.purchased, m.approached),
      avgSelfRating: Math.round((m.ratingSum / m.reports) * 10) / 10,
    }))
    .sort((a, b) => b.totalProfit - a.totalProfit);

  // ---- Team standings (from team reports) ----
  const teamMap = new Map<string, TeamStanding & { latestDate: Date | null }>();
  for (const r of teamReports) {
    const t =
      teamMap.get(r.teamName) ??
      {
        teamName: r.teamName,
        reports: 0,
        totalSales: 0,
        totalProfit: 0,
        approached: 0,
        purchased: 0,
        conversion: 0,
        latestCumulativeProfit: null,
        latestDate: null,
      };
    t.reports += 1;
    t.totalSales += r.totalSales;
    t.totalProfit += r.totalProfit;
    t.approached += r.approached;
    t.purchased += r.purchased;
    if (r.cumulativeProfit != null && (!t.latestDate || r.date >= t.latestDate)) {
      t.latestCumulativeProfit = r.cumulativeProfit;
      t.latestDate = r.date;
    }
    teamMap.set(r.teamName, t);
  }

  // Fall back to individual reports for teams that never filed a team report.
  for (const m of memberStandings) {
    if (!teamMap.has(m.teamName)) {
      teamMap.set(m.teamName, {
        teamName: m.teamName,
        reports: 0,
        totalSales: 0,
        totalProfit: 0,
        approached: 0,
        purchased: 0,
        conversion: 0,
        latestCumulativeProfit: null,
        latestDate: null,
      });
    }
  }

  const teamStandings: TeamStanding[] = [...teamMap.values()]
    .map((t) => ({
      teamName: t.teamName,
      reports: t.reports,
      totalSales: t.totalSales,
      totalProfit: t.totalProfit,
      approached: t.approached,
      purchased: t.purchased,
      conversion: pct(t.purchased, t.approached),
      latestCumulativeProfit: t.latestCumulativeProfit,
    }))
    .sort(
      (a, b) =>
        (b.latestCumulativeProfit ?? b.totalProfit) -
        (a.latestCumulativeProfit ?? a.totalProfit)
    );

  // ---- Totals (prefer team reports; fall back to individuals) ----
  const teamTotals = teamReports.reduce(
    (acc, r) => {
      acc.sales += r.totalSales;
      acc.profit += r.totalProfit;
      acc.approached += r.approached;
      acc.purchased += r.purchased;
      return acc;
    },
    { sales: 0, profit: 0, approached: 0, purchased: 0 }
  );
  const hasTeam = teamReports.length > 0;
  const indTotals = individuals.reduce(
    (acc, r) => {
      acc.sales += r.salesAmount;
      acc.profit += r.profit;
      acc.approached += r.approached;
      acc.purchased += r.purchased;
      return acc;
    },
    { sales: 0, profit: 0, approached: 0, purchased: 0 }
  );
  const base = hasTeam ? teamTotals : indTotals;
  const cumulativeProfit = teamStandings.reduce(
    (s, t) => s + (t.latestCumulativeProfit ?? 0),
    0
  );

  // ---- Breakdowns ----
  const objectionBreakdown = tally(individuals.map((r) => r.hardestObjection));
  const teamObjectionBreakdown = tally(teamReports.map((r) => r.commonObjection));
  const approachBreakdown = tally(teamReports.map((r) => r.bestApproach));
  const saleOutcomeBreakdown = tally(individuals.map((r) => r.saleOutcome));
  const teamIssuesBreakdown = tally(individuals.flatMap((r) => r.teamIssues));

  const topMistakes = pickText(
    individuals,
    (r) => r.biggestMistake,
    (r) => ({ name: r.name, teamName: r.teamName })
  );
  const bestPitches = pickText(
    individuals,
    (r) => r.bestPitch,
    (r) => ({ name: r.name, teamName: r.teamName })
  );
  const tomorrowStrategies = teamReports
    .filter((r) => r.tomorrowStrategy?.trim())
    .map((r) => ({ teamName: r.teamName, text: r.tomorrowStrategy }))
    .slice(-12);

  return {
    generatedAt: new Date(),
    range: range ?? {},
    individualCount: individuals.length,
    teamReportCount: teamReports.length,
    totals: {
      sales: base.sales,
      profit: base.profit,
      approached: base.approached,
      purchased: base.purchased,
      conversion: pct(base.purchased, base.approached),
      cumulativeProfit,
    },
    teamStandings,
    memberStandings,
    objectionBreakdown,
    teamObjectionBreakdown,
    approachBreakdown,
    saleOutcomeBreakdown,
    teamIssuesBreakdown,
    topMistakes,
    bestPitches,
    tomorrowStrategies,
  };
}

function pickText(
  rows: IndividualReport[],
  get: (r: IndividualReport) => string,
  meta: (r: IndividualReport) => { name: string; teamName: string }
) {
  return rows
    .filter((r) => get(r)?.trim())
    .slice(-12)
    .map((r) => ({ ...meta(r), text: get(r) }));
}

export type { IndividualReport, TeamReport };
