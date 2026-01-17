# Product Requirements Document (PRD)
# ระบบบริหารจัดการคลินิก KKClinic

**Version:** 1.0 (MVP)  
**วันที่:** 17 มกราคม 2569  
**ผู้จัดทำ:** Development Team  

---

## 1. ภาพรวมโครงการ (Executive Summary)

### 1.1 วัตถุประสงค์
พัฒนาระบบ Web Application สำหรับบริหารจัดการคลินิก ครอบคลุมตั้งแต่การลงทะเบียนผู้ป่วย การสั่งยาโดยแพทย์ การจ่ายยาและคิดเงิน ไปจนถึงการจัดการคลังยา

### 1.2 กลุ่มผู้ใช้เป้าหมาย
| บทบาท | หน้าที่หลัก |
|-------|------------|
| **Admin** | จัดการระบบทั้งหมด รวมถึงการจัดการผู้ใช้และสต๊อกยา |
| **Doctor (แพทย์)** | ค้นหาผู้ป่วย และสั่งยา/หัตถการ |
| **Staff (พนักงาน)** | ลงทะเบียนผู้ป่วย จ่ายยา คิดเงิน และออกใบเสร็จ |

### 1.3 Tech Stack
- **Frontend:** Next.js 15 (App Router) + TypeScript + shadcn/ui + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + RESTful API + RLS)
- **Deployment:** Vercel (Frontend) + Supabase Cloud (Backend)
- **Language:** ภาษาไทย (Thai-only UI)

---

## 2. Functional Requirements

### 2.1 ระบบยืนยันตัวตน (Authentication & Authorization)

#### FR-AUTH-01: เข้าสู่ระบบ
- ผู้ใช้สามารถเข้าสู่ระบบด้วย Email และ Password
- ระบบแสดง error message ที่เหมาะสมเมื่อข้อมูลไม่ถูกต้อง
- หลังเข้าสู่ระบบสำเร็จ redirect ไปยังหน้า Dashboard ตาม role

#### FR-AUTH-02: ออกจากระบบ
- ผู้ใช้สามารถออกจากระบบได้จากทุกหน้า
- ระบบ clear session และ redirect ไปหน้า Login

#### FR-AUTH-03: การจัดการสิทธิ์ตาม Role
| Role | สิทธิ์การเข้าถึง |
|------|-----------------|
| Admin | ทุกหน้า + จัดการผู้ใช้ + จัดการสต๊อก |
| Doctor | ค้นหาผู้ป่วย + สั่งยา/หัตถการ |
| Staff | ลงทะเบียนผู้ป่วย + จ่ายยา + คิดเงิน |

---

### 2.2 การจัดการผู้ป่วย (Patient Management)

#### FR-PAT-01: ลงทะเบียนผู้ป่วยใหม่
**ผู้ใช้ที่มีสิทธิ์:** Staff, Admin

**ข้อมูลที่ต้องกรอก:**
| ฟิลด์ | ประเภท | บังคับ | หมายเหตุ |
|------|--------|--------|----------|
| HN (Hospital Number) | Text | ✅ | สร้างอัตโนมัติหรือกรอกเอง |
| ชื่อ-นามสกุล | Text | ✅ | |
| วันเกิด | Date | ❌ | |
| เพศ | Select | ❌ | ชาย/หญิง/ไม่ระบุ |
| เบอร์โทรศัพท์ | Text | ✅ | |
| ที่อยู่ | Textarea | ❌ | |

#### FR-PAT-02: ค้นหาผู้ป่วย
**ผู้ใช้ที่มีสิทธิ์:** Staff, Doctor, Admin

- ค้นหาด้วย HN, ชื่อ, หรือเบอร์โทรศัพท์
- แสดงผลแบบ real-time (debounced search)
- คลิกเลือกเพื่อดูรายละเอียดหรือดำเนินการต่อ

#### FR-PAT-03: แก้ไขข้อมูลผู้ป่วย
**ผู้ใช้ที่มีสิทธิ์:** Staff, Admin

- แก้ไขข้อมูลทั่วไปของผู้ป่วยได้
- บันทึกประวัติการแก้ไข (audit log)

---

### 2.3 การสั่งยา/หัตถการ (Prescription/Order Entry)

#### FR-RX-01: สร้างใบสั่งยา
**ผู้ใช้ที่มีสิทธิ์:** Doctor, Admin

**ขั้นตอน:**
1. เลือกผู้ป่วยจากการค้นหา
2. เพิ่มรายการยา/หัตถการ (Autocomplete search)
3. ระบุจำนวน และหมายเหตุ (ถ้ามี)
4. ปรับราคาเฉพาะเคส (ถ้าจำเป็น)
5. บันทึกใบสั่ง

