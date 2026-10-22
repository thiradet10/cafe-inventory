import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    // ดึง user พร้อมแปลง Type เพื่อรับมือกรณี undefined และอ่านค่า role ได้
    const user = session?.user as { id?: string; role?: string } | undefined;

    if (!user || user.role !== "MANAGER") {
      return NextResponse.json({ error: "Forbidden: MANAGER only" }, { status: 403 });
    }

    const categoryId = parseInt(params.id);
    await prisma.category.delete({
      where: { id: categoryId },
    });

    return NextResponse.json({ message: "ลบหมวดหมู่เรียบร้อยแล้ว" });
  } catch (error) {
    return NextResponse.json({ error: "ไม่พบหมวดหมู่ หรือไม่สามารถลบได้" }, { status: 404 });
  }
}