# Next Session: Sprint 4 (New) — Pre-Payment Adjustment

**Date**: 24 มกราคม 2569  
**Status**: ✅ Planning Complete — Ready for Implementation  
**Branch**: `main`

---

## 🎯 What to Implement

### Sprint 4 (New): Pre-Payment Adjustment + Transaction Adjustments

> **แทน Sprint 4-5 เดิม** (Reserved Stock Workflow ถูก archived)

---

## Phases

| Phase | Description | Time |
|-------|-------------|------|
| 0 | DB: `transaction_adjustments` table + RPC | 1 day |
| 1 | Pre-payment tick-off (ติ๊กก่อนชำระ) | 1 day |
| 2 | Adjustment UI (ปุ่ม "ปรับปรุงรายการ") | 0.75 day |
| 3 | RPC integration (atomic stock restore) | 0.5 day |
| 4 | Print effective items | 0.5 day |

---

## Key Features

- ✅ ติ๊ก "ไม่เอา" ก่อนชำระ → ลด receipt items
- ✅ ปุ่ม "ปรับปรุงรายการ" หลังชำระ → ลด/ติ๊กออก → restore stock
- ✅ Adjustment record (ไม่แก้ทับ original)
- ✅ RPC atomic: lock + validate + restore + insert

---

## New Table: `transaction_adjustments`

```sql
CREATE TABLE transaction_adjustments (
  id UUID PRIMARY KEY,
  transaction_id UUID REFERENCES transactions(id),
  adjustment_no INT NOT NULL,
  items_delta JSONB NOT NULL,
  amount_delta NUMERIC NOT NULL,
  previous_total NUMERIC NOT NULL,
  new_total NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES users(id),
  UNIQUE(transaction_id, adjustment_no)
);
```

---

## 📚 Key Documents

- [ADR-0002: Pre-Payment Adjustment](docs/02-architecture/ADR/0002-reserved-stock-workflow.md)
- [ROADMAP.md](docs/05-reference/ROADMAP.md)
- [SEMANTIC_GLOSSARY.md](docs/05-reference/SEMANTIC_GLOSSARY.md)

---

## ⚠️ Archived Documents

Old Sprint 4-5 plans moved to `docs/99-archived/`:
- `99-archived/sprint-4/PLAN.md`
- `99-archived/sprint-5/PLAN.md`
