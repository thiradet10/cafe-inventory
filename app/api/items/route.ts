import { NextResponse } from 'next/server' // นำเข้า NextResponse จาก Next.js สำหรับส่ง HTTP Response กลับไปยัง Client
import { prisma } from '@/lib/prisma' // นำเข้าตัวจัดการฐานข้อมูล Prisma ORM Client
import { itemSchema } from '@/lib/validation' // นำเข้า Zod Schema สำหรับทำ Data Validation ตรวจสอบความถูกต้องของข้อมูลสินค้า

// GET: ดึงรายการสินค้าทั้งหมด
export async function GET() {
  try {
    // ดึงรายการวัตถุดิบทั้งหมดจากฐานข้อมูล โดยเรียงลำดับตามวันที่สร้างล่าสุด (createdAt: desc)
    const items = await prisma.item.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(items) // ส่งคืนข้อมูลรายการสินค้ากลับในรูปแบบ JSON
  } catch {
    // หากเกิดข้อผิดพลาดขณะดึงข้อมูล ให้ตอบกลับด้วย Error Message พร้อมสถานะ HTTP 500
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า' },
      { status: 500 }
    )
  }
}

// POST: เพิ่มสินค้า/วัตถุดิบใหม่
export async function POST(request: Request) {
  try {
    const body = await request.json() // แปลง Request Body ที่รับเข้ามาให้อยู่ในรูปแบบ JSON
    const validatedData = itemSchema.parse(body) // ตรวจสอบความถูกต้องและประเภทข้อมูลด้วย Zod Schema

    // บันทึกข้อมูลวัตถุดิบรายการใหม่ลงในฐานข้อมูลผ่าน Prisma ORM
    const newItem = await prisma.item.create({
      data: validatedData,
    })

    return NextResponse.json(newItem, { status: 201 }) // ส่งคืนข้อมูลวัตถุดิบที่ถูกสร้างใหม่ พร้อมสถานะ HTTP 201 Created
  } catch (error: unknown) {
    // หากเกิดข้อผิดพลาดจากการทำ Data Validation ของ Zod ให้ตอบกลับด้วยสถานะ HTTP 400 Bad Request
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
      return NextResponse.json({ error: error }, { status: 400 })
    }
    // หากเกิดข้อผิดพลาดอื่นในระบบฝั่ง Server ให้ตอบกลับด้วยสถานะ HTTP 500 Internal Server Error
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' },
      { status: 500 }
    )
  }
}