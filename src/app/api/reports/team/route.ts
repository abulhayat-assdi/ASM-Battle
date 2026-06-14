import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ValidationError,
  str,
  num,
  date,
  optStr,
  optNum,
} from "@/lib/validate";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const report = await prisma.teamReport.create({
      data: {
        teamName: str(data, "teamName"),
        date: date(data, "date"),
        captain: str(data, "captain"),
        allPresent: str(data, "allPresent"),
        whoAbsent: optStr(data, "whoAbsent"),

        approached: num(data, "approached"),
        purchased: num(data, "purchased"),
        conversion: optStr(data, "conversion"),
        totalSales: num(data, "totalSales"),
        totalProfit: num(data, "totalProfit"),
        cumulativeProfit: optNum(data, "cumulativeProfit"),

        topPerformer: str(data, "topPerformer"),
        mostStruggled: str(data, "mostStruggled"),

        bestApproach: str(data, "bestApproach"),
        bestArea: str(data, "bestArea"),
        commonObjection: str(data, "commonObjection"),
        objectionHandled: str(data, "objectionHandled"),
        tomorrowStrategy: str(data, "tomorrowStrategy"),
        memberHelp: optStr(data, "memberHelp"),
      },
    });

    return NextResponse.json({ ok: true, id: report.id }, { status: 201 });
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("team report error:", err);
    return NextResponse.json(
      { error: "সার্ভার সমস্যা — পরে আবার চেষ্টা করুন" },
      { status: 500 }
    );
  }
}