**ข้อมูลใบสั่งยา:**
| ฟิลด์ | คำอธิบาย |
|------|----------|
| Patient | ผู้ป่วยที่รับการรักษา |
| Doctor | แพทย์ผู้สั่ง (auto-fill จาก login) |
| Items | รายการยา/หัตถการ + จำนวน + หมายเหตุ |
| Note | หมายเหตุใบสั่งยา |
| Status | pending / dispensed / cancelled |

**ข้อมูลรายการยา/หัตถการ (prescription_items):**
| ฟิลด์ | คำอธิบาย |
|------|----------|
| item_type | ประเภท: `medicine` หรือ `procedure` |
| medicine_id | FK ไปยังตารางยา (ถ้าเป็นยา) |
| procedure_name | ชื่อหัตถการ (ถ้าเป็น procedure) |
| quantity | จำนวน |
| unit_price | ราคาต่อหน่วย (ดึงจากยาหรือกรอกเอง) |
| price_override | ราคาปรับเฉพาะเคส (nullable) |
| note | หมายเหตุ/วิธีใช้ |

> **หมายเหตุ:** MVP ใช้ `prescription_items` เก็บทั้งยาและหัตถการในตารางเดียว โดยแยกด้วย `item_type`

#### FR-RX-02: ดูประวัติใบสั่งยา
- แพทย์สามารถดูใบสั่งยาที่ตนเองสร้างได้
- Admin สามารถดูใบสั่งยาทั้งหมดได้

#### FR-RX-03: ยกเลิกใบสั่งยา (Void)
**ผู้ใช้ที่มีสิทธิ์:** Doctor (เจ้าของใบสั่ง), Admin

- ยกเลิกใบสั่งที่ยังไม่จ่ายยา (status = pending)
- เปลี่ยน status เป็น `cancelled`
- ระบุเหตุผลในการยกเลิก

---

### 2.4 การจ่ายยาและคิดเงิน (Dispensing & Billing)

#### FR-BILL-01: เรียกดูใบสั่งยาที่รอจ่าย
**ผู้ใช้ที่มีสิทธิ์:** Staff, Admin

- แสดงรายการใบสั่งยาที่มี status = "pending"
- เรียงตามเวลาสร้าง (เก่าสุดก่อน)

#### FR-BILL-02: จ่ายยาและคิดเงิน
**ขั้นตอน:**
1. เลือกใบสั่งยาที่ต้องการดำเนินการ
2. ตรวจสอบรายการยา + ราคา + จำนวน
3. เลือกวิธีชำระเงิน
4. ยืนยันการจ่ายยา
5. ระบบคำนวณยอดรวม
6. ระบบตัดสต๊อกอัตโนมัติ (เฉพาะรายการยา)
7. ระบบสร้าง Transaction + Receipt

**วิธีชำระเงิน (payment_method):**
| ค่า | คำอธิบาย |
|-----|----------|
| cash | เงินสด |
| transfer | โอนเงิน/PromptPay |
| card | บัตรเครดิต/เดบิต |

> **หมายเหตุ:** รองรับราคา 0 บาท สำหรับกรณียาตัวอย่าง (sample) หรือเคสพิเศษ

#### FR-BILL-03: ออกใบเสร็จ
- แสดงใบเสร็จบนหน้าจอ (web format พิมพ์จาก browser ได้)
- ข้อมูลในใบเสร็จ:
  - เลขที่ใบเสร็จ (Receipt No.)
  - วันที่/เวลา
  - ข้อมูลผู้ป่วย
  - รายการยา/หัตถการ + ราคา
  - ยอดรวม
  - วิธีชำระเงิน
  - ผู้รับเงิน (Staff)

> **หมายเหตุ:** ใบเสร็จเป็น web format ที่พิมพ์ผ่าน browser (ไม่ใช่ PDF generator)

---

### 2.5 การจัดการคลังยา (Inventory Management)

#### FR-INV-01: ดูรายการยาทั้งหมด
**ผู้ใช้ที่มีสิทธิ์:** Admin, Staff

**ข้อมูลที่แสดง:**
| คอลัมน์ | คำอธิบาย |
|---------|----------|
| รหัสยา/Barcode | รหัสสำหรับสแกน |
| ชื่อยา | ชื่อยา/เวชภัณฑ์ |
| หน่วย | เช่น กล่อง, แผง, ขวด |
| ราคา | ราคาต่อหน่วย |
| คงเหลือ | จำนวนในสต๊อก |
| สถานะ | ปกติ / เหลือน้อย / หมด |

#### FR-INV-02: เพิ่มยาใหม่
**ผู้ใช้ที่มีสิทธิ์:** Admin

- กรอกข้อมูลยาใหม่ทั้งหมด
- รหัสยา/Barcode ต้องไม่ซ้ำ

