# Sprint 4 (New): Pre-Payment Adjustment

**Date**: 24 มกราคม 2569  
**Status**: ✅ Approved  
**Estimate**: 3.5–4 days

> **แทน Sprint 4–5 เดิม** — ไม่รื้อ flow เดิม (Backward compatible)

---

## Final Spec

| # | Rule |
|---|------|
| 1 | `transaction_items` = immutable base (ห้ามแก้ทับหลังชำระ) |
| 2 | `transaction_adjustments` = delta (qty_reduced, unit_price จาก base) + previous_total/new_total |
| 3 | RPC atomic: lock + validate + restore + insert (ทำใน transaction เดียว) |
| 4 | Print/Model ใช้ effective items เสมอ |
| 5 | ไม่แตะ prescriptions |
| 6 | Void disable adjustment (voided_at IS NULL) |

---

## Definitions

| Term | Definition |
|------|------------|
| **Base Items** | แถวใน `transaction_items` ณ ตอนชำระ (immutable) |
| **Adjustment** | การ "ลด/ติ๊กออก" หลังชำระ โดยไม่แก้ทับ base items |
| **Effective Items** | `base_qty - sum(qty_reduced)` ต่อ medicine_id จากทุก adjustments |

---

## Phases

| Phase | Task | Time |
|-------|------|------|
| 0 | DB: table + RPC | 1 day |
| 1 | Pre-payment tick-off (payment modal) | 1 day |
| 2 | Adjustment UI (receipt page) | 0.75 day |
| 3 | RPC integration | 0.5 day |
| 4 | Print effective items | 0.5 day |
| **Total** | | **3.5–4 days** |

---

## Phase 0: Database

### DDL: `transaction_adjustments`

```sql
CREATE TABLE transaction_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id),
  adjustment_no INT NOT NULL,

  -- Delta: unit_price MUST come from base transaction_items.unit_price
  items_delta JSONB NOT NULL,           -- [{ medicine_id, qty_reduced, unit_price }]
  amount_delta NUMERIC NOT NULL,        -- <= 0

  -- Totals for audit/print
  previous_total NUMERIC NOT NULL,
  new_total NUMERIC NOT NULL,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES users(id),
  note TEXT,

  CONSTRAINT items_delta_array CHECK (jsonb_typeof(items_delta) = 'array'),
  CONSTRAINT amount_delta_negative CHECK (amount_delta <= 0),
  UNIQUE(transaction_id, adjustment_no)
);

CREATE INDEX idx_adjustments_transaction ON transaction_adjustments(transaction_id);
```

### RPC: `create_transaction_adjustment`

**Signature:**
- `p_transaction_id UUID`
- `p_updated_items JSONB` — `[{ medicine_id, new_qty }]`
- `p_user_id UUID`
- `p_note TEXT DEFAULT NULL`
- **returns** `UUID` (adjustment_id)

**Guardrails (MUST):**
1. `voided_at IS NULL` เท่านั้น
2. `p_updated_items` ต้องเป็น array
3. Backend default: ถ้าไม่ได้ส่ง medicine_id บางตัว → `new_qty = effective_qty`
4. ห้ามเพิ่มจำนวน: `new_qty <= effective_qty` และ `new_qty >= 0`
5. คำนวณ diff จาก **สถานะล่าสุด** (effective ล่าสุด)
6. คืนสต็อก + insert adjustment ใน transaction เดียว (atomic)
7. `new_total = previous_total + amount_delta` ต้องตรง ไม่งั้น throw

```sql
CREATE OR REPLACE FUNCTION create_transaction_adjustment(
  p_transaction_id UUID,
  p_updated_items JSONB,
  p_user_id UUID,
  p_note TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_adjustment_id UUID;
  v_previous_total NUMERIC;
  v_new_total NUMERIC;
  v_amount_delta NUMERIC;
BEGIN
  -- Input validation
  IF jsonb_typeof(p_updated_items) != 'array' THEN
    RAISE EXCEPTION 'Invalid input: must be array';
  END IF;

  -- Lock transaction (guard: not voided)
  IF NOT EXISTS (
    SELECT 1 FROM transactions
    WHERE id = p_transaction_id AND voided_at IS NULL
    FOR UPDATE
  ) THEN
    RAISE EXCEPTION 'Transaction not found or voided';
  END IF;

  -- previous_total = last adjustment new_total OR base total
  SELECT COALESCE(
    (SELECT new_total FROM transaction_adjustments
     WHERE transaction_id = p_transaction_id
     ORDER BY adjustment_no DESC LIMIT 1),
    (SELECT total_amount FROM transactions WHERE id = p_transaction_id)
  ) INTO v_previous_total;

  -- Calculate diff, new_total, amount_delta
  -- ... (implementation details)

  -- Validate: new_total = previous_total + amount_delta
  IF v_new_total != v_previous_total + v_amount_delta THEN
    RAISE EXCEPTION 'Calculation mismatch';
  END IF;

  -- Atomic stock restore
  -- UPDATE medicines SET stock_qty = stock_qty + qty_restored WHERE id = ...

  -- Insert adjustment
  -- INSERT INTO transaction_adjustments (...) RETURNING id INTO v_adjustment_id;

  RETURN v_adjustment_id;
END;
$$ LANGUAGE plpgsql;
```

