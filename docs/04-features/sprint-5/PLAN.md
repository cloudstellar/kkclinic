# Sprint 5: Role-Based Access & Audit Trail

**Status:** Planning  
**Date:** 2025-01-25

## Goals

1. Staff-only dispensing workflow (ไม่เห็นยอดสรุป)
2. Void ควบคุมโดย Admin/Doctor เท่านั้น
3. Audit trail บนหน้า Prescription

---

## Patch A: UI/UX (Sprint 4.5)

### A1. Move "ปรับปรุงรายการ" to dropdown menu

**File:** `receipt-view.tsx`

- ลบปุ่ม primary "🔧 ปรับปรุงรายการ"
- เพิ่มใน dropdown "⋯ เพิ่มเติม"
- Condition: `paid && !voided && hasBaseItems && items.length > 0`

### A2. df-only handling

- ปุ่มยังอยู่ในเมนู
- กดแล้ว modal ขึ้น "ไม่มีรายการยา…" + Save disabled (เดิมทำไว้แล้ว)

---

## Patch B: Permissions (Sprint 4.5)

### B1. Block `/billing` for Staff

**File:** `app/(dashboard)/billing/page.tsx`

```tsx
if (userRole === 'staff') redirect('/dispensing')
```

### B2. Void = Admin/Doctor only

**Files:**
- `receipt-view.tsx`: ซ่อน VoidTransactionDialog สำหรับ staff
- `actions.ts` (`voidTransaction`): เพิ่ม guard role check

### B3. Create `/dispensing` route

- Clone simplified billing page
- Show prescriptions list (pending + paid)
- ไม่มียอดสรุป

---

## Phase 1: History on Prescription (Sprint 5)

**File:** `/prescriptions/[id]/page.tsx`

### UI Section: "ประวัติ"

```tsx
<Card>
  <CardHeader>ประวัติ</CardHeader>
  <CardContent>
    - ✅ ชำระเงิน: {date} | {receipt_no}
    - 🔧 ปรับปรุง #1: {date} | {by} | ฿{prev} → ฿{new}
    - 🔧 ปรับปรุง #2: ...
    - ❌ ยกเลิก: {date} | {by} | {reason}
  </CardContent>
</Card>
```

### Data Source

- `transactions` → paid_at, voided_at, void_reason
- `transaction_adjustments` → list

---

## Implementation Order

| Order | Task | Est |
|-------|------|-----|
| 1 | A1: Adjust button → dropdown | 30m |
| 2 | B2: Void guard (server + UI) | 30m |
| 3 | B1: Block /billing for staff | 15m |
| 4 | B3: Create /dispensing | 1h |
| 5 | History section on Rx | 1h |

---

## Acceptance Criteria

- [ ] Staff ไม่เห็น `/billing`
- [ ] Staff ไม่ void ได้
- [ ] "ปรับปรุงรายการ" อยู่ในเมนู ⋯
- [ ] หน้า Rx แสดงประวัติ (payment, adjustments, void)
