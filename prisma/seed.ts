import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // 1. ล้างข้อมูลเก่าเพื่อป้องกัน Foreign Key Error หรือข้อมูลซ้ำ
  await prisma.stockLog.deleteMany()
  await prisma.item.deleteMany()
  await prisma.user.deleteMany()

  // 2. เข้ารหัสรหัสผ่านเริ่มต้น (123456)
  const hashedPassword = await bcrypt.hash('123456', 10)

  // 3. สร้างข้อมูลผู้ใช้ทดสอบ (Manager และ Staff)
  const manager = await prisma.user.create({
    data: {
      name: 'ผู้จัดการ สมชาย',
      email: 'manager@cafe.com',
      password: hashedPassword,
      role: 'MANAGER',
    },
  })

  const staff = await prisma.user.create({
    data: {
      name: 'พนักงาน สมศรี',
      email: 'staff@cafe.com',
      password: hashedPassword,
      role: 'STAFF',
    },
  })

  // 4. สร้างข้อมูลวัตถุดิบและสินค้า ครบถ้วนทุกหมวดหมู่
  await prisma.item.createMany({
    data: [
      // ==========================================
      // ☕ 1. หมวดหมู่: เมล็ดกาแฟ
      // ==========================================
      {
        itemCode: 'CF-001',
        name: 'เมล็ดกาแฟ อาราบิก้า 100% (1 kg)',
        category: 'เมล็ดกาแฟ',
        quantity: 20,
        unit: 'ถุง',
        minQuantity: 5,
        pricePerUnit: 350,
        expiryDate: new Date('2027-12-31'),
      },
      {
        itemCode: 'CF-002',
        name: 'เมล็ดกาแฟ โรบัสต้า คั่วเข้ม (1 kg)',
        category: 'เมล็ดกาแฟ',
        quantity: 15,
        unit: 'ถุง',
        minQuantity: 5,
        pricePerUnit: 280,
        expiryDate: new Date('2027-10-15'),
      },
      {
        itemCode: 'CF-003',
        name: 'เมล็ดกาแฟ เอธิโอเปีย คั่วอ่อน (500g)',
        category: 'เมล็ดกาแฟ',
        quantity: 8,
        unit: 'ถุง',
        minQuantity: 3,
        pricePerUnit: 450,
        expiryDate: new Date('2027-08-20'),
      },

      // ==========================================
      // 🥛 2. หมวดหมู่: ผลิตภัณฑ์นม
      // ==========================================
      {
        itemCode: 'DY-001',
        name: 'นมสดพาสเจอร์ไรส์ (2L)',
        category: 'ผลิตภัณฑ์นม',
        quantity: 2, // ⚠️ แจ้งเตือน: สต็อกต่ำกว่า minQuantity
        unit: 'แกลลอน',
        minQuantity: 5,
        pricePerUnit: 95,
        expiryDate: new Date('2026-10-20'), // ⚠️ แจ้งเตือน: ใกล้หมดอายุ
      },
      {
        itemCode: 'DY-002',
        name: 'นมข้นหวาน ตราหมี (2 kg)',
        category: 'ผลิตภัณฑ์นม',
        quantity: 12,
        unit: 'กระป๋อง',
        minQuantity: 4,
        pricePerUnit: 120,
        expiryDate: new Date('2027-06-30'),
      },
      {
        itemCode: 'DY-003',
        name: 'วิปปิ้งครีม แดรี่ Anchor (1L)',
        category: 'ผลิตภัณฑ์นม',
        quantity: 6,
        unit: 'กล่อง',
        minQuantity: 3,
        pricePerUnit: 165,
        expiryDate: new Date('2026-11-15'),
      },
      {
        itemCode: 'DY-004',
        name: 'นมโอ๊ต Oatly Barista Edition (1L)',
        category: 'ผลิตภัณฑ์นม',
        quantity: 10,
        unit: 'กล่อง',
        minQuantity: 4,
        pricePerUnit: 115,
        expiryDate: new Date('2027-03-10'),
      },

      // ==========================================
      // 🥐 3. หมวดหมู่: เบเกอรี่
      // ==========================================
      {
        itemCode: 'BK-001',
        name: 'แป้งเค้กพรีเมียม (1 kg)',
        category: 'เบเกอรี่',
        quantity: 12,
        unit: 'ถุง',
        minQuantity: 4,
        pricePerUnit: 65,
        expiryDate: new Date('2027-09-10'),
      },
      {
        itemCode: 'BK-002',
        name: 'ครัวซองต์เนยสดฝรั่งเศส (แช่แข็ง)',
        category: 'เบเกอรี่',
        quantity: 30,
        unit: 'ชิ้น',
        minQuantity: 10,
        pricePerUnit: 35,
        expiryDate: new Date('2026-11-05'),
      },
      {
        itemCode: 'BK-003',
        name: 'แป้งสาลีอเนกประสงค์ (1 kg)',
        category: 'เบเกอรี่',
        quantity: 25,
        unit: 'กิโลกรัม',
        minQuantity: 8,
        pricePerUnit: 42,
        expiryDate: new Date('2027-08-01'),
      },
      {
        itemCode: 'BK-004',
        name: 'ช็อกโกแลตชิพ 70% (1 kg)',
        category: 'เบเกอรี่',
        quantity: 2, // ⚠️ แจ้งเตือน: สต็อกต่ำ
        unit: 'ถุง',
        minQuantity: 4,
        pricePerUnit: 320,
        expiryDate: new Date('2027-05-20'),
      },

      // ==========================================
      // 🍯 4. หมวดหมู่: ไซรัป / น้ำเชื่อม
      // ==========================================
      {
        itemCode: 'SY-001',
        name: 'ไซรัปวานิลลา Monin (750 ml)',
        category: 'ไซรัป / น้ำเชื่อม',
        quantity: 2, // ⚠️ แจ้งเตือน: สต็อกต่ำ
        unit: 'ขวด',
        minQuantity: 3,
        pricePerUnit: 380,
        expiryDate: new Date('2028-01-01'),
      },
      {
        itemCode: 'SY-002',
        name: 'ไซรัปคาราเมล Torani (750 ml)',
        category: 'ไซรัป / น้ำเชื่อม',
        quantity: 5,
        unit: 'ขวด',
        minQuantity: 2,
        pricePerUnit: 360,
        expiryDate: new Date('2028-01-01'),
      },
      {
        itemCode: 'SY-003',
        name: 'ซอสช็อกโกแลตเข้มข้น Hershey\'s (1.3 kg)',
        category: 'ไซรัป / น้ำเชื่อม',
        quantity: 4,
        unit: 'ขวด',
        minQuantity: 2,
        pricePerUnit: 290,
        expiryDate: new Date('2027-09-15'),
      },

      // ==========================================
      // 🍵 5. หมวดหมู่: ชาและเครื่องดื่ม
      // ==========================================
      {
        itemCode: 'TE-001',
        name: 'ผงมัทฉะเกรดพิธีการ จากอูจิ (100g)',
        category: 'ชาและเครื่องดื่ม',
        quantity: 4,
        unit: 'ถุง',
        minQuantity: 2,
        pricePerUnit: 650,
        expiryDate: new Date('2027-06-30'),
      },
      {
        itemCode: 'TE-002',
        name: 'ผงชาไทย ตรามือ (400g)',
        category: 'ชาและเครื่องดื่ม',
        quantity: 15,
        unit: 'ถุง',
        minQuantity: 5,
        pricePerUnit: 85,
        expiryDate: new Date('2027-10-15'),
      },
      {
        itemCode: 'TE-003',
        name: 'ชาเอิร์ลเกรย์ Twinings (100 ซอง)',
        category: 'ชาและเครื่องดื่ม',
        quantity: 6,
        unit: 'กล่อง',
        minQuantity: 2,
        pricePerUnit: 320,
        expiryDate: new Date('2028-03-01'),
      },

      // ==========================================
      // 📦 6. หมวดหมู่: บรรจุภัณฑ์
      // ==========================================
      {
        itemCode: 'PK-001',
        name: 'แก้วพลาสติก PET 16oz (100 ใบ)',
        category: 'บรรจุภัณฑ์',
        quantity: 15,
        unit: 'แพ็ค',
        minQuantity: 5,
        pricePerUnit: 140,
      },
      {
        itemCode: 'PK-002',
        name: 'ฝาฮาฟโดม ปาก 95mm (100 ใบ)',
        category: 'บรรจุภัณฑ์',
        quantity: 15,
        unit: 'แพ็ค',
        minQuantity: 5,
        pricePerUnit: 65,
      },
      {
        itemCode: 'PK-003',
        name: 'หลอดพลาสติกงอหุ้มกระดาษ (100 เส้น)',
        category: 'บรรจุภัณฑ์',
        quantity: 25,
        unit: 'แพ็ค',
        minQuantity: 8,
        pricePerUnit: 45,
      },
      {
        itemCode: 'PK-004',
        name: 'ถุงกระดาษคราฟท์หูหิ้ว (50 ใบ)',
        category: 'บรรจุภัณฑ์',
        quantity: 3, // ⚠️ แจ้งเตือน: สต็อกต่ำ
        unit: 'แพ็ค',
        minQuantity: 5,
        pricePerUnit: 120,
      },

      // ==========================================
      // 🧊 7. หมวดหมู่: อื่นๆ
      // ==========================================
      {
        itemCode: 'OT-001',
        name: 'น้ำแข็งยูนิตสะอาด (10 kg)',
        category: 'อื่นๆ',
        quantity: 5,
        unit: 'ถุง',
        minQuantity: 2,
        pricePerUnit: 55,
        expiryDate: new Date('2026-10-21'), // ⚠️ แจ้งเตือน: ใกล้หมดอายุ
      },
      {
        itemCode: 'OT-002',
        name: 'กระดาษทิชชู่เช็ดปาก Pop-up (40 ซอง)',
        category: 'อื่นๆ',
        quantity: 3,
        unit: 'กล่อง',
        minQuantity: 2,
        pricePerUnit: 280,
      },
    ],
  })

  console.log('🌱 Seed ข้อมูลเริ่มต้นเรียบร้อยแล้ว!')
  console.log(`- Manager: ${manager.email} | Password: 123456`)
  console.log(`- Staff:   ${staff.email} | Password: 123456`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })