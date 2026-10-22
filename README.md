# ☕ Café & Bakery Inventory System

ระบบจัดการคลังสินค้าและวัตถุดิบสำหรับร้านกาแฟและเบเกอรี่ พัฒนาด้วย **Next.js (App Router)** ร่วมกับ **Prisma ORM** และ **NextAuth.js v5** โดดเด่นด้วยดีไซน์ธีม **Warm Cream & Espresso Latte** โทนสว่าง มินิมอล อ่านสบายตาด้วยฟอนต์ **Prompt**

---

## 🛠️ Tech Stack & Technologies

* **Framework:** Next.js 14+ (App Router, TypeScript)
* **Database:** SQLite ผ่าน Prisma ORM
* **Authentication:** NextAuth.js v5 (Credentials Flow & Google OAuth 2.0)
* **Styling:** Tailwind CSS + Google Fonts (Prompt)
* **API Testing:** Postman (Session Cookie Authenticated)

---

## 🌟 คุณสมบัติหลักของระบบ (System Compliance - 5 Core Features)

### 1. 📦 CRUD Operations
* **Create:** เพิ่มรายการวัตถุดิบใหม่ บันทึกประวัติการเบิก-เติมสต็อก เพิ่มหมวดหมู่/หน่วยนับ และสร้างบัญชีพนักงาน
* **Read:** แสดงผลตารางคลังสินค้าแบบ Real-time, ประวัติการใช้งานสต็อก, หมวดหมู่/หน่วยนับ และรายชื่อพนักงาน
* **Update:** แก้ไขข้อมูลวัตถุดิบ (ชื่อ, หมวดหมู่, จำนวน, ราคา, วันหมดอายุ), อัปเดตข้อมูลพนักงาน และแก้ไขโปรไฟล์ส่วนตัว/เปลี่ยนรหัสผ่าน
* **Delete:** ลบรายการวัตถุดิบ ลบพนักงาน และลบหมวดหมู่/หน่วยนับออกจากฐานข้อมูล (จำกัดสิทธิ์เฉพาะผู้จัดการ)

### 2. ✅ Data Validation (การตรวจสอบความถูกต้อง)
* **Client-side:** ล็อกฟอร์มด้วย `required`, กำหนดความยาวรหัสผ่าน (6–10 ตัวอักษร), ตรวจสอบความถูกต้องของวันหมดอายุ และป้องกันค่าติดลบ (`min="0"`)
* **Server-side:** เช็กความสมบูรณ์ของ Payload ก่อนบันทึก DB, ตรวจสอบอีเมลซ้ำในระบบ และเข้ารหัสรหัสผ่านด้วย `bcryptjs`

### 3. 🔐 Authentication & Authorization (RBAC)
* **Authentication:** รองรับการเข้าสู่ระบบ 2 รูปแบบ (อีเมล/รหัสผ่าน และ Google Account)
* **Role-Based Access Control (RBAC):**
  * **👑 MANAGER (ผู้จัดการ):** สิทธิ์สูงสุด เข้าถึงการ CRUD สินค้า, จัดการพนักงาน, จัดการหมวดหมู่/หน่วยนับ และดูประวัติสต็อก
  * **☕ STAFF (พนักงาน):** สิทธิ์จำกัด เข้าถึงการเบิก/เติมด่วน, แก้ไขโปรไฟล์ตนเอง และดูรายการสินค้า

### 4. 🔍 Search & Filter ข้อมูล
* **Search:** ค้นหาวัตถุดิบแบบ Real-time ทั้งจาก **ชื่อสินค้า** และ **รหัสสินค้า (Item Code)**
* **Filter:** กรองสินค้าตาม **หมวดหมู่** (เมล็ดกาแฟ, ผลิตภัณฑ์นม, เบเกอรี่, ไซรัป ฯลฯ)
* **Alert Badges:** ป้ายแจ้งเตือนสถานะอัตโนมัติเมื่อ **สต็อกต่ำกว่าขั้นต่ำ** หรือ **สินค้าใกล้หมดอายุภายใน 7 วัน** / **หมดอายุแล้ว**

### 5. 🔌 RESTful API Services
รองรับการเชื่อมต่อและทดสอบผ่าน Postman ครบทั้ง 4 HTTP Methods:
* **GET:** `/api/items`, `/api/stock-logs`, `/api/users`, `/api/categories`, `/api/units`, `/api/profile`
* **POST:** `/api/items`, `/api/register`, `/api/stock-logs`, `/api/users`, `/api/categories`, `/api/units`
* **PUT:** `/api/items/[id]`, `/api/users/[id]`, `/api/profile`
* **DELETE:** `/api/items/[id]`, `/api/users/[id]`, `/api/categories/[id]`, `/api/units/[id]`