> **หมายเหตุ:** ชื่อคอลัมน์/ตารางสต็อกให้ผูกกับของจริงในระบบตอน implement

---

## Phase 1: Pre-Payment Tick-Off

| File | Change |
|------|--------|
| `payment-modal.tsx` | เพิ่ม checkbox "ไม่เอา" + input ลด qty + total real-time |
| `processPayment` | รับ effective items และสร้าง transaction_items ตามนั้น |

**Behavior:**
- ติ๊ก "ไม่เอา" = qty → 0 (ไม่สร้าง line item)
- ลด qty = คิดเงินตาม qty ใหม่
- กด "ชำระ" = create transaction + deduct stock ตาม effective qty
- **ไม่แก้ prescriptions**

---

## Phase 2: Adjustment UI (Post-Payment)

| File | Change |
|------|--------|
| `receipt-view.tsx` | ปุ่ม "ปรับปรุงรายการ" |
| `adjustment-modal.tsx` | NEW: modal ลด/ติ๊กออก |

**Button visibility:** `paid AND voided_at IS NULL`

**Modal behavior:**
- แสดง effective items ล่าสุด
- ลด/ติ๊กออกได้เท่านั้น (no add)
- แสดงยอด: previous_total, new_total, delta
- Save → เรียก RPC

---

## Phase 3: RPC Integration + Void Logic Fix

**createAdjustment:**
- Call RPC from `billing/actions.ts`
- Handle errors: voided, invalid qty, calculation mismatch
- On success: refresh receipt view

**Void Logic (Extended):**
- Void หลัง adjustment: คืน stock ตาม **effective items** (ไม่ใช่ base)
- Reuse helper: `getEffectiveItems(transactionId)`
- Void ต้อง idempotent (เช็ค `voided_at` ก่อน stock movement)
- Void แล้ว: ปุ่ม "ปรับปรุงรายการ" ไม่แสดง + RPC reject
- Void transaction ที่มีเฉพาะ df: ไม่แตะ stock, void ผ่านปกติ

---

## Phase 4: Print (Effective Items)

- Helper: `getEffectiveItems(transactionId)`
- ใบเสร็จ: แสดง "ฉบับปรับปรุง #N" เมื่อมี adjustments
- ฉลากยา: ไม่พิมพ์รายการที่ถูกตัดออก

---

## Edge Cases & Decisions

| Case | Decision |
|------|----------|
| **Void หลัง adjustment** | คืน stock ตาม **effective items** ไม่ใช่ base |
| **Doctor Fee (df)** | ปรับไม่ได้ (df คงที่) |
| **Discount** | คงเดิม (ไม่ปรับตามสัดส่วน) |
| **Transaction มีแค่ df ไม่มียา** | ปุ่มแสดง → Modal แสดง "ไม่มีรายการยาให้ปรับ" |
| **Effective items = empty** | ยังพิมพ์ได้ (total = 0) |

---

## Verification (DoD)

- [ ] Pre-payment: ติ๊กไม่เอา → receipt ไม่รวมรายการนั้น
- [ ] Pre-payment: ลด qty → stock deduct ตาม qty ใหม่
- [ ] Adjustment #1 → stock restore ถูก + "ฉบับปรับปรุง #1"
- [ ] Adjustment #2 → diff จาก effective ล่าสุด (ไม่คืนซ้ำ)
- [ ] Void → ปุ่มปรับปรุงไม่แสดง + RPC ปฏิเสธ
- [ ] **Void หลัง adjust → คืน stock ตาม effective (ไม่ใช่ base)**
- [ ] **Void ซ้ำ → ไม่เกิด stock movement รอบสอง (idempotent)**
- [ ] Print → ยอดสุทธิ + "ฉบับปรับปรุง" + effective items ถูกต้อง
- [ ] df ไม่ถูก adjust
- [ ] discount ไม่เปลี่ยน
- [ ] Transaction มีแค่ df → modal แสดง "ไม่มีรายการยา"

---

## Implementation Notes (Final Nits)

1. **previous_total source**: ใช้ `ORDER BY adjustment_no DESC LIMIT 1`
2. **RPC concurrency**: `FOR UPDATE` + throw error + UI retry (OK)
3. **Print edge case**: effective items = empty → ยังพิมพ์ได้ (total = 0)
4. **Void logic**: แก้ให้คืน effective items ไม่ใช่ base items
5. **RPC precision**: เปรียบเทียบ NUMERIC ใช้ tolerance หรือ cast scale เดียวกัน
6. **UI message (df-only)**: "รายการนี้ไม่มีรายการยา (มีเฉพาะค่าบริการแพทย์)"

---

## Related Documents

- [ADR-0002](../../02-architecture/ADR/0002-reserved-stock-workflow.md)
- [DATABASE_SCHEMA](../../02-architecture/DATABASE_SCHEMA.md)
- [ACCEPTANCE_CRITERIA](./ACCEPTANCE_CRITERIA.md)
- [ROADMAP](../../05-reference/ROADMAP.md)
