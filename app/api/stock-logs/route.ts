import { NextResponse } from 'next/server' // นำเข้า NextResponse สำหรับส่ง HTTP Response กลับไปยัง Client
import { prisma } from '@/lib/prisma' // นำเข้า Prisma Client สำหรับจัดการคำสั่งและเชื่อมต่อฐานข้อมูล
import { auth } from '@/auth' // นำเข้าฟังก์ชัน auth จาก NextAuth v5 สำหรับดึง Session ตรวจสอบการเข้าสู่ระบบ

// GET: ดึงประวัติการทำรายการสต็อก (Audit Trail) 50 รายการล่าสุด
export async function GET() {
  try {
    // 1. ตรวจสอบการเข้าสู่ระบบ (Authentication Check)
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 })
    }

    // 2. ดึงข้อมูลประวัติสต็อก 50 รายการล่าสุด พร้อมเชื่อมข้อมูลตาราง Item และ User (Relation Join)
    const logs = await prisma.stockLog.findMany({
      include: {
        item: { select: { name: true, itemCode: true, unit: true } }, // ดึงเฉพาะชื่อ รหัสสินค้า และหน่วยนับ
        user: { select: { name: true, email: true } }, // ดึงชื่อและอีเมลของผู้ทำรายการ
      },
      orderBy: { createdAt: 'desc' }, // เรียงลำดับจากรายการใหม่ไปเก่า
      take: 50, // จำกัดไว้ที่ 50 รายการล่าสุด
    })

    return NextResponse.json(logs) // ส่งคืนประวัติสต็อกกลับในรูปแบบ JSON
  } catch {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' }, { status: 500 })
  }
}

// POST: บันทึกการเบิกออก (OUT) หรือ เติมสต็อกเข้า (IN)
export async function POST(request: Request) {
  try {
    // 1. ตรวจสอบ Session ผู้ใช้งาน
    const session = await auth()
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 })
    }

    // 2. ค้นหาข้อมูลผู้ใช้ในฐานข้อมูลจากอีเมลใน Session
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'ไม่พบผู้ใช้งาน' }, { status: 404 })
    }

    // 3. อ่านและทำ Data Validation ตรวจสอบความถูกต้องของข้อมูลที่ส่งมา
    const { itemId, type, quantity, note } = await request.json()

    if (!itemId || !type || !quantity || quantity <= 0) {
      return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 })
    }

    // 4. ตรวจสอบว่ามีวัตถุดิบรายการนี้ในคลังจริงหรือไม่
    const item = await prisma.item.findUnique({ where: { id: Number(itemId) } })
    if (!item) {
      return NextResponse.json({ error: 'ไม่พบรายการสินค้า' }, { status: 404 })
    }

    // 5. ป้องกันการเบิกเกินจำนวนสต็อกที่มีอยู่จริง (Overdraft Protection)
    if (type === 'OUT' && item.quantity < Number(quantity)) {
      return NextResponse.json(
        { error: `ยอดคงเหลือไม่พอเบิก (คงเหลือ ${item.quantity} ${item.unit})` },
        { status: 400 }
      )
    }

    // 6. คำนวณจำนวนสต็อกใหม่ตามประเภทรายการ (IN = เพิ่ม, OUT = ลด)
    const newQuantity =
      type === 'IN'
        ? item.quantity + Number(quantity)
        : item.quantity - Number(quantity)

    // 7. ทำ Atomic Transaction ประมวลผล 2 คำสั่งพร้อมกันเพื่อความถูกต้องแม่นยำของข้อมูล
    const [log] = await prisma.$transaction([
      // บันทึกประวัติการทำรายการในตาราง StockLog
      prisma.stockLog.create({
        data: {
          itemId: Number(itemId),
          userId: user.id,
          type,
          quantity: Number(quantity),
          note: note || '',
        },
      }),
      // อัปเดตยอดสต็อกคงเหลือจริงในตาราง Item
      prisma.item.update({
        where: { id: Number(itemId) },
        data: { quantity: newQuantity },
      }),
    ])

    return NextResponse.json(log) // ส่งคืนข้อมูลประวัติบันทึกสำเร็จ
  } catch {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการบันทึกรายการ' }, { status: 500 })
  }
}