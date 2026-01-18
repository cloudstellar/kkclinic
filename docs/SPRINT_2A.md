# Sprint 2A - Billing & Label Printing

## Overview

Sprint 2A focuses on billing system improvements and medicine label printing for the eye clinic.

**Completed: 2026-01-18**

---

## Features Implemented

### 1. Void Transaction (Soft Delete)

**Purpose:** Allow staff to void transactions that were made in error without deleting data.

**Behavior:**
- Sets `status = 'voided'` (does NOT delete)
- **Stock is NOT restored** (medicine already dispensed)
- Records audit trail: `voided_at`, `voided_by`, `void_reason`
- Voided transactions shown with strikethrough and red badge

**Files:**
- `src/app/(dashboard)/billing/actions.ts` - `voidTransaction()`
- `src/app/(dashboard)/billing/receipt/[id]/void-transaction-dialog.tsx`

---

### 2. Payment Idempotency

**Purpose:** Prevent double-payment if user accidentally clicks pay button twice.

**Implementation:**
- Client generates `request_id` (UUID v4) before payment
- Database unique constraint on `request_id`
- If duplicate detected, returns existing transaction instead of error

**Files:**
- `src/app/(dashboard)/billing/actions.ts` - `processPayment()`
- `src/types/transactions.ts` - `PaymentRequest`

---

### 3. Dosage Instructions with Presets

**Purpose:** Speed up prescription entry with pre-defined dosage instructions.

**Preset Categories:**
- 💊 **ยากิน (Oral):** หลังอาหาร เช้า-กลางวัน-เย็น, ก่อนนอน 1 เม็ด, etc.
- 👁️ **ยาหยอดตา (Eye Drops):** หยอดตา 1 หยด วันละ 4 ครั้ง, etc.
- 🧴 **ยาทา (Topical):** ป้ายตา บาง ๆ ก่อนนอน, etc.

**Features:**
- Click preset → fills textarea
- Character counter (80 char limit)
- Clear button

**Files:**
- `src/components/ui/dosage-input.tsx` - New component
- `src/app/(dashboard)/prescriptions/new/page.tsx` - Uses DosageInput

---

### 4. Label Printing

**Purpose:** Print medicine labels for dispensed items.

**Label Format (A6 Landscape 148x105mm):**
```
┌─────────────────────────────────────────────┐
│              คลินิกตาใสใส                    │
│     186/153 ถนนเทศบาล34... ☎081-776-6936    │
├─────────────────────────────────────────────┤
│  วันที่: 18 ม.ค. 2569    TN: 000001         │
│  ผู้ป่วย: ทดสอบ ระบบ                        │
├─────────────────────────────────────────────┤
│  ชื่อยา: **โอเมพราโซล 20mg** (5 แคปซูล)     │
│                                              │
│  วิธีใช้: หลังอาหาร เช้า-กลางวัน-เย็น        │
│  สรรพคุณ: ลดกรดในกระเพาะ                    │
│                                              │
│  ⚠️ โปรดเก็บยาพ้นมือเด็ก...               │
└─────────────────────────────────────────────┘
```

**Files:**
- `src/app/(dashboard)/billing/receipt/[id]/labels/page.tsx`
- `src/app/(dashboard)/billing/receipt/[id]/labels/label-print-view.tsx`
- `src/lib/clinic-config.ts` - Clinic info + TN formatter

---

### 5. Frequently Used Medicines

**Purpose:** Show most commonly prescribed medicines first when creating prescriptions.

**Implementation:**
- RPC function counts usage from `prescription_items`
- Orders by usage count DESC, then name ASC
- Fallback to alphabetical if no usage data

**Files:**
- `src/app/(dashboard)/prescriptions/actions.ts` - `searchMedicines()`
- Database migration: `add_frequently_used_medicines_rpc`

---

## Database Changes

### New RPC Function
```sql
CREATE FUNCTION get_frequently_used_medicines(limit_count INT)
RETURNS TABLE (id, code, name, unit, price, stock_qty)
```

### New Constraints
- `transactions_status_check` - status IN ('paid', 'voided')
- `transactions_void_consistency_check` - void fields must be complete together
- `uniq_transactions_request_id` - idempotency
- `uniq_paid_tx_per_prescription` - prevent double payment

---

## Configuration

### Clinic Config
File: `src/lib/clinic-config.ts`

Update this file to change:
- Clinic name and address
- Phone number
- Patient ID label (TN vs HN)

### Dosage Presets
File: `src/components/ui/dosage-input.tsx`

Update `DOSAGE_PRESETS` object to add/modify presets.

---

## Future Improvements (Sprint 2B/3)

### Sprint 2B
- [ ] Recent 5 dosage presets per doctor
- [ ] iPad-optimized chip sizes
- [ ] Copy dosage to all items button

### Sprint 3
- [ ] Smart Builder (compose dosage from parts)
- [ ] Preview label in sidebar
- [ ] Context-aware presets (eye meds first)
- [ ] Low stock alerts
- [ ] Barcode scanner for dispensing