---

## 📸 รายละเอียดหน้าจอระบบสำหรับแคปเจอร์ภาพ (Screenshots Guide)

หากต้องการแคปหน้าจอเพื่อทำรายงานหรือนำเสนอ สามารถเลือกเก็บภาพตามส่วนต่างๆ ของระบบได้ดังนี้:

### 1. หน้าล็อกอิน (Login Page - `page_2.tsx`)
* **ภาพที่ 1:** หน้าเข้าสู่ระบบหลัก แสดงฟอร์มกรอกอีเมล/รหัสผ่าน ปุ่มเข้าสู่ระบบ ปุ่ม Google OAuth และลิงก์สมัครสมาชิก
* **ภาพที่ 2:** การแสดงผลแจ้งเตือนข้อผิดพลาด (Error Alert) เมื่อกรอกอีเมลหรือรหัสผ่านไม่ถูกต้อง

### 2. หน้าสมัครสมาชิก (Register Page - `page_3.tsx`)
* **ภาพที่ 3:** หน้าสมัครสมาชิกพนักงาน (STAFF) แสดงฟอร์มกรอก ชื่อ-นามสกุล, อีเมล, รหัสผ่าน (6-10 ตัวอักษร) และปุ่ม Google OAuth
* **ภาพที่ 4:** การแสดงผลแจ้งเตือน Validation (เช่น รหัสผ่านสั้นกว่า 6 ตัวอักษร หรืออีเมลซ้ำในระบบ)

### 3. หน้าแดชบอร์ดหลัก (Dashboard Page - `page.tsx`)
* **ภาพที่ 5:** ภาพรวมหน้าแดชบอร์ด แสดง Header สรุปผู้ใช้งาน, การ์ดสถิติ (วัตถุดิบทั้งหมด, สต็อกต่ำ, ใกล้หมดอายุ), แถบค้นหา/กรองหมวดหมู่ และตารางรายการสินค้า
* **ภาพที่ 6:** Modal เบิก / เติมด่วน (Quick Usage Modal)
* **ภาพที่ 7:** Modal เพิ่ม / แก้ไขวัตถุดิบ (Item Form Modal)
* **ภาพที่ 8:** Modal จัดการหมวดหมู่สินค้า & หน่วยนับ (Category & Unit Management Modal)
* **ภาพที่ 9:** Modal จัดการพนักงานในระบบ (User Management Modal - เฉพาะสิทธิ์ MANAGER)
* **ภาพที่ 10:** Modal แสดงประวัติการเบิก-เติมสต็อก (Stock Audit Logs Modal)
* **ภาพที่ 11:** Modal โปรไฟล์ส่วนตัว & เปลี่ยนรหัสผ่าน (User Profile & Change Password Modal)

---

## 🗄️ Database Schema Summary

* **User:** เก็บข้อมูลผู้ใช้งานระบบ (`id`, `name`, `email`, `password`, `role`)
* **Item:** เก็บข้อมูลวัตถุดิบในคลัง (`id`, `itemCode`, `name`, `category`, `quantity`, `unit`, `minQuantity`, `pricePerUnit`, `expiryDate`)
* **Category:** เก็บข้อมูลหมวดหมู่สินค้า (`id`, `name`)
* **Unit:** เก็บข้อมูลหน่วยนับสินค้า (`id`, `name`)
* **StockLog:** ประวัติการเบิก-เติมสต็อกแบบ Audit Trail (`id`, `itemId`, `userId`, `type`, `quantity`, `note`, `createdAt`)

---

## 🚀 ขั้นตอนการติดตั้งและรันโปรเจกต์ (Getting Started)

### 1. โคลนโปรเจกต์และติดตั้ง Dependencies
```bash
git clone <repository-url>
cd cafe-inventory
npm install
```

### 2. ตั้งค่า Environment Variables (`.env`)
สร้างไฟล์ `.env` ที่โฟลเดอร์ Root ของโปรเจกต์ และกำหนดค่าดังนี้:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-super-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# (Optional) สำหรับใช้งาน Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 3. ตั้งค่า Database & Prisma ORM
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. รันโปรเจกต์ใน Development Mode
```bash
npm run dev
```
เปิดเบราว์เซอร์ไปที่ `http://localhost:3000`

---

## 👥 ผู้จัดทำ (Project Authors)

* **ชื่อ-นามสกุล:** นาย ธีรเดช ประสารสุข
* **รหัสนักศึกษา:** 673450195-4
* **สาขา / คณะ:** วิทยาการคอมพิวเตอร์และสารสนเทศ / คณะสหวิทยาการ
* **สถาบันการศึกษา:** มหาวิทยาลัยขอนแก่น (วิทยาเขตหนองคาย)