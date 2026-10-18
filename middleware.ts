import NextAuth from 'next-auth' // นำเข้าโมดูลหลัก NextAuth.js (v5) สำหรับการประมวลผล Middleware
import { authConfig } from './auth.config' // นำเข้าไฟล์ตั้งค่าคอนฟิกพื้นฐานและเงื่อนไขการเข้าถึงจาก auth.config.ts

// ส่งออก Middleware function ของ NextAuth v5 เพื่อคัดกรองและตรวจสอบ Session การเข้าสู่ระบบก่อนโหลดหน้าเว็บ
export default NextAuth(authConfig).auth

// กำหนดการตั้งค่า Matcher สำหรับระบุเส้นทาง (Routes) ที่ต้องการให้ Middleware ทำงานดักจับ
export const config = {
  // ใช้ Regular Expression ในการปกป้องทุก Route ในระบบ
  // ยกเว้น (Bypass): API Routes, static files, รูปภาพ, favicon, หน้า /login และหน้า /register เพื่อให้เข้าถึงได้โดยไม่ต้องยืนยันตัวตน
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login|register).*)'],
}