# Sprint 4 (New): Pre-Payment Adjustment

**Date**: 24 มกราคม 2569  
**Status**: Approved  
**Estimate**: 3.5-4 days

> **แทน Sprint 4-5 เดิม** — ไม่รื้อ flow เดิม

---

## Final Spec

| # | Rule |
|---|------|
| 1 | `transaction_items` = immutable base |
| 2 | `transaction_adjustments` = delta + previous/new total |
| 3 | RPC atomic: lock + validate + restore + insert |
| 4 | Print ใช้ effective items |
| 5 | ไม่แตะ prescriptions |
| 6 | Void disable adjustment |

---

## Phases

| Phase | Task | Time |
|-------|------|------|
| 0 | DB: table + RPC | 1 day |
| 1 | Pre-payment tick-off (payment modal) | 1 day |
| 2 | Adjustment UI (receipt page) | 0.75 day |
| 3 | RPC integration | 0.5 day |
| 4 | Print effective items | 0.5 day |
| **Total** | | **3.5-4 days** |

---

## Phase 0: Database

### DDL

```sql
CREATE TABLE transaction_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id),
  adjustment_no INT NOT NULL,
  
  items_delta JSONB NOT NULL,
  amount_delta NUMERIC NOT NULL,
  previous_total NUMERIC NOT NULL,
  new_total NUMERIC NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID NOT NULL REFERENCES users(id),
  note TEXT,
  
  CONSTRAINT items_delta_array CHECK (jsonb_typeof(items_delta) = 'array'),
  CONSTRAINT amount_delta_negative CHECK (amount_delta <= 0),
  UNIQUE(transaction_id, adjustment_no)
);

CREATE INDEX idx_adjustments_transaction ON transaction_adjustments(transaction_id);
```

### RPC: `create_transaction_adjustment`

```sql
CREATE OR REPLACE FUNCTION create_transaction_adjustment(
  p_transaction_id UUID,
  p_updated_items JSONB,
  p_user_id UUID,
  p_note TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
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
  
  -- previous_total = last adjustment's new_total OR base total
  SELECT COALESCE(
    (SELECT new_total FROM transaction_adjustments 
     WHERE transaction_id = p_transaction_id 
     ORDER BY adjustment_no DESC LIMIT 1),
    (SELECT total_amount FROM transactions WHERE id = p_transaction_id)
  ) INTO v_previous_total;
  
  -- Calculate diff, new_total, amount_delta
  -- ... (implementation)
  
  -- Validate: new_total = previous_total + amount_delta
  IF v_new_total != v_previous_total + v_amount_delta THEN
    RAISE EXCEPTION 'Calculation mismatch';
  END IF;
  
  -- Atomic stock restore
  -- UPDATE medicines SET stock_qty = stock_qty + qty_restored WHERE id = ...
  
  -- Insert adjustment
  -- ...
  
  RETURN v_adjustment_id;
END;
$$ LANGUAGE plpgsql;
```

---

## Phase 1: Pre-Payment Tick-Off

| File | Change |
|------|--------|
| `payment-modal.tsx` | เพิ่ม checkbox "ไม่เอา" + qty input |
| `processPayment` | รับ adjusted items |

---

## Phase 2: Adjustment UI

| File | Change |
|------|--------|
| `receipt-view.tsx` | ปุ่ม "ปรับปรุงรายการ" |
| `adjustment-modal.tsx` | NEW: modal ลด/ติ๊กออก |

---

## Phase 3: RPC Integration

- Call RPC from `billing/actions.ts`
- Handle stock restore atomically

---

## Phase 4: Print

- `getEffectiveItems()` helper
- ใบเสร็จแสดง "ฉบับปรับปรุง #N"

---

## Verification

- [ ] Pre-payment: ติ๊กไม่เอา → receipt ไม่รวม
- [ ] Adjustment #1 → stock restore ถูก
- [ ] Adjustment #2 → diff จาก #1
- [ ] Void → ปุ่มปรับปรุงไม่แสดง
- [ ] Print → ยอดสุทธิ + "ฉบับปรับปรุง"

---

## Related Documents

- [ADR-0002](../../02-architecture/ADR/0002-reserved-stock-workflow.md)
- [DATABASE_SCHEMA](../../02-architecture/DATABASE_SCHEMA.md)
- [ROADMAP](../../05-reference/ROADMAP.md)
