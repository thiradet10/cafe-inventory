import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const user = session?.user as { id?: string; role?: string } | undefined;

    if (!user || user.role !== "MANAGER") {
      return NextResponse.json({ error: "Forbidden: MANAGER only" }, { status: 403 });
    }

    const unitId = parseInt(params.id);
    await prisma.unit.delete({
      where: { id: unitId },
    });

    return NextResponse.json({ message: "ลบหน่วยนับเรียบร้อยแล้ว" });
  } catch (error) {
    return NextResponse.json({ error: "ไม่พบหน่วยนับ หรือไม่สามารถลบได้" }, { status: 404 });
  }
}