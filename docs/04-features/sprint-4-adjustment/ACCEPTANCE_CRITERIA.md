# Sprint 4 (New): Acceptance Criteria per File

**Scope:** Pre-Payment Adjustment + Transaction Adjustments  
**Status:** Approved  
**Out of Scope:** Reserved stock workflow, prescription mutation, route refactor

---

## Phase 0 — Database

### 📄 Migration: `transaction_adjustments`

**File:** `supabase/migrations/XXXX_create_transaction_adjustments.sql`

**Acceptance Criteria:**
- [ ] สร้าง table `transaction_adjustments` ตาม DDL ที่ล็อกไว้
- [ ] มี `UNIQUE(transaction_id, adjustment_no)`
- [ ] มี CHECK:
  - `jsonb_typeof(items_delta) = 'array'`
  - `amount_delta <= 0`
- [ ] `created_at` เป็น `NOT NULL DEFAULT now()`
- [ ] มี index `idx_adjustments_transaction(transaction_id)`
- [ ] `unit_price` ใน `items_delta` ถูกใช้เพื่อ audit เท่านั้น (ไม่ดึงราคาปัจจุบัน)

**Do NOT:**
- ❌ แก้ schema ของ `transactions` หรือ `transaction_items`
- ❌ เพิ่ม foreign key ไป `prescriptions`

---

### 📄 RPC: `create_transaction_adjustment`

**File:** `supabase/functions/create_transaction_adjustment.sql`

**Acceptance Criteria:**
- [ ] รับ input:
  - `p_transaction_id`
  - `p_updated_items` (JSON array)
  - `p_user_id`
  - `p_note`
- [ ] Reject เมื่อ:
  - `p_updated_items` ไม่ใช่ array
  - transaction ไม่พบ หรือ `voided_at IS NOT NULL`
- [ ] Lock แถว transaction ด้วย `FOR UPDATE`
- [ ] หา `previous_total` จาก:
  - last `adjustment.new_total` ถ้ามี
  - else `transactions.total_amount`
- [ ] คำนวณ `effective_qty` ล่าสุด จาก:
  - base `transaction_items`
  - − `sum(qty_reduced)` จาก adjustments เดิม
- [ ] Merge default qty:
  - ถ้า `medicine_id` ไม่อยู่ใน `p_updated_items` → `new_qty = effective_qty`
- [ ] Validate:
  - `new_qty <= effective_qty`
  - `new_qty >= 0`
- [ ] คำนวณ diff:
  - `qty_reduced = effective_qty - new_qty`
  - เฉพาะรายการที่ `qty_reduced > 0`
- [ ] `unit_price` ต้องมาจาก `transaction_items.unit_price`
- [ ] คำนวณ:
  - `amount_delta = -SUM(qty_reduced * unit_price)`
  - `new_total = previous_total + amount_delta`
- [ ] Throw error ถ้า `new_total != previous_total + amount_delta`
- [ ] คืนสต็อก **ภายใน transaction เดียวกัน**
- [ ] Insert `transaction_adjustments` พร้อม:
  - `adjustment_no = max + 1`
  - `items_delta`
  - `amount_delta`
  - `previous_total`, `new_total`
  - `created_by`, `note`
- [ ] Return `adjustment_id`

**Do NOT:**
- ❌ แก้ `transaction_items`
- ❌ คืนสต็อกนอก transaction
- ❌ อนุญาตเพิ่ม qty

---

## Phase 1 — Pre-Payment Tick-Off

### 📄 UI: Payment Modal

**File:** `src/components/payment/payment-modal.tsx`

**Acceptance Criteria:**
- [ ] ทุกยาแสดง:
  - checkbox "ไม่เอา"
  - qty input (min 0, max base qty)
- [ ] ติ๊ก "ไม่เอา" → qty = 0
- [ ] ลด qty → total recalculated real-time
- [ ] UI ไม่อนุญาตเพิ่ม qty เกิน base
- [ ] เมื่อกด "ชำระเงิน":
  - ส่งเฉพาะ effective items (qty > 0)

