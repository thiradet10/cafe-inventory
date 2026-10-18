'use client' // กำหนดให้เป็น React Client Component เพื่อใช้งาน State, Hook และ Event Handler ต่างๆ

import { useState } from 'react'
import { signIn } from 'next-auth/react' // ฟังก์ชันสำหรับสั่งเข้าสู่ระบบผ่าน NextAuth.js
import { useRouter } from 'next/navigation' // Hook สำหรับจัดการเปลี่ยนหน้าเว็บ (Navigation)
import Link from 'next/link' // Component สำหรับสร้างลิงก์เชื่อมโยงข้ามหน้า

export default function RegisterPage() {
  const router = useRouter()

  // ==========================================
  // 1. STATE MANAGEMENT (การจัดการสถานะ)
  // ==========================================
  // State เก็บข้อมูลฟอร์มสมัครสมาชิก (ชื่อ, อีเมล, รหัสผ่าน)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('') // State เก็บข้อความแจ้งเตือนข้อผิดพลาด
  const [loading, setLoading] = useState(false) // State ควบคุมสถานะการประมวลผล (Loading)

  // ==========================================
  // 2. REGISTER & AUTO-LOGIN HANDLER (ฟังก์ชันลงทะเบียน)
  // ==========================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault() // ป้องกันไม่ให้ฟอร์ม Refresh หน้าเว็บ
    setError('')
    setLoading(true)

    try {
      // 1. ส่งข้อมูลไปสร้างบัญชีใหม่ที่ API หลังบ้าน (`POST /api/register`)
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      // หากเซิร์ฟเวอร์ตอบกลับไม่สำเร็จ ให้แสดง Error
      if (!res.ok) {
        setError(data.error || 'เกิดข้อผิดพลาดในการสมัครสมาชิก')
        setLoading(false)
        return
      }

      // 2. เมื่อสมัครสำเร็จ ให้สั่งเข้าสู่ระบบ (Auto-Login) ทันที
      const loginRes = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false, // ไม่ให้ Redirect อัตโนมัติ เพื่อให้เราควบคุมด้วย useRouter เอง
      })

      if (loginRes?.error) {
        // ถ้า Auto-Login ไม่สำเร็จ ให้ย้ายไปหน้า Login
        router.push('/login')
      } else {
        // ถ้าเข้าสู่ระบบสำเร็จ ให้นำไปยังหน้า Dashboard หลัก
        router.push('/')
      }
    } catch {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์')
      setLoading(false)
    }
  }

  // ==========================================
  // 3. RENDER UI (ส่วนแสดงผลหน้าจอ)
  // ==========================================
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-stone-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Light Background Gradient Glows (ตกแต่งแสงพื้นหลัง) */}
      <div className="pointer-events-none fixed -left-32 -top-32 h-[450px] w-[450px] rounded-full bg-amber-200/50 blur-[120px]" />
      <div className="pointer-events-none fixed -right-32 -bottom-32 h-[450px] w-[450px] rounded-full bg-orange-200/40 blur-[130px]" />

      <div className="w-full max-w-md rounded-3xl border border-stone-300/80 bg-white p-8 sm:p-10 shadow-xl shadow-stone-200/60 backdrop-blur-xl relative z-10 overflow-hidden">
        {/* Top Accent Line (เส้นแถบสีตกแต่งด้านบนการ์ด) */}
        <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-amber-500 via-amber-700 to-amber-500" />

        {/* Header Section (ส่วนหัวและโลโก้) */}
        <div className="mb-8 text-center flex flex-col items-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-900 text-2xl text-amber-400 shadow-md">
            ☕
          </div>
          <h1 className="text-2xl font-black text-stone-950 tracking-tight">
            สมัครสมาชิกพนักงาน
          </h1>
          <p className="mt-1 text-xs font-semibold text-stone-500">
            ลงทะเบียนพนักงานเพื่อเข้าใช้งานระบบคลังสินค้า
          </p>
        </div>

        {/* Error Alert (กล่องแจ้งเตือนเมื่อเกิดข้อผิดพลาด) */}
        {error && (
          <div className="mb-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold p-3.5 text-center shadow-sm">
            {error}
          </div>
        )}

        {/* Form (ฟอร์มกรอกข้อมูลการสมัคร) */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              ชื่อ-นามสกุล
            </label>
            <input
              type="text"
              required // บังคับกรอกข้อมูล
              placeholder="สมชาย ใจดี"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full rounded-xl border border-stone-300 bg-stone-50/80 px-4 py-2.5 text-sm font-semibold text-stone-900 placeholder-stone-400 focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              อีเมล
            </label>
            <input
              type="email"
              required // บังคับกรอกข้อมูล
              placeholder="staff@cafe.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full rounded-xl border border-stone-300 bg-stone-50/80 px-4 py-2.5 text-sm font-semibold text-stone-900 placeholder-stone-400 focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              รหัสผ่าน
            </label>
            <input
              type="password"
              required // บังคับกรอกข้อมูล
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full rounded-xl border border-stone-300 bg-stone-50/80 px-4 py-2.5 text-sm font-semibold text-stone-900 placeholder-stone-400 focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 focus:outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading} // ปิดการกดปุ่มซ้ำขณะกำลังประมวลผล
            className="w-full rounded-xl bg-amber-700 py-3 text-sm font-bold text-white shadow-md hover:bg-amber-800 active:scale-[0.98] transition-all disabled:bg-stone-300 disabled:text-stone-500"
          >
            {loading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก (STAFF)'}
          </button>
        </form>

        {/* Divider (เส้นคั่นข้อความ "หรือ") */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="w-full border-t border-stone-200"></div>
          <span className="absolute bg-white px-3 text-xs font-semibold text-stone-400">
            หรือ
          </span>
        </div>

        {/* Google Button (ปุ่มทางเลือกเข้าสู่ระบบด้วย Google OAuth) */}
        <button
          type="button"
          onClick={() => signIn('google', { callbackUrl: '/' })}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-stone-300 bg-white py-2.5 text-sm font-bold text-stone-800 shadow-sm hover:bg-stone-50 hover:border-stone-400 active:scale-[0.98] transition-all"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          เข้าใช้งานด้วย Google
        </button>

        {/* Login Link (ลิงก์นำทางย้อนกลับไปหน้าเข้าสู่ระบบ) */}
        <p className="mt-6 text-center text-xs font-semibold text-stone-500">
          มีบัญชีผู้ใช้อยู่แล้ว?{' '}
          <Link href="/login" className="font-bold text-amber-700 hover:text-amber-800 hover:underline">
            เข้าสู่ระบบที่นี่
          </Link>
        </p>
      </div>
    </div>
  )
}