#### FR-INV-03: แก้ไขข้อมูลยา
**ผู้ใช้ที่มีสิทธิ์:** Admin

- แก้ไขราคา, ชื่อ, หน่วย ได้
- ไม่สามารถแก้ไขรหัสยา (ต้องลบแล้วสร้างใหม่)

#### FR-INV-04: เพิ่มสต๊อก (Restock)
**ผู้ใช้ที่มีสิทธิ์:** Admin, Staff

- เลือกยา (หรือสแกน Barcode)
- ระบุจำนวนที่เพิ่ม
- ระบุหมายเหตุ (เช่น เลขล็อต, วันหมดอายุ)
- ระบบบันทึก stock_log

#### FR-INV-05: ดูประวัติการเคลื่อนไหวสต๊อก
**ผู้ใช้ที่มีสิทธิ์:** Admin

- แสดง log การเปลี่ยนแปลงทั้งหมด
- Filter ตามยา, ช่วงเวลา, ประเภทการเปลี่ยนแปลง

#### FR-INV-06: สแกน Barcode (Optional)
- เปิดกล้องจากหน้าเว็บ
- รองรับ Barcode 1D: **Code128** (หลัก), EAN-13, Code39
- ระบบค้นหายาและแสดงฟอร์มเพิ่ม/ลดสต๊อก

#### FR-INV-07: ปรับยอดสต๊อก (Stock Adjustment)
**ผู้ใช้ที่มีสิทธิ์:** Admin

- ปรับยอดสต๊อกกรณีพิเศษ (ยาหาย, ยาชำรุด, นับสต๊อกไม่ตรง)
- ระบุเหตุผลการปรับ (บังคับ)
- ระบบบันทึก stock_log ประเภท `adjust`

---

## 3. Non-Functional Requirements

### 3.1 Performance
- หน้าเว็บโหลดภายใน 3 วินาที (First Contentful Paint)
- การค้นหาแสดงผลภายใน 500ms

### 3.2 Security
- ใช้ HTTPS เท่านั้น
- Password ถูก hash ด้วย bcrypt (Supabase Auth)
- ใช้ Row Level Security (RLS) ทุกตาราง
- Session timeout หลัง 24 ชั่วโมง

### 3.3 Compatibility
- รองรับ Chrome, Safari, Firefox เวอร์ชันล่าสุด
- Responsive design สำหรับ Desktop และ Tablet
- Mobile view สำหรับการสแกน Barcode

### 3.4 Availability
- Target uptime: 99% (Supabase + Vercel SLA)

---

## 4. User Interface Guidelines

