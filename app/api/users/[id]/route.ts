import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";

// ==========================================
// 1. DELETE: ลบพนักงาน
// ==========================================
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const currentUser = session?.user as { id?: string; email?: string; role?: string } | undefined;

    if (!currentUser || currentUser.role !== "MANAGER") {
      return NextResponse.json({ error: "Forbidden: MANAGER only" }, { status: 403 });
    }

    const resolvedParams = await params;
    const targetUserId = resolvedParams?.id;

    if (!targetUserId) {
      return NextResponse.json({ error: "ไม่พบรหัสผู้ใช้ที่ต้องการลบ" }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, email: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "ไม่พบบัญชีผู้ใช้นี้ในระบบ" }, { status: 404 });
    }

    if (currentUser.email && targetUser.email === currentUser.email) {
      return NextResponse.json({ error: "ไม่สามารถลบบัญชีของตัวเองได้" }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id: targetUserId },
    });

    return NextResponse.json({ message: "ลบพนักงานเรียบร้อยแล้ว" });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: "ไม่พบบัญชีผู้ใช้ หรือไม่สามารถลบได้" }, { status: 404 });
  }
}

// ==========================================
// 2. PUT: แก้ไขข้อมูลพนักงาน (MANAGER Only)
// ==========================================
export async function PUT(
  req: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const currentUser = session?.user as { id?: string; role?: string } | undefined;

    // ตรวจสอบสิทธิ์ MANAGER
    if (!currentUser || currentUser.role !== "MANAGER") {
      return NextResponse.json({ error: "Forbidden: MANAGER only" }, { status: 403 });
    }

    const resolvedParams = await params;
    const targetUserId = resolvedParams?.id;

    if (!targetUserId) {
      return NextResponse.json({ error: "ไม่พบรหัสผู้ใช้ที่ต้องการแก้ไข" }, { status: 400 });
    }

    const { name, email, role, password } = await req.json();

    // จัดเตรียมข้อมูลที่จะอัปเดต
    const updateData: any = {
      name: name?.trim(),
      email: email?.trim(),
      role,
    };

    // หากมีการกรอกรหัสผ่านใหม่เข้ามา ให้เข้ารหัสด้วย bcrypt
    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password.trim(), 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error("Update user error:", error);
    if (error.code === "P2002") {
      return NextResponse.json({ error: "อีเมลนี้ถูกใช้งานแล้วในระบบ" }, { status: 400 });
    }
    return NextResponse.json({ error: "ไม่สามารถแก้ไขข้อมูลพนักงานได้" }, { status: 500 });
  }
}