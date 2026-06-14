import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, canManage } from "@/lib/auth";

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!canManage(session.role)) {
    return NextResponse.json(
      { error: "আপনার মুছে ফেলার অনুমতি নেই (VIEWER)" },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const id = searchParams.get("id");
  if (!id || (type !== "individual" && type !== "team")) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  try {
    if (type === "individual") {
      await prisma.individualReport.delete({ where: { id } });
    } else {
      await prisma.teamReport.delete({ where: { id } });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
