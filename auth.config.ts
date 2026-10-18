import type { NextAuthConfig } from 'next-auth' // นำเข้า Type Definition สำหรับระบุชนิดข้อมูลคอนฟิกของ NextAuth.js (v5)

// กำหนดโครงสร้างการตั้งค่าคอนฟิกพื้นฐานสำหรับระบบ Authentication (authConfig)
export const authConfig = {
  // 1. CUSTOM PAGES: กำหนดหน้าจอหลักสำหรับเข้าสู่ระบบของแอปพลิเคชัน
  pages: {
    signIn: '/login', // กำหนดให้ Redirect ผู้ใช้งานไปยังหน้า /login เมื่อต้องยืนยันตัวตน
  },
  // 2. CALLBACKS: ฟังก์ชันตรวจสอบสิทธิ์การเข้าถึงเส้นทางต่างๆ ในระบบ (ทำงานร่วมกับ Middleware บน Edge Runtime)
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user // ตรวจสอบว่าผู้ใช้งานเข้าสู่ระบบแล้วหรือยัง (แปลงเป็นค่า Boolean)
      const isOnDashboard = nextUrl.pathname === '/' // ตรวจสอบว่ากำลังขอเข้าถึงหน้าแดชบอร์ดหลักหรือไม่

      // เงื่อนไขคัดกรองการเข้าถึงหน้า Dashboard
      if (isOnDashboard) {
        if (isLoggedIn) return true // หากเข้าสู่ระบบแล้ว อนุญาตให้เข้าใช้งานได้
        return false // หากยังไม่ได้เข้าสู่ระบบ ให้ปฏิเสธและ Redirect ไปหน้า /login
      }
      return true // หน้าอื่นๆ อนุญาตให้ผ่านตามปกติ
    },
  },
  providers: [], // เว้นว่างไว้เพื่อนำไปขยายต่อใน auth.ts (แยกส่วนเฉพาะที่ทำงานบน Node.js Runtime เพื่อความเบาบน Edge Middleware)
} satisfies NextAuthConfig // ใช้คีย์เวิร์ด satisfies เพื่อตรวจสอบ Type Safety ให้ตรงตามมาตรฐานของ NextAuthConfig