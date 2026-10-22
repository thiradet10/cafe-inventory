import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";

// GET: ดึงข้อมูลโปรไฟล์ส่วนตัวของผู้ใช้ที่ล็อกอินอยู่
export async function GET() {
  try {
    const session = await auth();
    const currentUserId = (session?.user as { id?: string })?.id;

    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "ไม่พบข้อมูลผู้ใช้" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Fetch profile error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

// PUT: แก้ไขชื่อ อีเมล และ/หรือ เปลี่ยนรหัสผ่าน
export async function PUT(req: Request) {
  try {
    const session = await auth();
    const currentUserSession = session?.user as { id?: string; email?: string } | undefined;

    if (!currentUserSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email, currentPassword, newPassword } = await req.json();

    // ดึงข้อมูลผู้ใช้จาก DB เพื่อตรวจสอบรหัสผ่านเดิม
    const currentUser = await prisma.user.findFirst({
      where: {
        OR: [
          ...(currentUserSession.id ? [{ id: currentUserSession.id }] : []),
          ...(currentUserSession.email ? [{ email: currentUserSession.email }] : []),
        ],
      },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "ไม่พบข้อมูลผู้ใช้นี้ในระบบ" }, { status: 404 });
    }

    const updateData: { name?: string; email?: string; password?: string } = {};

    if (name && name.trim() !== "") updateData.name = name.trim();
    if (email && email.trim() !== "") updateData.email = email.trim();

    // ประมวลผลเปลี่ยนรหัสผ่าน (ถ้ามีการกรอกรหัสผ่านใหม่เข้ามา)
    if (newPassword && newPassword.trim() !== "") {
      if (!currentPassword) {
        return NextResponse.json({ error: "กรุณากรอกรหัสผ่านปัจจุบันเพื่อยืนยันการเปลี่ยนแปลง" }, { status: 400 });
      }

      // ตรวจสอบความถูกต้องของรหัสผ่านปัจจุบัน
      if (currentUser.password) {
        const isPasswordMatch = await bcrypt.compare(currentPassword, currentUser.password);
        if (!isPasswordMatch) {
          return NextResponse.json({ error: "รหัสผ่านปัจจุบันไม่ถูกต้อง" }, { status: 400 });
        }
      }

      // เข้ารหัสรหัสผ่านใหม่ด้วย bcrypt
      updateData.password = await bcrypt.hash(newPassword.trim(), 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
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
    console.error("Update profile error:", error);
    if (error.code === "P2002") {
      return NextResponse.json({ error: "อีเมลนี้ถูกใช้งานในระบบแล้ว" }, { status: 400 });
    }
    return NextResponse.json({ error: "ไม่สามารถอัปเดตโปรไฟล์ได้" }, { status: 500 });
  }
}