import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
} from "docx";
import type { ReportData, Breakdown } from "@/lib/stats";
import { rangeLabel } from "@/lib/range";

const taka = (n: number) => "Tk " + n.toLocaleString("en-IN");
const BRAND = "4F46E5";
const HEADER_BG = "EEF2FF";

function heading(text: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 320, after: 140 },
    children: [new TextRun({ text, color: BRAND, bold: true })],
  });
}

function subheading(text: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 220, after: 100 },
    children: [new TextRun({ text, bold: true })],
  });
}

function para(text: string, opts: { italic?: boolean; bold?: boolean } = {}) {
  return new Paragraph({
    spacing: { after: 80 },
    children: [new TextRun({ text, italics: opts.italic, bold: opts.bold })],
  });
}

function cell(text: string, opts: { header?: boolean; bold?: boolean } = {}) {
  return new TableCell({
    shading: opts.header
      ? { type: ShadingType.CLEAR, fill: HEADER_BG, color: "auto" }
      : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold: opts.header || opts.bold,
            color: opts.header ? BRAND : undefined,
            size: 20,
          }),
        ],
      }),
    ],
  });
}

function table(headers: string[], rows: string[][]) {
  const border = { style: BorderStyle.SINGLE, size: 1, color: "D8DEE9" };
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: border,
      bottom: border,
      left: border,
      right: border,
      insideHorizontal: border,
      insideVertical: border,
    },
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map((h) => cell(h, { header: true })),
      }),
      ...rows.map(
        (r) => new TableRow({ children: r.map((c) => cell(c)) })
      ),
    ],
  });
}

function breakdownTable(title: string, items: Breakdown[]) {
  const total = items.reduce((s, i) => s + i.count, 0) || 1;
  return [
    subheading(title),
    items.length
      ? table(
          ["বিষয়", "সংখ্যা", "শতাংশ"],
          items.map((i) => [
            i.label,
            String(i.count),
            Math.round((i.count / total) * 100) + "%",
          ])
        )
      : para("কোনো ডেটা নেই।", { italic: true }),
  ];
}

export async function buildReportDocx(data: ReportData): Promise<Buffer> {
  const children: (Paragraph | Table)[] = [];

  // ---------- Title ----------
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({ text: "TEAM BATTLE", bold: true, size: 56, color: BRAND }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [
        new TextRun({ text: "Final Performance Report", bold: true, size: 30 }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 30 },
      children: [
        new TextRun({ text: `পরিসর: ${rangeLabel(data.range)}`, size: 22, color: "666666" }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      children: [
        new TextRun({
          text: `তৈরি: ${data.generatedAt.toLocaleString("en-GB")}`,
          size: 18,
          color: "999999",
        }),
      ],
    })
  );

  // ---------- 1. Executive summary ----------
  children.push(heading("১. সারসংক্ষেপ (Executive Summary)"));
  children.push(
    table(
      ["সূচক (Metric)", "মান (Value)"],
      [
        ["Individual Reports", String(data.individualCount)],
        ["Team Reports", String(data.teamReportCount)],
        ["মোট Sales", taka(data.totals.sales)],
        ["মোট Profit", taka(data.totals.profit)],
        ["মোট Approached", String(data.totals.approached)],
        ["মোট Purchased", String(data.totals.purchased)],
        ["সামগ্রিক Conversion", data.totals.conversion + "%"],
        ["Cumulative Profit", taka(data.totals.cumulativeProfit)],
      ]
    )
  );

  // ---------- 2. Team leaderboard ----------
  children.push(heading("২. Team Leaderboard"));
  if (data.teamStandings.length) {
    children.push(
      table(
        ["#", "Team", "Reports", "Sales", "Profit", "Conv.", "Cumulative"],
        data.teamStandings.map((t, i) => [
          String(i + 1),
          t.teamName,
          String(t.reports),
          taka(t.totalSales),
          taka(t.totalProfit),
          t.conversion + "%",
          t.latestCumulativeProfit != null ? taka(t.latestCumulativeProfit) : "—",
        ])
      )
    );
    const champ = data.teamStandings[0];
    children.push(
      para(`🏆 শীর্ষ Team: ${champ.teamName} — Profit ${taka(champ.totalProfit)}।`, {
        bold: true,
      })
    );
  } else {
    children.push(para("কোনো team রিপোর্ট নেই।", { italic: true }));
  }

  // ---------- 3. Individual leaderboard ----------
  children.push(heading("৩. Individual Leaderboard"));
  if (data.memberStandings.length) {
    children.push(
      table(
        ["#", "Name", "Team", "Reports", "Sales", "Profit", "Conv.", "Avg Rating"],
        data.memberStandings
          .slice(0, 20)
          .map((m, i) => [
            String(i + 1),
            m.name,
            m.teamName,
            String(m.reports),
            taka(m.totalSales),
            taka(m.totalProfit),
            m.conversion + "%",
            m.avgSelfRating + "/10",
          ])
      )
    );
    const top = data.memberStandings[0];
    children.push(
      para(`🥇 সেরা Performer: ${top.name} (${top.teamName}) — Profit ${taka(top.totalProfit)}।`, {
        bold: true,
      })
    );
  } else {
    children.push(para("কোনো individual রিপোর্ট নেই।", { italic: true }));
  }

  // ---------- 4. Statistics & breakdowns ----------
  children.push(heading("৪. পরিসংখ্যান ও বিশ্লেষণ (Statistics)"));
  children.push(...breakdownTable("সবচেয়ে কঠিন Objection (Individual)", data.objectionBreakdown));
  children.push(...breakdownTable("Common Objection (Team)", data.teamObjectionBreakdown));
  children.push(...breakdownTable("সেরা Selling Approach", data.approachBreakdown));
  children.push(...breakdownTable("Sale Outcome", data.saleOutcomeBreakdown));
  children.push(...breakdownTable("Team-এর সমস্যা (Team Pulse)", data.teamIssuesBreakdown));

  // ---------- 5. Learnings ----------
  children.push(heading("৫. Learnings ও Objection বিশ্লেষণ"));

  children.push(subheading("💡 সেরা Pitch সমূহ"));
  if (data.bestPitches.length) {
    data.bestPitches.forEach((p) =>
      children.push(para(`• [${p.name} — ${p.teamName}] ${p.text}`))
    );
  } else children.push(para("কোনো ডেটা নেই।", { italic: true }));

  children.push(subheading("⚠️ উল্লেখযোগ্য ভুল (Mistakes)"));
  if (data.topMistakes.length) {
    data.topMistakes.forEach((m) =>
      children.push(para(`• [${m.name} — ${m.teamName}] ${m.text}`))
    );
  } else children.push(para("কোনো ডেটা নেই।", { italic: true }));

  children.push(subheading("🎯 আগামীকালের Strategy (Team)"));
  if (data.tomorrowStrategies.length) {
    data.tomorrowStrategies.forEach((s) =>
      children.push(para(`• [${s.teamName}] ${s.text}`))
    );
  } else children.push(para("কোনো ডেটা নেই।", { italic: true }));

  // ---------- Footer ----------
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400 },
      children: [
        new TextRun({
          text: "— Team Battle Daily Report System —",
          italics: true,
          color: "999999",
          size: 18,
        }),
      ],
    })
  );

  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: "Calibri", size: 22 } },
      },
    },
    sections: [{ properties: {}, children }],
  });

  return Packer.toBuffer(doc);
}
