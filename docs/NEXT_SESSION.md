# Next Session: Sprint 4 (New) — Pre-Payment Adjustment

**Date**: 24 มกราคม 2569  
**Status**: ✅ Planning Complete — Ready for Implementation  
**Branch**: `main`

---

## 🎯 What to Implement

### Sprint 4 (New): Pre-Payment Adjustment + Transaction Adjustments

> **Single Source of Truth:**
> - [PLAN.md](04-features/sprint-4-adjustment/PLAN.md)
> - [ACCEPTANCE_CRITERIA.md](04-features/sprint-4-adjustment/ACCEPTANCE_CRITERIA.md)

---

## Implementation Order

| Phase | Task | Time | Status |
|-------|------|------|--------|
| 0 | DB: `transaction_adjustments` table + RPC | 1 day | 🔲 |
| 1 | Pre-payment tick-off (payment modal) | 1 day | 🔲 |
| 2 | Adjustment UI (receipt page) | 0.75 day | 🔲 |
| 3 | RPC integration | 0.5 day | 🔲 |
| 4 | Print effective items | 0.5 day | 🔲 |

---

## Key Concepts

| Term | Definition |
|------|------------|
| **Base Items** | `transaction_items` ณ ตอนชำระ (immutable) |
| **Adjustment** | ลด/ติ๊กออก หลังชำระ (ไม่แก้ทับ) |
| **Effective Items** | base_qty − sum(qty_reduced) |

---

## Final Nits (Implementation Notes)

1. **previous_total**: ใช้ `ORDER BY adjustment_no DESC LIMIT 1`
2. **RPC concurrency**: `FOR UPDATE` + throw error + UI retry
3. **Print edge case**: effective items = empty → ยังพิมพ์ได้ (total = 0)

---

## 📚 Key Documents

| Document | Path |
|----------|------|
| **PLAN.md** | [docs/04-features/sprint-4-adjustment/PLAN.md](04-features/sprint-4-adjustment/PLAN.md) |
| **ACCEPTANCE_CRITERIA.md** | [docs/04-features/sprint-4-adjustment/ACCEPTANCE_CRITERIA.md](04-features/sprint-4-adjustment/ACCEPTANCE_CRITERIA.md) |
| ADR-0002 | [docs/02-architecture/ADR/0002-reserved-stock-workflow.md](02-architecture/ADR/0002-reserved-stock-workflow.md) |
| DATABASE_SCHEMA | [docs/02-architecture/DATABASE_SCHEMA.md](02-architecture/DATABASE_SCHEMA.md) |
| ROADMAP | [docs/05-reference/ROADMAP.md](05-reference/ROADMAP.md) |

---

## ⚠️ Archived Documents

Old Sprint 4-5 plans moved to `docs/99-archived/`:
- `99-archived/sprint-4/PLAN.md` (Reserved Stock - deprecated)
- `99-archived/sprint-5/PLAN.md` (Reserved Stock - deprecated)

---

## 🚀 Start Command

```
Read docs/04-features/sprint-4-adjustment/PLAN.md and ACCEPTANCE_CRITERIA.md
then start Phase 0: Database Migration
```
