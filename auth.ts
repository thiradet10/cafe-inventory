import NextAuth from 'next-auth' // นำเข้าโมดูลหลัก NextAuth.js (v5) สำหรับการจัดการระบบ Authentication
import Google from 'next-auth/providers/google' // นำเข้า Google Provider สำหรับเข้าสู่ระบบด้วย Google OAuth
import Credentials from 'next-auth/providers/credentials' // นำเข้า Credentials Provider สำหรับเข้าสู่ระบบด้วย อีเมล/รหัสผ่าน
import { prisma } from '@/lib/prisma' // นำเข้า Prisma Client สำหรับค้นหาและบันทึกข้อมูลในฐานข้อมูล
import bcrypt from 'bcryptjs' // นำเข้า bcryptjs สำหรับตรวจสอบการเปรียบเทียบรหัสผ่านที่เข้ารหัสไว้
import { authConfig } from './auth.config' // นำเข้าการตั้งค่าตั้งต้นของ Auth จาก auth.config.ts

// ส่งออกฟังก์ชันหลักของ NextAuth ได้แก่ handlers, signIn, signOut และ auth
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig, // ดึงการตั้งค่าพื้นฐานจาก authConfig มาขยายต่อ
  providers: [
    // 1. Google OAuth Provider: จัดการการเข้าสู่ระบบด้วย Google
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET,
    }),
    // 2. Credentials Provider: จัดการการเข้าสู่ระบบด้วย Email และ Password
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      // ฟังก์ชัน authorize: ตรวจสอบความถูกต้องของอีเมลและรหัสผ่านกับฐานข้อมูล
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null // ปฏิเสธการเข้าสู่ระบบหากกรอกข้อมูลไม่ครบ
        }

        // ค้นหาผู้ใช้จากอีเมลในฐานข้อมูลผ่าน Prisma
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        // หากไม่พบผู้ใช้งาน หรือบัญชีนั้นไม่มีรหัสผ่าน (เช่น สมัครผ่าน OAuth) ให้ปฏิเสธการเข้าสู่ระบบ
        if (!user || !user.password) {
          return null
        }

        // ตรวจสอบความถูกต้องของรหัสผ่านที่กรอกมาเทียบกับรหัสผ่านที่ถูก Hash ไว้ด้วย bcrypt
        const isValidPassword = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isValidPassword) {
          return null // รหัสผ่านไม่ถูกต้อง
        }

        // ส่งคืนข้อมูลผู้ใช้งาน ( id, name, email, role ) เข้าสู่ระบบสำเร็จ
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    // Callback signIn: ประมวลผลเมื่อมีการล็อกอินสำเร็จ (ใช้สำหรับ Auto-Provisioning บัญชี Google)
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          if (!user.email) return false

          // ตรวจสอบว่ามีผู้ใช้งานอีเมล Google นี้ในฐานข้อมูลแล้วหรือยัง
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          })

          // หากยังไม่มี ให้สร้างบัญชีใหม่ลงฐานข้อมูลอัตโนมัติพร้อมกำหนดสิทธิ์เริ่มต้นเป็น STAFF
          if (!existingUser) {
            await prisma.user.create({
              data: {
                name: user.name || 'พนักงาน Google',
                email: user.email,
                role: 'STAFF',
              },
            })
          }
          return true
        } catch (error) {
          console.error('Error saving Google user:', error)
          return false
        }
      }
      return true
    },
    // Callback jwt: แนบสิทธิ์ (Role) จากฐานข้อมูลเข้าไปยัง JWT Token
    async jwt({ token }) {
      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
        })
        if (dbUser) {
          token.role = dbUser.role // ผูกค่า Role เข้ากับ Token
        }
      }
      return token
    },
    // Callback session: นำค่า Role จาก JWT Token มาใส่ไว้ใน Session Object ของผู้ใช้งาน
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as { role?: string }).role = token.role as string
      }
      return session
    },
  },
})