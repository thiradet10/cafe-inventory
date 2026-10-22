// นำเข้าตัวจัดการคำขอ Authentication (handlers) จากไฟล์ตั้งค่าหลัก (@/auth) ของ NextAuth v5
import { handlers } from '@/auth'
// ส่งออก (Export) HTTP Handlers สำหรับคำขอแบบ GET และ POST ให้ Next.js App Router จัดการ API Route ของ NextAuth ทั้งหมดอัตโนมัติ
export const { GET, POST } = handlers
