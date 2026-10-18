import type { Metadata } from 'next' // ชนิดข้อมูล Metadata สำหรับกำหนดหัวข้อและรายละเอียดของหน้าเว็บ
import { Prompt } from 'next/font/google' // นำเข้าฟอนต์ Prompt จาก Google Fonts
import './globals.css' // นำเข้าไฟล์ CSS หลักประจำแอปพลิเคชัน
import { SessionProvider } from 'next-auth/react' // Context Provider ของ NextAuth สำหรับส่งข้อมูล Session ไปทั่วทั้งระบบ

// ตั้งค่าฟอนต์ Prompt เพื่อรองรับทั้งภาษาไทยและอังกฤษ
const prompt = Prompt({
  subsets: ['latin', 'thai'], // โหลดตัวอักษรภาษาอังกฤษและภาษาไทย
  weight: ['300', '400', '500', '600', '700'], // ระบุระดับความหนาของตัวหนังสือที่ใช้งาน
  display: 'swap', // เทคนิคสลับฟอนต์อัตโนมัติ เพื่อเพิ่มความเร็วในการเปิดหน้าเว็บ
})

// กำหนดข้อมูล Metadata ของระบบสำหรับแสดงผลบน Browser Tab และ Search Engine (SEO)
export const metadata: Metadata = {
  title: 'Café & Bakery Inventory System', // ชื่อระบบที่แสดงบน Browser Tab
  description: 'ระบบจัดการสต็อกสินค้าและวัตถุดิบร้ากาแฟ', // คำอธิบายรายละเอียดของระบบ
}

// RootLayout: โครงสร้างหลัก (Root Template) ที่ครอบทุกๆ หน้าใน Next.js App Router
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // กำหนดภาษาของเว็บเป็นภาษาไทย (lang="th") และนำฟอนต์ Prompt มาประยุกต์ใช้ทั้งแอปพลิเคชัน
    <html lang="th" className={prompt.className}>
      <body className="antialiased bg-[#FAF7F2] text-stone-900">
        {/* ครอบด้วย SessionProvider เพื่อให้ Client Component ทุกหน้า (รวมถึง app/page.tsx) สามารถดึง Session ผ่าน useSession() ได้ทันที */}
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}