**Do NOT:**
- ❌ แก้ prescription
- ❌ สร้าง receipt ก่อน confirm

---

### 📄 Backend: `processPayment`

**File:** `src/app/(dashboard)/billing/actions.ts`

**Acceptance Criteria:**
- [ ] รับ effective items จาก UI
- [ ] สร้าง:
  - `transactions`
  - `transaction_items` เฉพาะ effective items
- [ ] Deduct stock ตาม effective qty เท่านั้น
- [ ] `transactions.total_amount` = base total ณ ตอนชำระ
- [ ] ไม่สร้าง adjustment ใด ๆ ใน phase นี้

---

## Phase 2 — Post-Payment Adjustment UI

### 📄 Receipt View

**File:** `src/app/(dashboard)/billing/receipt/[id]/receipt-view.tsx`

**Acceptance Criteria:**
- [ ] แสดงปุ่ม "ปรับปรุงรายการ" เมื่อ:
  - `status = paid`
  - `voided_at IS NULL`
- [ ] ปุ่มไม่แสดงเมื่อ:
  - voided
  - unpaid

---

### 📄 Adjustment Modal

**File:** `src/components/billing/adjustment-modal.tsx` (NEW)

**Acceptance Criteria:**
- [ ] โหลด effective items ล่าสุด
- [ ] แสดง qty ปัจจุบัน
- [ ] ลด qty / ติ๊กออกได้เท่านั้น
- [ ] ไม่อนุญาตเพิ่ม qty
- [ ] แสดง:
  - `previous_total`
  - `new_total`
  - `delta`
- [ ] ปุ่ม Save:
  - เรียก `create_transaction_adjustment`
- [ ] ปิด modal + refresh receipt เมื่อสำเร็จ
- [ ] แสดง error message จาก RPC ชัดเจน

---

## Phase 3 — RPC Integration

### 📄 Billing Actions

**File:** `src/app/(dashboard)/billing/actions.ts`

**Acceptance Criteria:**
- [ ] มี function `createAdjustment(transactionId, updatedItems, note?)`
- [ ] เรียก Supabase RPC `create_transaction_adjustment`
- [ ] ส่ง `user_id` จาก session
- [ ] Handle error:
  - voided
  - invalid qty
  - calculation mismatch
- [ ] On success:
  - refresh receipt data
  - ไม่ redirect บังคับ (print optional)

---

## Phase 4 — Print (Effective Items)

### 📄 Helper

**File:** `src/lib/billing/effective-items.ts`

**Acceptance Criteria:**
- [ ] `getEffectiveItems(transactionId)`:
  - base from `transaction_items`
  - subtract `sum of qty_reduced` from adjustments
  - filter `qty > 0`
- [ ] ไม่มี side-effect

---

### 📄 Print Components (Existing)

**Files:**
- receipt print
- medicine summary
- label print

**Acceptance Criteria:**
- [ ] ใช้ effective items เท่านั้น
- [ ] ใบเสร็จ:
  - แสดงยอดสุทธิหลังปรับ
  - แสดงข้อความ "ฉบับปรับปรุง #N" เมื่อมี adjustments
- [ ] ฉลาก:
  - ไม่พิมพ์รายการที่ถูกตัดออก
- [ ] ไม่มี layout change จากเดิม

---

## Global Guardrails (Must Pass)

- [ ] `transaction_items` ไม่ถูกแก้ไขหลังชำระ
- [ ] Adjustment ทำได้เฉพาะ reduce / remove
- [ ] Adjustment หลัง void ถูกปฏิเสธทั้ง UI + RPC
- [ ] Stock restore ไม่เกิดซ้ำเมื่อปรับหลายครั้ง
- [ ] ไม่มี dependency กับ prescription flow
- [ ] **Void หลัง adjust → คืน stock ตาม effective (ไม่ใช่ base)**
- [ ] **df ไม่ถูก adjust** (Doctor Fee คงที่)
- [ ] **discount คงเดิม** (ไม่ปรับตามสัดส่วน)
- [ ] **Transaction มีแค่ df → modal แสดง "ไม่มีรายการยาให้ปรับ"**