### 4.1 Design System
- **Color Scheme:** 
  - Primary: Blue (#0066CC)
  - Success: Green (#22C55E)
  - Warning: Amber (#F59E0B)
  - Error: Red (#EF4444)
  - Background: White/Gray (#F9FAFB)
  
- **Typography:** 
  - Font: Noto Sans Thai (Google Fonts)
  - Body: 14-16px
  - Headings: 18-32px

### 4.2 Layout
- Sidebar navigation สำหรับ Desktop
- Bottom navigation สำหรับ Mobile (optional)
- Breadcrumb สำหรับ nested pages

### 4.3 Components (shadcn/ui)
- Button, Input, Select, Textarea
- Card, Table, Dialog
- Toast notifications
- Form validation with error messages

---

## 5. Data Model Overview

### 5.1 ตารางหลัก

| ตาราง | คำอธิบาย | Key Fields |
|-------|----------|------------|
| users | ผู้ใช้ระบบ | id, email, full_name, role, **is_active**, **last_login_at** |
| patients | ผู้ป่วย | id, hn, name, phone, birth_date |
| medicines | ยา/เวชภัณฑ์ | id, code, name, unit, price, stock_qty |
| prescriptions | ใบสั่งยา | id, patient_id, doctor_id, status, **note**, **total_price**, **completed_at** |
| prescription_items | รายการในใบสั่ง | id, prescription_id, **item_type**, medicine_id, **procedure_name**, quantity, unit_price, **price_override** |
| transactions | ธุรกรรมคิดเงิน | id, prescription_id, patient_id, staff_id, total_amount, **payment_method** |
| transaction_items | รายการในใบเสร็จ | id, transaction_id, medicine_id, quantity, unit_price, amount |
| stock_logs | ประวัติสต๊อก | id, medicine_id, changed_by, change_type, quantity_change, **batch_id** (future) |

### 5.2 ERD Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     users       │     │    patients     │     │   medicines     │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id              │     │ id              │     │ id              │
│ email           │     │ hn              │     │ code (barcode)  │
│ full_name       │     │ name            │     │ name            │
│ role            │     │ birth_date      │     │ unit            │
│ is_active ✨    │     │ phone           │     │ price           │
│ last_login_at ✨│     │ ...             │     │ stock_qty       │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
    ┌────┴────┐                  │                       │
    ▼         ▼                  ▼                       │
┌────────────────────────────────────────────────────────┤
│                    prescriptions                       │
├────────────────────────────────────────────────────────┤
│ id, patient_id, doctor_id, status                      │
│ note ✨, total_price ✨, completed_at ✨               │
└────────────────────┬───────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────┐
│                  prescription_items                    │
├────────────────────────────────────────────────────────┤
│ id, prescription_id, item_type ✨ (medicine/procedure) │
│ medicine_id, procedure_name ✨, quantity               │
│ unit_price, price_override ✨, note                    │
└────────────────────┬───────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────┐
│                    transactions                        │
├────────────────────────────────────────────────────────┤
│ id, prescription_id, patient_id, staff_id             │
│ total_amount, payment_method ✨, paid_at, receipt_no  │
└────────────────────┬───────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────┐
│                  transaction_items                     │
├────────────────────────────────────────────────────────┤
│ id, transaction_id, item_type ✨, medicine_id         │
│ quantity, unit_price, amount                          │
└────────────────────────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────┐
│                     stock_logs                         │
├────────────────────────────────────────────────────────┤
│ id, medicine_id, changed_by, change_type              │
│ quantity_change, quantity_before, quantity_after      │
│ reference_type, reference_id, batch_id ✨ (future)    │
└────────────────────────────────────────────────────────┘
```

> ✨ = Fields ใหม่ที่เพิ่มตาม feedback

### 5.3 หมายเหตุ Data Model

1. **item_type** ใน prescription_items: ใช้แยกระหว่าง `medicine` และ `procedure`
2. **price_override**: ใช้เมื่อต้องการปรับราคาเฉพาะเคส (ไม่แก้ไขราคาหลักของยา)
3. **batch_id**: สงวนไว้สำหรับอนาคต (LOT tracking) - MVP ใช้ note แทน
4. **total_price** ใน prescriptions: คำนวณจาก sum ของ items (denormalized สำหรับ performance)

---

## 6. MVP Scope & Exclusions

### 6.1 Included in MVP ✅
- Email/Password authentication
- Role-based access (Admin, Doctor, Staff)
- Patient CRUD + Search
- Medicine/Inventory CRUD
- Prescription creation (medicine + procedure)
- **Price override per item** ✨
- **Void/Cancel prescription** ✨
- Dispensing & Billing by Staff
- **Multiple payment methods** (cash/transfer/card) ✨
- **Support zero-price items** (sample drugs) ✨
- Auto stock deduction
- **Stock adjustment** (with reason) ✨
- Receipt generation (web format, print from browser)
- Stock history log
- Barcode scanning (Code128 primary) - optional

### 6.2 Excluded from MVP ❌
- Appointment scheduling
- Multiple clinic branches
- Advanced reporting/analytics
- Export to Excel/PDF reports
- SMS/Email notifications
- Patient medical records (EMR) → *Phase 4+*
- Insurance/claim processing
- Multi-language support
- Mobile app (native)
- **LOT tracking / stock_batches** → *Phase 4+ (use note for now)*
- **PDF invoice generator** → *use browser print*

---

## 7. Success Metrics

| Metric | Target |
|--------|--------|
| User can complete patient registration | < 2 minutes |
| User can complete prescription + billing | < 3 minutes |
| System uptime | > 99% |
| Page load time | < 3 seconds |
| Zero critical bugs in production | ✅ |

---

## 8. Timeline

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Phase 1: Foundation | Week 1-2 | Auth, Patient CRUD, DB Schema |
| Phase 2: Core Workflow | Week 3-4 | Prescription, Billing, Stock |
| Phase 3: Polish | Week 5-6 | Barcode, RLS, Testing, Deploy |

---

## 9. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Barcode scanning compatibility | Medium | Provide manual code entry fallback |
| Database performance | Low | Use proper indexing, pagination |
| Security vulnerabilities | High | Implement RLS, input validation |
| Scope creep | Medium | Stick to MVP features strictly |

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| HN | Hospital Number - รหัสผู้ป่วย |
| Prescription | ใบสั่งยา/หัตถการจากแพทย์ |
| Procedure | หัตถการ - การรักษาที่ไม่ใช่ยา เช่น ทำแผล, ฉีดยา |
| Dispensing | การจ่ายยาตามใบสั่ง |
| Code128 | รูปแบบบาร์โค้ด 1 มิติ ที่ใช้เป็นหลักในระบบ |
| RLS | Row Level Security - การกำหนดสิทธิ์ระดับแถวข้อมูล |
| MVP | Minimum Viable Product - ผลิตภัณฑ์ขั้นต่ำที่ใช้งานได้ |
| LOT | หมายเลขล็อตการผลิต (รองรับใน Phase 4+) |
