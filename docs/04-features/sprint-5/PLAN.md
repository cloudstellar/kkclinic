# Sprint 5: Schema + Workflow Revolution

> Status: 🔲 Planning  
> Target Start: After Sprint 4 complete  
> Estimated Time: 1-2 weeks  
> **Pre-requisite**: Sprint 4 ต้องเสร็จก่อน (Naming & Semantics Clean)

---

## 🎯 Goals

1. DB Migration + Types
2. Stock Management + Guardrails (core correctness)
3. Staff Confirmation UI + Status Flow
4. *(Optional)* Minimal Reporting

---

## 📋 Scope Overview

| Phase | ชื่อ | สิ่งที่ทำ | Risk |
|-------|-----|----------|------|
| **M1** | Database Migration | เพิ่ม columns + types | 🟠 Medium |
| **M2** | Stock Management | Reserve/Deduct + Guardrails | 🔴 High |
| **M2.5** | E2E Test (no UI) | Server action test flow | 🟢 Low |
| **M3** | Staff Confirmation UI | checkbox + status flow | 🟠 Medium |
| **M4** | Reporting (minimal) | EOD รายได้รวม | 🟡 Optional |

> [!IMPORTANT]
> **ลำดับสำคัญ!** ทำ Guardrails (M2) ก่อน UI (M3)  
> เพราะ Guardrails เป็น "core correctness" ต้องถูกก่อน

---

## 🔗 ADR Reference

> [!CAUTION]
> **ต้องอ่าน ADR-0002 ก่อนเริ่มงาน!**  
> [ADR-0002: Reserved Stock Workflow](../../02-architecture/ADR/0002-reserved-stock-workflow.md)

---

## 🔧 M1: Database Migration

> [!NOTE]
> ข้อมูลที่มีอยู่เป็น test data สามารถล้างได้

```sql
-- 1. ล้าง test data (optional)
TRUNCATE TABLE transaction_items, transactions, 
               prescription_items, prescriptions, 
               stock_movements CASCADE;

-- 2. Migration: prescriptions
ALTER TABLE prescriptions ADD COLUMN status text DEFAULT 'pending';
ALTER TABLE prescriptions ADD CONSTRAINT prescriptions_status_check 
  CHECK (status IN ('pending', 'confirmed', 'paid'));

-- 3. Migration: prescription_items
ALTER TABLE prescription_items ADD COLUMN is_dispensed boolean DEFAULT true;

-- 4. Migration: medicines
ALTER TABLE medicines ADD COLUMN reserved_qty integer DEFAULT 0;
```

### M1 DoD
- [ ] Migration สำเร็จ
- [ ] Types อัปเดตแล้ว (`src/types/prescriptions.ts`)
- [ ] `npm run typecheck` ผ่าน

---

## 🔧 M2: Stock Management + Guardrails

> [!WARNING]
> **ทำก่อน UI!** Core correctness ต้องถูกก่อน

### สิ่งที่ต้องทำ

1. **Reserve Stock** - ตอนสร้าง prescription (pending)
2. **Release Reserved** - ตอน Staff ติ๊กยาออก (หรือยกเลิก)
3. **Deduct Stock** - ตอนชำระเงิน (paid)

### Technical Guardrails (บังคับ! ดู ADR-0002 Section 6)

#### 6.1 Stock Reservation Rules
```
available_qty = on_hand_qty - reserved_qty
```
- ก่อน reserve: `available_qty >= requested_qty`
- ❌ ห้าม `reserved_qty < 0`
- ❌ ห้าม `reserved_qty > on_hand_qty`

#### 6.2 Atomicity / Concurrency
- ต้องใช้ **DB transaction** หรือ RPC
- ❌ ห้ามคำนวณ client-side แล้ว update

#### 6.3 Status-based Locking
- `status != 'pending'` → ห้ามแก้ items
- `status = 'paid'` → **immutable** ทั้งหมด

### M2 DoD
- [ ] Server action: `createPrescription()` → reserve stock
- [ ] Server action: `confirmPrescription()` → release unselected
- [ ] Server action: `processPayment()` → deduct stock
- [ ] Guardrails 6.1-6.3 implemented
- [ ] **Concurrency Test**: สร้าง prescription พร้อมกัน 2 อัน → stock ไม่ติดลบ

