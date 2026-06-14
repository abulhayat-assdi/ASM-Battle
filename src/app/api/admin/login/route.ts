import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import type { AdminRole } from "@/lib/constants";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username ও password দিন" },
        { status: 400 }
      );
    }

    const admin = await prisma.adminUser.findUnique({
      where: { username: String(username).trim() },
    });
    if (!admin || !(await bcrypt.compare(String(password), admin.password))) {
      return NextResponse.json(
        { error: "ভুল username বা password" },
        { status: 401 }
      );
    }

    await createSession({
      sub: admin.id,
      username: admin.username,
      name: admin.name,
      role: admin.role as AdminRole,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("login error:", err);
    return NextResponse.json({ error: "সার্ভার সমস্যা" }, { status: 500 });
  }
}
