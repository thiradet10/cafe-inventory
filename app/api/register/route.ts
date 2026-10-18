import { NextResponse } from 'next/server' // นำเข้า NextResponse สำหรับส่ง HTTP Response กลับไปยัง Client
import { prisma } from '@/lib/prisma' // นำเข้า Prisma Client สำหรับจัดการคำสั่งและเชื่อมต่อฐานข้อมูล
import bcrypt from 'bcryptjs' // นำเข้าไลบรารี bcryptjs สำหรับทำ Password Hashing เพื่อความปลอดภัย

// POST: API Handler สำหรับประมวลผลการสมัครสมาชิกพนักงานใหม่
export async function POST(request: Request) {
  try {
    // 1. อ่านข้อมูล name, email, password ที่ส่งมาจาก Request Body
    const { name, email, password } = await request.json()

    // 2. ตรวจสอบความครบถ้วนของข้อมูล (Validation) หากกรอกไม่ครบให้ตอบกลับด้วย HTTP 400 Bad Request
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      )
    }

    // 3. ตรวจสอบว่ามีอีเมลนี้อยู่ในระบบแล้วหรือยัง ผ่าน Prisma ORM
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    // หากพบว่าอีเมลซ้ำ ให้ตอบกลับแจ้งเตือนพร้อมสถานะ HTTP 400 Bad Request
    if (existingUser) {
      return NextResponse.json(
        { error: 'อีเมลนี้ถูกใช้งานในระบบแล้ว' },
        { status: 400 }
      )
    }

    // 4. เข้ารหัสรหัสผ่าน (Password Hashing) ด้วย bcryptjs โดยกำหนด Salt Rounds เป็น 10
    const hashedPassword = await bcrypt.hash(password, 10)

    // 5. บันทึกข้อมูลผู้ใช้ใหม่ลงฐานข้อมูล พร้อมกำหนดสิทธิ์ role เป็น 'STAFF' เป็นค่าเริ่มต้น
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'STAFF',
      },
    })

    // ส่งคืนคำตอบกลับสำเร็จพร้อม ID ของผู้ใช้ใหม่
    return NextResponse.json({
      message: 'สมัครสมาชิกสำเร็จ',
      userId: newUser.id,
    })
  } catch {
    // ตอบกลับด้วยสถานะ HTTP 500 Internal Server Error เมื่อเกิดข้อผิดพลาดฝั่ง Server
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการสมัครสมาชิก' },
      { status: 500 }
    )
  }
}