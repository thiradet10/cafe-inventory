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
* **Create:** เพิ่มรายการวัตถุดิบใหม่ บันทึกประวัติการเบิก-เติมสต็อก และสร้างบัญชีพนักงาน
* **Read:** แสดงผลตารางคลังสินค้าแบบ Real-time, ประวัติการใช้งานสต็อก และรายชื่อพนักงาน
* **Update:** แก้ไขข้อมูลวัตถุดิบ เช่น ชื่อ, หมวดหมู่, จำนวนคงเหลือ, ราคา และวันหมดอายุ
* **Delete:** ลบรายการวัตถุดิบออกจากฐานข้อมูล (จำกัดสิทธิ์เฉพาะผู้จัดการ)

### 2. ✅ Data Validation (การตรวจสอบความถูกต้อง)
* **Client-side:** ล็อกฟอร์มด้วย `required`, กำหนดรูปแบบชนิดข้อมูล (Email, Password, Date) และการป้องกันค่าติดลบ (`min="0"`)
* **Server-side:** เช็กความสมบูรณ์ของ Payload ก่อนบันทึก DB, ตรวจสอบอีเมลซ้ำในระบบ และเข้ารหัสรหัสผ่านด้วย `bcryptjs`

### 3. 🔐 Authentication & Authorization (RBAC)
* **Authentication:** รองรับการเข้าสู่ระบบ 2 รูปแบบ (อีเมล/รหัสผ่าน และ Google Account)
* **Role-Based Access Control (RBAC):**
  * **👑 MANAGER (ผู้จัดการ):** สิทธิ์สูงสุด เข้าถึงการ CRUD สินค้า, จัดการรายชื่อพนักงาน และดูประวัติสต็อก
  * **☕ STAFF (พนักงาน):** สิทธิ์จำกัด เข้าถึงเฉพาะการเบิก/เติมด่วน และดูรายการสินค้า

### 4. 🔍 Search & Filter ข้อมูล
* **Search:** ค้นหาวัตถุดิบแบบ Real-time ทั้งจาก **ชื่อสินค้า** และ **รหัสสินค้า (Item Code)**
* **Filter:** กรองสินค้าตาม **หมวดหมู่** (เมล็ดกาแฟ, ผลิตภัณฑ์นม, เบเกอรี่, ไซรัป ฯลฯ)
* **Alert Badges:** ป้ายแจ้งเตือนสถานะอัตโนมัติเมื่อ **สต็อกต่ำกว่าขั้นต่ำ** หรือ **สินค้าใกล้หมดอายุภายใน 7 วัน**

### 5. 🔌 RESTful API Services
รองรับการเชื่อมต่อและทดสอบผ่าน Postman ครบทั้ง 4 HTTP Methods:
* **GET:** `/api/items`, `/api/stock-logs`, `/api/users`
* **POST:** `/api/items`, `/api/register`, `/api/stock-logs`, `/api/users`
* **PUT:** `/api/items/[id]`
* **DELETE:** `/api/items/[id]`

---

## 🗄️ Database Schema Summary

* **User:** เก็บข้อมูลผู้ใช้งานระบบ (`id`, `name`, `email`, `password`, `role`)
* **Item:** เก็บข้อมูลวัตถุดิบในคลัง (`id`, `itemCode`, `name`, `category`, `quantity`, `unit`, `minQuantity`, `pricePerUnit`, `expiryDate`)
* **StockLog:** ประวัติการเบิก-เติมสต็อกแบบ Audit Trail (`id`, `itemId`, `userId`, `type`, `quantity`, `note`, `createdAt`)

---

## 🚀 ขั้นตอนการติดตั้งและรันโปรเจกต์ (Getting Started)

### 1. คลองโปรเจกต์และติดตั้ง Dependencies
```bash
git clone <repository-url>
cd cafe-inventory
npm install

---

## 👥 ผู้จัดทำ (Project Authors)
ชื่อ-นามสกุล: นาย ธีรเดช ประสารสุข
รหัสนักศึกษา : 673450195-4
สาขา / คณะ: วิทยาการคอมพิวเตอร์และสารสนเทส / คณะสหวิทยาการ
สถาบันการศึกษา: มหาวิทยาลัยขอนแก่น (วิทยาเขตหนองคาย) 