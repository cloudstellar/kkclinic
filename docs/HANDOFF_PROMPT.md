# Handoff Prompt for AI Agent

**Current State:** Sprint 3C Complete! — Ready for Sprint 4 (New)  
**Last Updated:** 24 มกราคม 2569 @ 21:52  
**Version:** `main`

---

## ⚠️ CRITICAL: Read These First

1. `docs/01-constitution/RULES.md`
2. `docs/01-constitution/TECH_STACK.md`
3. `docs/01-constitution/LESSONS_LEARNED.md`
4. `docs/05-reference/SEMANTIC_GLOSSARY.md`

---

## ✅ Sprint 3B & 3C — Complete!

### Sprint 3B: Smart Dosage System
- Tokenizer, Dictionary V1, Translation Engine
- 2-Pane UI with Doctor Override
- Medicine Summary Sheet (Internal Use)

### Sprint 3C: Doctor Fee
- DB: `df`, `df_note` in `prescriptions`
- Form: DF input + Presets
- All views show DF breakdown

---

## 🎯 NEXT: Sprint 4 (New) — Pre-Payment Adjustment

> [!IMPORTANT]
> **แทน Sprint 4-5 เดิม** (Reserved Stock Workflow ถูก archived)
> ไม่รื้อ flow เดิม — Backward compatible

### Key Concepts

| Term | Definition |
|------|------------|
| **Base Items** | `transaction_items` ณ ตอนชำระ (immutable) |
| **Adjustment** | ลด/ติ๊กออกหลังชำระ (ไม่แก้ทับ) |
| **Effective Items** | base_qty − sum(qty_reduced) |

### Phases

| Phase | Task | Status |
|-------|------|--------|
| 0 | DB: table + RPC | 🔲 **Next** |
| 1 | Pre-payment tick-off | 🔲 |
| 2 | Adjustment UI | 🔲 |
| 3 | RPC integration | 🔲 |
| 4 | Print effective items | 🔲 |

### Reference Documents
- [PLAN.md](04-features/sprint-4-adjustment/PLAN.md)
- [ACCEPTANCE_CRITERIA.md](04-features/sprint-4-adjustment/ACCEPTANCE_CRITERIA.md)
- [ADR-0002](02-architecture/ADR/0002-reserved-stock-workflow.md)

---

## ⚠️ Archived Documents

Old Sprint 4-5 plans moved to `docs/99-archived/`:
- `99-archived/sprint-4/PLAN.md` (Naming & Semantics - deprecated)
- `99-archived/sprint-5/PLAN.md` (Reserved Stock - deprecated)

---

## 🛑 REMEMBER: Golden Rule

**NEVER start work without User approval.**
Ask: "ให้เริ่มทำ [Task] เลยไหมครับ?" and wait for confirmation.
