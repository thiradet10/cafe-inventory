import { NextResponse } from 'next/server' // นำเข้า NextResponse สำหรับส่ง HTTP Response กลับไปยัง Client
import { prisma } from '@/lib/prisma' // นำเข้า Prisma Client สำหรับจัดการคำสั่งและเชื่อมต่อฐานข้อมูล
import { auth } from '@/auth' // นำเข้าฟังก์ชัน auth จาก NextAuth v5 สำหรับดึง Session ตรวจสอบสิทธิ์ผู้ใช้งาน
import bcrypt from 'bcryptjs' // นำเข้าไลบรารี bcryptjs สำหรับทำ Password Hashing เพื่อความปลอดภัย

// GET: ดึงรายการผู้ใช้งานทั้งหมด (จำกัดสิทธิ์เฉพาะผู้จัดการร้าน MANAGER เท่านั้น)
export async function GET() {
  try {
    // 1. ตรวจสอบ Session และสิทธิ์ Role-Based Access Control (RBAC) ฝั่ง Server
    const session = await auth()
    const userRole = (session?.user as { role?: string })?.role

    // หากไม่มี Session หรือผู้ใช้งานไม่ได้มี Role เป็น MANAGER ให้ปฏิเสธคำขอด้วย HTTP 403 Forbidden
    if (!session || userRole !== 'MANAGER') {
      return NextResponse.json(
        { error: 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้ (เฉพาะผู้จัดการเท่านั้น)' },
        { status: 403 }
      )
    }

    // 2. ดึงรายชื่อผู้ใช้ทั้งหมดจากฐานข้อมูลผ่าน Prisma ORM โดยคัดเลือกเฉพาะ Field ที่ปลอดภัย (ไม่ดึง password ออกมา)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        id: 'asc',
      },
    })

    return NextResponse.json(users) // ส่งคืนรายการผู้ใช้งานกลับในรูปแบบ JSON
  } catch {
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้งาน' },
      { status: 500 }
    )
  }
}

// POST: เพิ่มพนักงานใหม่ลงในระบบ (จำกัดสิทธิ์เฉพาะผู้จัดการร้าน MANAGER เท่านั้น)
export async function POST(request: Request) {
  try {
    // 1. ตรวจสอบ Session และสิทธิ์ RBAC ฝั่ง Server ว่าเป็น MANAGER หรือไม่
    const session = await auth()
    const userRole = (session?.user as { role?: string })?.role

    if (!session || userRole !== 'MANAGER') {
      return NextResponse.json(
        { error: 'คุณไม่มีสิทธิ์ทำรายการนี้ (เฉพาะผู้จัดการเท่านั้น)' },
        { status: 403 }
      )
    }

    // 2. อ่านข้อมูล name, email, password, role ที่ส่งมาจาก Request Body
    const { name, email, password, role } = await request.json()

    // 3. ตรวจสอบความครบถ้วนของข้อมูล หากกรอกไม่ครบให้ตอบกลับด้วย HTTP 400 Bad Request
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      )
    }

    // 4. ตรวจสอบว่ามีอีเมลนี้ถูกใช้งานในระบบแล้วหรือยัง
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'อีเมลนี้ถูกใช้งานในระบบแล้ว' },
        { status: 400 }
      )
    }

    // 5. เข้ารหัสรหัสผ่าน (Password Hashing) ด้วย bcryptjs ก่อนจัดเก็บ
    const hashedPassword = await bcrypt.hash(password, 10)

    // 6. บันทึกบัญชีผู้ใช้งานใหม่ โดยกำหนดสิทธิ์ตามที่เลือก (MANAGER หรือ STAFF)
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role === 'MANAGER' ? 'MANAGER' : 'STAFF',
      },
    })

    return NextResponse.json({
      message: 'สร้างบัญชีผู้ใช้งานเรียบร้อยแล้ว',
      userId: newUser.id,
    })
  } catch {
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการสร้างผู้ใช้งาน' },
      { status: 500 }
    )
  }
}