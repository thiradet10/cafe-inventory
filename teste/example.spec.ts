import { test, expect } from '@playwright/test'

test('ทดสอบหน้าสมัครสมาชิก - บล็อกการพิมพ์รหัสผ่านสั้นกว่า 6 ตัวอักษร', async ({ page }) => {
  // 1. สั่งเปิดเบราว์เซอร์ไปที่หน้าสมัครสมาชิก
  await page.goto('http://localhost:3000/register')

  // 2. พิมพ์ชื่อ-นามสกุล และ อีเมล
  await page.fill('input[placeholder="สมชาย ใจดี"]', 'พนักงาน ทดสอบอัตโนมัติ')
  await page.fill('input[type="email"]', 'e2e_staff@cafe.com')

  // 3. ทดสอบพิมพ์รหัสผ่านสั้นเกินไป (5 ตัวอักษร)
  await page.fill('input[type="password"]', '12345')

  // 4. กดปุ่มสมัครสมาชิก
  await page.click('button[type="submit"]')

  // 5. ตรวจสอบว่ามีกล่องข้อความแจ้งเตือน Error แสดงขึ้นมาบนหน้าเว็บจริงหรือไม่
  const errorMessage = page.locator('text=รหัสผ่านต้องมีความยาวระหว่าง 6 ถึง 10 ตัวอักษร')
  await expect(errorMessage).toBeVisible()
})