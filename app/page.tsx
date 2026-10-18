'use client' // กำหนดให้เป็น React Client Component เพื่อใช้งาน State, Hook และ Event Handler ต่างๆ

import { useState, useEffect, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'

// ==========================================
// 1. TYPES & INTERFACES (การกำหนดประเภทข้อมูล)
// ==========================================

// โครงสร้างข้อมูลสินค้า/วัตถุดิบ
interface Item {
  id: number
  itemCode: string
  name: string
  category: string
  quantity: number
  unit: string
  minQuantity: number
  pricePerUnit: number
  expiryDate?: string | null
}

// โครงสร้างข้อมูลผู้ใช้งานระบบ
interface User {
  id: string
  name: string
  email: string
  role: string
}

// โครงสร้างข้อมูลประวัติการทำรายการสต็อก (Audit Trail)
interface StockLog {
  id: number
  type: 'IN' | 'OUT'
  quantity: number
  note?: string
  createdAt: string
  item: { name: string; itemCode: string; unit: string }
  user: { name: string; email: string }
}

// ตัวเลือกหมวดหมู่และหน่วยนับสำหรับใช้ใน Form/Select
const CATEGORY_OPTIONS = [
  'เมล็ดกาแฟ',
  'ผลิตภัณฑ์นม',
  'เบเกอรี่',
  'ไซรัป / น้ำเชื่อม',
  'ชาและเครื่องดื่ม',
  'บรรจุภัณฑ์',
  'อื่นๆ',
]

const UNIT_OPTIONS = [
  'ถุง',
  'แกลลอน',
  'ขวด',
  'กล่อง',
  'ชิ้น',
  'แพ็ค',
  'กระป๋อง',
  'กิโลกรัม',
  'ลิตร',
]

export default function DashboardPage() {
  // ==========================================
  // 2. STATE MANAGEMENT & SESSION
  // ==========================================

  // ดึงข้อมูล Session ผู้ใช้ที่ล็อกอินอยู่ผ่าน NextAuth.js
  const { data: session } = useSession()

  // State หลักสำหรับคลังสินค้า ค้นหา และกรองหมวดหมู่
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')

  // เช็กสิทธิ์ Role-Based Access Control (RBAC): เป็น MANAGER หรือไม่
  const isManager = (session?.user as { role?: string })?.role === 'MANAGER'

  // State สำหรับ Modal เพิ่ม/แก้ไขวัตถุดิบ
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [formData, setFormData] = useState({
    itemCode: '',
    name: '',
    category: CATEGORY_OPTIONS[0],
    quantity: 0,
    unit: UNIT_OPTIONS[0],
    minQuantity: 0,
    pricePerUnit: 0,
    expiryDate: '',
  })

  // State สำหรับ Modal เบิก/เติมด่วน
  const [isQuickUsageOpen, setIsQuickUsageOpen] = useState(false)
  const [quickForm, setQuickForm] = useState({
    itemId: '',
    type: 'OUT' as 'IN' | 'OUT',
    quantity: 1,
    note: '',
  })

  // State สำหรับ Modal แสดงประวัติการเบิก-เติมสต็อก
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false)
  const [logs, setLogs] = useState<StockLog[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)

  // State สำหรับ Modal จัดการพนักงาน (สำหรับ MANAGER)
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STAFF',
  })

  // ==========================================
  // 3. API FETCHING FUNCTIONS (การดึงข้อมูลจาก Server)
  // ==========================================

  // ดึงรายการวัตถุดิบทั้งหมดจาก API (`GET /api/items`)
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/items')
      if (res.ok) {
        const data = await res.json()
        setItems(data)
      }
    } catch (error) {
      console.error('Failed to fetch items:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  // ดึงประวัติการใช้สต็อก (`GET /api/stock-logs`)
  const fetchLogs = async () => {
    try {
      setLoadingLogs(true)
      const res = await fetch('/api/stock-logs')
      if (res.ok) setLogs(await res.json())
    } finally {
      setLoadingLogs(false)
    }
  }

  // ดึงรายชื่อพนักงาน (`GET /api/users`)
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true)
      const res = await fetch('/api/users')
      if (res.ok) setUsers(await res.json())
    } finally {
      setLoadingUsers(false)
    }
  }

  // ==========================================
  // 4. EVENT HANDLERS (จัดการปุ่มกดและฟอร์ม)
  // ==========================================

  // บันทึกการสร้างพนักงานใหม่ (`POST /api/users`)
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserForm),
      })
      if (res.ok) {
        alert('✨ เพิ่มพนักงานใหม่สำเร็จ!')
        setNewUserForm({ name: '', email: '', password: '', role: 'STAFF' })
        fetchUsers()
      } else {
        const data = await res.json().catch(() => null)
        alert(data?.error || `เกิดข้อผิดพลาด (สถานะ: ${res.status})`)
      }
    } catch {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    }
  }

  // เปิด Modal เบิก/เติมด่วน
  const openQuickUsageModal = (item?: Item) => {
    setQuickForm({
      itemId: item ? String(item.id) : items[0] ? String(items[0].id) : '',
      type: 'OUT',
      quantity: 1,
      note: '',
    })
    setIsQuickUsageOpen(true)
  }

  // บันทึกการเบิก/เติมด่วน (`POST /api/stock-logs`)
  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/stock-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quickForm),
      })

      const data = await res.json().catch(() => null)

      if (res.ok && data) {
        setIsQuickUsageOpen(false)
        fetchItems()
      } else {
        alert(data?.error || `เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ (สถานะ: ${res.status})`)
      }
    } catch (err) {
      console.error(err)
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์')
    }
  }

  // เปิด Modal เพิ่มหรือแก้ไขสินค้า
  const openModal = (item?: Item) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        itemCode: item.itemCode,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        minQuantity: item.minQuantity,
        pricePerUnit: item.pricePerUnit,
        expiryDate: item.expiryDate
          ? new Date(item.expiryDate).toISOString().split('T')[0]
          : '',
      })
    } else {
      setEditingItem(null)
      setFormData({
        itemCode: '',
        name: '',
        category: CATEGORY_OPTIONS[0],
        quantity: 0,
        unit: UNIT_OPTIONS[0],
        minQuantity: 5,
        pricePerUnit: 0,
        expiryDate: '',
      })
    }
    setIsModalOpen(true)
  }

  // บันทึกข้อมูลสินค้าใหม่ (POST) หรืออัปเดตสินค้าเดิม (PUT)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingItem ? `/api/items/${editingItem.id}` : '/api/items'
      const method = editingItem ? 'PUT' : 'POST'
      const payload = {
        ...formData,
        expiryDate: formData.expiryDate
          ? new Date(formData.expiryDate).toISOString()
          : null,
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setIsModalOpen(false)
        fetchItems()
      } else {
        const data = await res.json().catch(() => null)
        alert(data?.error || `เกิดข้อผิดพลาด (สถานะ: ${res.status})`)
      }
    } catch {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    }
  }

  // ลบสินค้า (`DELETE /api/items/[id]`)
  const handleDelete = async (id: number) => {
    if (!confirm('ยืนยันการลบรายการวัตถุดิบนี้?')) return
    try {
      const res = await fetch(`/api/items/${id}`, { method: 'DELETE' })
      if (res.ok) fetchItems()
    } catch {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    }
  }

  // ==========================================
  // 5. HELPER & FILTERING LOGIC (คำนวณและกรองข้อมูล)
  // ==========================================

  // คำนวณวันหมดอายุเพื่อแสดง Badge แจ้งเตือน
  const getExpiryStatus = (dateStr?: string | null) => {
    if (!dateStr) return null
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const exp = new Date(dateStr)
    exp.setHours(0, 0, 0, 0)

    const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 3600 * 24))

    if (diffDays < 0) {
      return { label: 'หมดอายุแล้ว', badge: 'bg-rose-100 text-rose-800 border-rose-300 font-bold' }
    } else if (diffDays <= 7) {
      return { label: `ใกล้หมดอายุ (${diffDays} วัน)`, badge: 'bg-amber-100 text-amber-900 border-amber-300 font-bold' }
    }
    return { label: new Date(dateStr).toLocaleDateString('th-TH'), badge: 'bg-stone-100 text-stone-700 border-stone-300 font-semibold' }
  }

  // กรองข้อมูลสินค้าตามคำค้นหา (ชื่อ/รหัส) และหมวดหมู่ที่เลือกแบบ Real-time
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemCode.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory =
      selectedCategory === 'ALL' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // คำนวณจำนวนสต็อกต่ำและสินค้าใกล้หมดอายุ
  const lowStockCount = items.filter((i) => i.quantity <= i.minQuantity).length
  const expiringCount = items.filter((i) => {
    if (!i.expiryDate) return false
    const diff = Math.ceil(
      (new Date(i.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
    )
    return diff <= 7
  }).length

  // ==========================================
  // 6. RENDER UI (ส่วนแสดงผลหน้าจอ)
  // ==========================================

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-stone-900 relative overflow-x-hidden">
      {/* เอฟเฟกต์แสงพื้นหลังโทนอุ่น (Warm Cream Theme) */}
      <div className="pointer-events-none fixed -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-amber-200/50 blur-[120px]" />
      <div className="pointer-events-none fixed -right-40 top-1/3 h-[600px] w-[600px] rounded-full bg-orange-200/40 blur-[150px]" />

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Header Bar: แสดงข้อมูลผู้ใช้ ป้ายบอก Role และปุ่มนำทางหลัก */}
        <header className="mb-8 rounded-3xl border border-stone-300/80 bg-white p-6 shadow-lg shadow-stone-200/60 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-amber-500 via-amber-700 to-amber-500" />
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-900 text-2xl text-amber-400 shadow-md">
                ☕
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-950 flex items-center gap-2">
                  Café & Bakery <span className="text-amber-700">Inventory</span>
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-stone-600 font-medium flex items-center gap-2">
                  <span>ยินดีต้อนรับคุณ <strong className="text-stone-900 font-bold">{session?.user?.name || 'ผู้ใช้งาน'}</strong></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-stone-400" />
                  
                  {/* แสดง Badge แยกสิทธิ์ MANAGER และ STAFF */}
                  <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-bold ${isManager ? 'bg-amber-100 text-amber-950 border border-amber-300' : 'bg-emerald-100 text-emerald-950 border border-emerald-300'}`}>
                    {isManager ? '👑 ผู้จัดการร้าน' : '☕ พนักงาน (STAFF)'}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setIsLogsModalOpen(true)
                  fetchLogs()
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-xs font-bold text-stone-800 transition-all hover:bg-stone-50 hover:border-stone-400 shadow-sm"
              >
                <span>📋</span> ประวัติสต็อก
              </button>

              {/* ปุ่มจัดการพนักงาน แสดงเฉพาะสิทธิ์ MANAGER */}
              {isManager && (
                <button
                  onClick={() => {
                    setIsUserModalOpen(true)
                    fetchUsers()
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-xs font-bold text-amber-950 transition-all hover:bg-amber-100 shadow-sm"
                >
                  <span>👥</span> รายชื่อพนักงาน
                </button>
              )}

              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-800 transition-all hover:bg-rose-100 shadow-sm"
              >
                ออกจากระบบ 🚪
              </button>
            </div>
          </div>
        </header>

        {/* Metric Cards: การ์ดสรุปข้อมูลสถิติสต็อก */}
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-md transition-all hover:shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-stone-500 uppercase">วัตถุดิบทั้งหมด</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800 text-lg font-bold">📦</div>
            </div>
            <p className="mt-4 text-4xl font-black text-stone-950 tracking-tight">{items.length}</p>
            <p className="mt-1 text-xs text-stone-500 font-medium">รายการในระบบสต็อก</p>
          </div>

          <div className="rounded-2xl border border-rose-200 bg-white p-6 shadow-md transition-all hover:shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-rose-700 uppercase">เตือนสต็อกต่ำ</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-800 text-lg font-bold">⚠️</div>
            </div>
            <p className="mt-4 text-4xl font-black text-rose-600 tracking-tight">{lowStockCount}</p>
            <p className="mt-1 text-xs text-stone-500 font-medium">ต้องสั่งซื้อเพิ่มโดยด่วน</p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-white p-6 shadow-md transition-all hover:shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-amber-800 uppercase">ใกล้หมดอายุ</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800 text-lg font-bold">⏳</div>
            </div>
            <p className="mt-4 text-4xl font-black text-amber-800 tracking-tight">{expiringCount}</p>
            <p className="mt-1 text-xs text-stone-500 font-medium">ภายใน 7 วันข้างหน้า</p>
          </div>
        </div>

        {/* Action Toolbar: ช่องค้นหา ตัวกรองหมวดหมู่ และปุ่มเพิ่มรายการ */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-1 flex-wrap items-center gap-3 max-w-2xl">
            {/* Input ค้นหา Real-time */}
            <div className="relative flex-1 min-w-[240px]">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-stone-400 text-sm">🔍</span>
              <input
                type="text"
                placeholder="ค้นหาวัตถุดิบ หรือ รหัสสินค้า..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white pl-10 pr-4 py-2.5 text-sm font-medium text-stone-900 placeholder-stone-400 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600/20 shadow-sm"
              />
            </div>

            {/* Select เลือกกรองตามหมวดหมู่ */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-800 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600/20 shadow-sm cursor-pointer"
            >
              <option value="ALL">ทุกหมวดหมู่สินค้า</option>
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            {/* ปุ่มเบิก/เติมด่วน (ใช้ได้ทุกคน) */}
            <button
              onClick={() => openQuickUsageModal()}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-800 transition-all"
            >
              ⚡ เบิก / เติมด่วน
            </button>

            {/* ปุ่มเพิ่มวัตถุดิบใหม่ แสดงเฉพาะ MANAGER */}
            {isManager && (
              <button
                onClick={() => openModal()}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-700 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-amber-800 transition-all"
              >
                + เพิ่มวัตถุดิบใหม่
              </button>
            )}
          </div>
        </div>

        {/* Main Table: ตารางแสดงรายการคลังสินค้าหลัก */}
        <div className="overflow-x-auto rounded-3xl border border-stone-200/80 bg-white shadow-xl shadow-stone-200/50">
          {loading ? (
            <div className="p-16 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-amber-700 border-t-transparent" />
              <p className="mt-4 text-xs font-bold text-stone-600">กำลังโหลดข้อมูลคลังสินค้า...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-16 text-center">
              <p className="text-3xl">☕</p>
              <p className="mt-2 text-sm font-bold text-stone-900">ไม่พบรายการวัตถุดิบ</p>
              <p className="mt-1 text-xs text-stone-500">ลองเปลี่ยนคำค้นหา หรือกดเพิ่มวัตถุดิบใหม่</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200/80 bg-stone-100/70 text-xs font-bold text-stone-600 uppercase tracking-wider">
                  <th className="px-5 py-4 whitespace-nowrap">รหัส</th>
                  <th className="px-5 py-4 whitespace-nowrap">วัตถุดิบ / สินค้า</th>
                  <th className="px-5 py-4 whitespace-nowrap">หมวดหมู่</th>
                  <th className="px-5 py-4 whitespace-nowrap">คงเหลือ</th>
                  <th className="px-5 py-4 whitespace-nowrap">วันหมดอายุ</th>
                  <th className="px-5 py-4 whitespace-nowrap">สถานะสต็อก</th>
                  <th className="px-5 py-4 text-right whitespace-nowrap">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-sm font-medium">
                {filteredItems.map((item) => {
                  const isLowStock = item.quantity <= item.minQuantity
                  const expStatus = getExpiryStatus(item.expiryDate)
                  return (
                    <tr key={item.id} className="hover:bg-amber-50/40 transition-colors duration-150">
                      
                      {/* รหัสสินค้า */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="inline-block rounded-xl bg-amber-100/80 px-2.5 py-1 text-xs font-black text-amber-900 border border-amber-200/80 tracking-wide whitespace-nowrap">
                          {item.itemCode}
                        </span>
                      </td>

                      {/* ชื่อวัตถุดิบและราคา */}
                      <td className="px-5 py-4">
                        <div className="font-bold text-stone-900 text-sm">{item.name}</div>
                        <div className="text-xs font-semibold text-stone-500 mt-0.5">
                          ฿{item.pricePerUnit.toLocaleString()} / {item.unit}
                        </div>
                      </td>

                      {/* หมวดหมู่ */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center rounded-xl bg-stone-100 px-3 py-1 text-xs font-bold text-stone-700 border border-stone-200/80 whitespace-nowrap">
                          {item.category}
                        </span>
                      </td>

                      {/* จำนวนคงเหลือ */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-base font-black text-stone-900">
                          {item.quantity}
                        </span>{' '}
                        <span className="text-xs font-semibold text-stone-500">{item.unit}</span>
                      </td>

                      {/* Badge แสดงวันหมดอายุ / สถานะหมดอายุ */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {expStatus ? (
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs border whitespace-nowrap ${expStatus.badge}`}>
                            {expStatus.label}
                          </span>
                        ) : (
                          <span className="text-stone-400 text-xs font-semibold">-</span>
                        )}
                      </td>

                      {/* Badge แสดงสถานะสต็อก (ปกติ / สต็อกต่ำ) */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {isLowStock ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700 border border-rose-200 whitespace-nowrap">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                            สต็อกต่ำ
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 whitespace-nowrap">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            ปกติ
                          </span>
                        )}
                      </td>

                      {/* ปุ่มจัดการ: ซ่อน/แสดงตามสิทธิ์ (RBAC) */}
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                          <button
                            onClick={() => openQuickUsageModal(item)}
                            className="rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100 active:scale-95 transition-all"
                          >
                            เบิก/เติม
                          </button>
                          
                          {/* ปุ่มแก้ไขและลบ แสดงเฉพาะสิทธิ์ MANAGER */}
                          {isManager && (
                            <>
                              <button
                                onClick={() => openModal(item)}
                                className="rounded-xl bg-stone-100 px-3 py-1.5 text-xs font-bold text-stone-700 border border-stone-200/80 hover:bg-stone-200 active:scale-95 transition-all"
                              >
                                แก้ไข
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 border border-rose-200/80 hover:bg-rose-100 active:scale-95 transition-all"
                              >
                                ลบ
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ==========================================
          7. MODALS (หน้าต่างป๊อปอัพสำหรับการจัดการ)
         ========================================== */}

      {/* Modal 1: ฟอร์มเพิ่ม / แก้ไข รายการสินค้า (Data Validation) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-stone-300 bg-white p-6 shadow-2xl">
            <h2 className="mb-4 text-lg font-bold text-stone-950 flex items-center gap-2">
              <span>{editingItem ? '✏️' : '✨'}</span>
              {editingItem ? 'แก้ไขรายการสินค้า' : 'เพิ่มวัตถุดิบใหม่'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">รหัสสินค้า</label>
                <input
                  type="text"
                  required
                  value={formData.itemCode}
                  onChange={(e) => setFormData({ ...formData, itemCode: e.target.value })}
                  className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3.5 py-2 text-sm font-semibold text-stone-900 focus:border-amber-600 focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">ชื่อวัตถุดิบ/สินค้า</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3.5 py-2 text-sm font-semibold text-stone-900 focus:border-amber-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">หมวดหมู่</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 text-sm font-semibold text-stone-900 focus:border-amber-600 focus:bg-white focus:outline-none"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">หน่วยนับ</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 text-sm font-semibold text-stone-900 focus:border-amber-600 focus:bg-white focus:outline-none"
                  >
                    {UNIT_OPTIONS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Validation: กำหนด min="0" ป้องกันใส่ค่าติดลบ */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">จำนวน</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 text-sm font-bold text-stone-900 focus:border-amber-600 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">เตือนขั้นต่ำ</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.minQuantity}
                    onChange={(e) => setFormData({ ...formData, minQuantity: Number(e.target.value) })}
                    className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 text-sm font-bold text-stone-900 focus:border-amber-600 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">ราคา/หน่วย</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.pricePerUnit}
                    onChange={(e) => setFormData({ ...formData, pricePerUnit: Number(e.target.value) })}
                    className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 text-sm font-bold text-stone-900 focus:border-amber-600 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">วันหมดอายุ (ถ้ามี)</label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 text-sm font-semibold text-stone-900 focus:border-amber-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-stone-300 bg-stone-100 px-4 py-2 text-xs font-bold text-stone-700 hover:bg-stone-200"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-700 px-5 py-2 text-xs font-bold text-white hover:bg-amber-800 shadow-md"
                >
                  บันทึกรายการ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: ฟอร์มเบิก / เติมวัตถุดิบด่วน (Quick Usage) */}
      {isQuickUsageOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-stone-300 bg-white p-6 shadow-2xl">
            <h2 className="mb-4 text-lg font-bold text-stone-950 flex items-center gap-2">
              ⚡ เบิก / เติมวัตถุดิบด่วน
            </h2>
            <form onSubmit={handleQuickSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-xl border border-stone-200">
                <button
                  type="button"
                  onClick={() => setQuickForm({ ...quickForm, type: 'OUT' })}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    quickForm.type === 'OUT' ? 'bg-rose-700 text-white shadow-md' : 'text-stone-700 hover:text-stone-950'
                  }`}
                >
                  📤 เบิกออก (OUT)
                </button>
                <button
                  type="button"
                  onClick={() => setQuickForm({ ...quickForm, type: 'IN' })}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    quickForm.type === 'IN' ? 'bg-emerald-700 text-white shadow-md' : 'text-stone-700 hover:text-stone-950'
                  }`}
                >
                  📥 เติมสต็อก (IN)
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">เลือกสินค้า</label>
                <select
                  value={quickForm.itemId}
                  onChange={(e) => setQuickForm({ ...quickForm, itemId: e.target.value })}
                  className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3.5 py-2.5 text-sm font-semibold text-stone-900 focus:border-amber-600 focus:bg-white focus:outline-none"
                >
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>
                      [{i.itemCode}] {i.name} (คงเหลือ {i.quantity} {i.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">จำนวน</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quickForm.quantity}
                  onChange={(e) => setQuickForm({ ...quickForm, quantity: Number(e.target.value) })}
                  className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3.5 py-2.5 text-sm font-bold text-stone-900 focus:border-amber-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">หมายเหตุ</label>
                <input
                  type="text"
                  placeholder="เช่น เบิกไปทำเมนูประจำวัน"
                  value={quickForm.note}
                  onChange={(e) => setQuickForm({ ...quickForm, note: e.target.value })}
                  className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3.5 py-2.5 text-sm font-semibold text-stone-900 focus:border-amber-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsQuickUsageOpen(false)}
                  className="rounded-xl border border-stone-300 bg-stone-100 px-4 py-2 text-xs font-bold text-stone-700 hover:bg-stone-200"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-700 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-800 shadow-md"
                >
                  บันทึกการทำรายการ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: ฟอร์มสร้าง/จัดการพนักงาน (User Management) */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-stone-300 bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between border-b border-stone-200 pb-3">
              <h2 className="text-lg font-bold text-stone-950 flex items-center gap-2">
                👥 จัดการพนักงานในระบบ
              </h2>
              <button onClick={() => setIsUserModalOpen(false)} className="text-stone-400 hover:text-stone-800 font-bold">✕</button>
            </div>

            <form onSubmit={handleAddUser} className="mb-6 bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3">
              <h3 className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">+ เพิ่มพนักงานใหม่</h3>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="ชื่อ-นามสกุล"
                  required
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  className="rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-semibold text-stone-900 focus:border-amber-600 focus:outline-none"
                />
                <input
                  type="email"
                  placeholder="อีเมล"
                  required
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  className="rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-semibold text-stone-900 focus:border-amber-600 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="password"
                  placeholder="รหัสผ่าน"
                  required
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  className="rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-semibold text-stone-900 focus:border-amber-600 focus:outline-none"
                />
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                  className="rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-semibold text-stone-900 focus:border-amber-600 focus:outline-none"
                >
                  <option value="STAFF">พนักงาน (STAFF)</option>
                  <option value="MANAGER">ผู้จัดการ (MANAGER)</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-amber-700 text-white font-bold py-2 rounded-xl text-xs hover:bg-amber-800 shadow-sm"
              >
                บันทึกพนักงานใหม่
              </button>
            </form>

            {loadingUsers ? (
              <div className="py-4 text-center text-xs font-bold text-stone-500">กำลังโหลด...</div>
            ) : (
              <table className="w-full text-left text-xs text-stone-800">
                <thead className="bg-stone-100 text-stone-700 uppercase border-b border-stone-300 font-extrabold">
                  <tr>
                    <th className="px-3 py-2.5">ชื่อ</th>
                    <th className="px-3 py-2.5">อีเมล</th>
                    <th className="px-3 py-2.5">ตำแหน่ง</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="px-3 py-2.5 font-bold text-stone-950">{u.name}</td>
                      <td className="px-3 py-2.5 text-stone-600 font-medium">{u.email}</td>
                      <td className="px-3 py-2.5">
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded ${u.role === 'MANAGER' ? 'bg-amber-100 text-amber-950 border border-amber-300' : 'bg-blue-100 text-blue-950 border border-blue-300'}`}>
                          {u.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Modal 4: แสดงประวัติการเบิก-เติมสต็อก (Audit Trail) */}
      {isLogsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl rounded-2xl border border-stone-300 bg-white p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between border-b border-stone-200 pb-3">
              <h2 className="text-lg font-bold text-stone-950 flex items-center gap-2">
                📋 ประวัติการเบิก-เติมสต็อก
              </h2>
              <button onClick={() => setIsLogsModalOpen(false)} className="text-stone-400 hover:text-stone-800 font-bold">✕</button>
            </div>
            {loadingLogs ? (
              <div className="py-8 text-center text-xs font-bold text-stone-500">กำลังโหลดข้อมูลประวัติ...</div>
            ) : (
              <table className="w-full text-left text-xs text-stone-800">
                <thead className="bg-stone-100 text-stone-700 uppercase border-b border-stone-300 font-extrabold">
                  <tr>
                    <th className="px-3 py-2.5">วัน-เวลา</th>
                    <th className="px-3 py-2.5">รายการ</th>
                    <th className="px-3 py-2.5">ประเภท</th>
                    <th className="px-3 py-2.5">จำนวน</th>
                    <th className="px-3 py-2.5">ผู้ทำรายการ</th>
                    <th className="px-3 py-2.5">หมายเหตุ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-3 py-2.5 text-stone-500 font-medium">
                        {new Date(log.createdAt).toLocaleString('th-TH')}
                      </td>
                      <td className="px-3 py-2.5 font-bold text-stone-950">{log.item?.name}</td>
                      <td className="px-3 py-2.5">
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded ${log.type === 'IN' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-rose-100 text-rose-900 border border-rose-300'}`}>
                          {log.type === 'IN' ? '📥 เติมสต็อก' : '📤 เบิกออก'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-black text-stone-950">{log.quantity} {log.item?.unit}</td>
                      <td className="px-3 py-2.5 text-stone-700 font-semibold">{log.user?.name}</td>
                      <td className="px-3 py-2.5 text-stone-500">{log.note || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  )
}