import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  try {
    const units = await prisma.unit.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(units);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch units" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const user = session?.user as { id?: string; role?: string } | undefined;

    if (!user || user.role !== "MANAGER") {
      return NextResponse.json({ error: "Forbidden: MANAGER only" }, { status: 403 });
    }

    const { name } = await req.json();
    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "กรุณากรอกชื่อหน่วยนับ" }, { status: 400 });
    }

    const unit = await prisma.unit.create({
      data: { name: name.trim() },
    });

    return NextResponse.json(unit, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "หน่วยนับนี้มีอยู่ในระบบแล้ว" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create unit" }, { status: 500 });
  }
}