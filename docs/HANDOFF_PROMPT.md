# Handoff Prompt for AI Agent

**Current State:** Sprint 3C Complete! — Ready for Sprint 4  
**Last Updated:** 24 มกราคม 2569 @ 13:00  
**Version:** `main`

---

## ⚠️ CRITICAL: Read These First

1. `docs/01-constitution/RULES.md`
2. `docs/01-constitution/TECH_STACK.md`
3. `docs/01-constitution/LESSONS_LEARNED.md`
4. `docs/05-reference/SEMANTIC_GLOSSARY.md` — 🆕 **คำศัพท์มาตรฐาน**

> [!CAUTION]
> **MUST read `SEMANTIC_GLOSSARY.md` before editing any Billing documents!**
> - ห้ามใช้ "receipt" หมายถึง prepay summary
> - ต้องใช้ PrepaySummary / Receipt ให้ถูกต้อง

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
- Summary Sheet: DF as first item (no checkbox)

---

## 🎯 NEXT: Sprint 4 (Naming & Semantics Clean)

> [!IMPORTANT]
> Sprint 4 ไม่แตะ DB, ไม่แตะ logic  
> **Legacy payment behavior ยังคงเดิม!**

### Scope
- New routes: `/billing/documents/prepay/` และ `/receipt/`
- Rename: `receipt-view` → `billing-document-view`
- Semantic terms: PrepaySummary / Receipt
- UI Labels: "ใบสรุปค่าใช้จ่าย" / "ใบเสร็จรับเงิน"
- Grep check: กำจัด "receipt" ที่หมายถึง prepay

### Reference Documents
- [Sprint 4 PLAN.md](04-features/sprint-4/PLAN.md)
- [SEMANTIC_GLOSSARY.md](05-reference/SEMANTIC_GLOSSARY.md)

---

## 🔜 Sprint 5: Schema + Workflow

DB Migration และ workflow จะทำใน Sprint 5:
- [ADR-0002](02-architecture/ADR/0002-reserved-stock-workflow.md)
- [Sprint 5 PLAN.md](04-features/sprint-5/PLAN.md)

---

## 🛑 REMEMBER: Golden Rule

**NEVER start work without User approval.**
Ask: "ให้เริ่มทำ [Task] เลยไหมครับ?" and wait for confirmation.
