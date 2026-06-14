import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ValidationError,
  str,
  num,
  date,
  strArray,
  optStr,
} from "@/lib/validate";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const report = await prisma.individualReport.create({
      data: {
        name: str(data, "name"),
        teamName: str(data, "teamName"),
        date: date(data, "date"),
        role: str(data, "role"),

        approached: num(data, "approached"),
        purchased: num(data, "purchased"),
        salesAmount: num(data, "salesAmount"),
        profit: num(data, "profit"),

        bestPitch: str(data, "bestPitch"),
        hardestObjection: str(data, "hardestObjection"),
        objectionHandled: str(data, "objectionHandled"),
        saleOutcome: str(data, "saleOutcome"),

        selfRating: num(data, "selfRating"),
        biggestMistake: str(data, "biggestMistake"),
        tomorrowChange: str(data, "tomorrowChange"),

        teamBestWork: optStr(data, "teamBestWork"),
        teamIssues: strArray(data, "teamIssues"),
      },
    });

    return NextResponse.json({ ok: true, id: report.id }, { status: 201 });
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("individual report error:", err);
    return NextResponse.json(
      { error: "সার্ভার সমস্যা — পরে আবার চেষ্টা করুন" },
      { status: 500 }
    );
  }
}
