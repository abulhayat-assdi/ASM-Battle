import { getSession } from "@/lib/auth";
import { buildReportData } from "@/lib/stats";
import { parseRange } from "@/lib/range";
import { buildReportDocx } from "@/lib/docx-report";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { searchParams } = new URL(req.url);
  const range = parseRange({
    from: searchParams.get("from") || undefined,
    to: searchParams.get("to") || undefined,
  });

  const data = await buildReportData(range);
  const buffer = await buildReportDocx(data);

  const stamp = new Date().toISOString().slice(0, 10);
  const filename = `team-battle-report-${stamp}.docx`;

  const body = new Uint8Array(buffer);
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(body.length),
    },
  });
}
