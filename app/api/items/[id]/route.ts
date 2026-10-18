import { NextResponse } from 'next/server' // นำเข้า NextResponse สำหรับส่ง HTTP Response กลับไปยัง Client
import { prisma } from '@/lib/prisma' // นำเข้า Prisma Client สำหรับทำคำสั่งจัดการฐานข้อมูล
import { itemSchema } from '@/lib/validation' // นำเข้า Zod Schema สำหรับตรวจสอบความถูกต้องของข้อมูลสินค้า
import { auth } from '@/auth' // นำเข้าฟังก์ชัน auth จาก NextAuth v5 สำหรับดึง Session ตรวจสอบสิทธิ์ผู้ใช้งาน

// GET: ดึงข้อมูลสินค้าเฉพาะรายการตาม ID (Dynamic Route Parameter)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // รับ Parameter id จาก Dynamic Route URL
) {
  try {
    const { id } = await params // คลี่ค่า params เพื่อนำ id มาใช้งาน
    // ค้นหาวัตถุดิบในฐานข้อมูลจาก ID โดยแปลงจาก String เป็น Integer
    const item = await prisma.item.findUnique({
      where: { id: parseInt(id) },
    })

    // หากไม่พบรายการสินค้าในฐานข้อมูล ให้ตอบกลับด้วยสถานะ HTTP 404 Not Found
    if (!item) {
      return NextResponse.json({ error: 'ไม่พบรายการสินค้า' }, { status: 404 })
    }

    return NextResponse.json(item) // ส่งคืนข้อมูลวัตถุดิบที่ค้นพบกลับเป็น JSON
  } catch {
    // ตอบกลับด้วยสถานะ HTTP 500 เมื่อเกิดข้อผิดพลาดฝั่ง Server
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
      { status: 500 }
    )
  }
}

// PUT: แก้ไขข้อมูลสินค้า (จำกัดสิทธิ์เฉพาะผู้จัดการร้าน MANAGER เท่านั้น)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. ตรวจสอบ Session และสิทธิ์ Role-Based Access Control (RBAC) ฝั่ง Server
    const session = await auth()
    const userRole = (session?.user as { role?: string })?.role
    // หากไม่มี Session หรือผู้ใช้งานไม่ได้มี Role เป็น MANAGER ให้ปฏิเสธคำขอด้วย HTTP 403 Forbidden
    if (!session || userRole !== 'MANAGER') {
      return NextResponse.json(
        { error: 'คุณไม่มีสิทธิ์ในการแก้ไขรายการนี้ (เฉพาะผู้จัดการเท่านั้น)' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json() // อ่านข้อมูล JSON จาก Request Body
    const validatedData = itemSchema.parse(body) // ตรวจสอบโครงสร้างข้อมูลด้วย Zod Schema

    // 2. ทำการอัปเดตข้อมูลวัตถุดิบรายการนี้ในฐานข้อมูลผ่าน Prisma ORM
    const updatedItem = await prisma.item.update({
      where: { id: parseInt(id) },
      data: validatedData,
    })

    return NextResponse.json(updatedItem) // ส่งคืนข้อมูลวัตถุดิบฉบับอัปเดตใหม่กลับไป
  } catch (error: unknown) {
    // หากข้อมูลที่ส่งมาไม่ผ่านการทำ Data Validation ของ Zod ให้ตอบกลับด้วย HTTP 400 Bad Request
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
      return NextResponse.json({ error: error }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' },
      { status: 500 }
    )
  }
}

// DELETE: ลบสินค้าออกจากระบบ (จำกัดสิทธิ์เฉพาะผู้จัดการร้าน MANAGER เท่านั้น)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. ตรวจสอบ Session และสิทธิ์ RBAC ฝั่ง Server ว่าเป็น MANAGER หรือไม่
    const session = await auth()
    const userRole = (session?.user as { role?: string })?.role
    if (!session || userRole !== 'MANAGER') {
      return NextResponse.json(
        { error: 'คุณไม่มีสิทธิ์ในการลบรายการนี้ (เฉพาะผู้จัดการเท่านั้น)' },
        { status: 403 }
      )
    }

    const { id } = await params
    // 2. สั่งลบวัตถุดิบรายการนี้ออกจากฐานข้อมูล Prisma ตาม ID
    await prisma.item.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({ message: 'ลบรายการสินค้าเรียบร้อยแล้ว' }) // ส่งข้อความยืนยันการลบข้อมูลสำเร็จ
  } catch {
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการลบข้อมูล' },
      { status: 500 }
    )
  }
}