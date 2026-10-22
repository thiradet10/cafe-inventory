import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// GET: ดึงรายการหมวดหมู่ทั้งหมด
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

// POST: เพิ่มหมวดหมู่ใหม่ (เฉพาะ MANAGER)
export async function POST(req: Request) {
  try {
    const session = await auth();
    
    // ระบุ Type Assertion เพื่อบอก TypeScript ว่า user มีฟิลด์ role และรับมือกรณี session/user เป็น undefined
    const user = session?.user as { id?: string; role?: string } | undefined;

    if (!user || user.role !== "MANAGER") {
      return NextResponse.json({ error: "Forbidden: MANAGER only" }, { status: 403 });
    }

    const { name } = await req.json();
    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "กรุณากรอกชื่อหมวดหมู่" }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: { name: name.trim() },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "ชื่อหมวดหมู่นี้มีอยู่ในระบบแล้ว" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}