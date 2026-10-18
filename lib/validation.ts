import { z } from 'zod'

// Schema สำหรับตรวจสอบข้อมูลสินค้า/วัตถุดิบ
export const itemSchema = z.object({
  itemCode: z.string().min(1, 'กรุณากรอกรหัสสินค้า'),
  name: z.string().min(1, 'กรุณากรอกชื่อวัตถุดิบ/สินค้า'),
  category: z.string().min(1, 'กรุณาระบุหมวดหมู่'),
  quantity: z.coerce.number().min(0, 'จำนวนสต็อกต้องไม่ติดลบ'),
  unit: z.string().min(1, 'กรุณาระบุหน่วยนับ'),
  minQuantity: z.coerce.number().min(0, 'จุดเตือนสต็อกต่ำต้องไม่ติดลบ'),
  pricePerUnit: z.coerce.number().min(0, 'ราคาต่อหน่วยต้องไม่ติดลบ'),
  expiryDate: z.string().nullable().optional(),// รองรับวันหมดอายุ
})

// Schema สำหรับตรวจสอบข้อมูลผู้ใช้งาน
export const userSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อผู้ใช้งาน'),
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
  password: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
  role: z.enum(['STAFF', 'MANAGER']).default('STAFF'),
})