---

## 🧪 M2.5: End-to-End Test (No UI)

> [!TIP]
> พิสูจน์ว่า logic ถูก ก่อนค่อยทำ UI

สร้าง test script หรือ server action test:

```typescript
// Test flow:
// 1. Create prescription (pending) → assert stock reserved
// 2. Confirm + remove 1 item → assert reserved released for that item
// 3. Process payment → assert stock deducted for remaining items
// 4. Final: on_hand_qty ถูกต้อง, reserved_qty = 0
```

### M2.5 DoD
- [ ] Test script/action ทำงานได้
- [ ] ผ่านทุก assertion
- [ ] ไม่มี stock ติดลบ

---

## 🔧 M3: Staff Confirmation UI + Status Flow

### สิ่งที่ต้องทำ

1. **Prescription List** - แสดง status badge (pending/confirmed/paid)
2. **Staff Confirmation Page** - หน้าให้ Staff ติ๊กเลือกรายการ
   - แสดงรายการยาทั้งหมด
   - Checkbox สำหรับแต่ละรายการ (default = checked)
   - DF แสดงแต่ไม่มี checkbox (จ่ายเสมอ)
   - ยอดรวมอัปเดตตาม items ที่เลือก
   - ปุ่ม "ยืนยัน" → status = 'confirmed'
3. **Payment Flow** - confirmed → paid

### M3 DoD
- [ ] Prescription list แสดง status badge
- [ ] Staff confirmation page ทำงานถูกต้อง
- [ ] DF ติ๊กออกไม่ได้
- [ ] ยอดเงินอัปเดตถูกต้อง
- [ ] Status transitions work: pending → confirmed → paid
- [ ] PrepaySummary และ Receipt render ถูกต้องตาม status

---

## 🔧 M4: Reporting (Minimal - Optional)

> [!NOTE]
> ถ้าเวลาไม่พอ → เลื่อนไป Sprint 6

### Minimal EOD (พอแค่นี้ก่อน)
- [ ] รายได้รวมประจำวัน
- [ ] จำนวน transactions
- [ ] แยกตาม payment method

### ไม่ทำใน Sprint 5
- ❌ Top-selling medicines → Sprint 6
- ❌ Daily sales history page → Sprint 6

---

## ❌ Out of Scope for Sprint 5

| สิ่งที่ไม่ทำ | เหตุผล | ย้ายไป |
|------------|-------|-------|
| Cancel prescription | ต้องมี ADR ใหม่ | Future |
| Refund / Return to stock | ต้องมี ADR ใหม่ | Future |
| Edit prescription after confirmed | ยกเว้น is_dispensed | - |
| Stock adjustment UI | ยังไม่จำเป็น | Future |
| UX improvements (filter, sort) | ทำหลัง workflow นิ่ง | Sprint 6 |
| Full reporting | ทำหลัง workflow นิ่ง | Sprint 6 |

---

## 📊 Status Flow

```
pending ──→ confirmed ──→ paid
```

| Status | ความหมาย | Stock Action |
|--------|----------|-------------|
| `pending` | รอ Staff ยืนยัน | RESERVED |
| `confirmed` | ยืนยันรายการแล้ว | Release unselected |
| `paid` | ชำระเงินแล้ว | DEDUCTED |

---

## ✅ Sprint 5 Complete DoD

- [ ] **M1**: Database migration สำเร็จ + types updated
- [ ] **M2**: Stock management + guardrails implemented
- [ ] **M2.5**: E2E test ผ่าน (no stock negative)
- [ ] **M3**: Staff confirmation UI + status flow ทำงาน
- [ ] **M4**: Minimal EOD (optional)
- [ ] `npm run lint` ผ่าน
- [ ] `npm run typecheck` ผ่าน
- [ ] Manual test flow ทั้งหมด: pending → confirmed → paid

---

## 🔗 Related

- [ADR-0002: Reserved Stock Workflow](../../02-architecture/ADR/0002-reserved-stock-workflow.md)
- [Sprint 4 PLAN.md](../sprint-4/PLAN.md) — Naming & Semantics
- [Sprint 6 PLAN.md](../sprint-6/PLAN.md) — UX + Full Reporting *(to be created)*
