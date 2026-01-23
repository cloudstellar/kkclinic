# Handoff Prompt for AI Agent

**Current State:** Sprint 3B Complete! — Ready for Sprint 4
**Last Updated:** 24 มกราคม 2569 @ 23:20
**Version:** `main`

---

## ⚠️ CRITICAL: Read These First (In Order)

1. `docs/01-constitution/RULES.md` — AI workflow rules + User Confirmation requirement
2. `docs/01-constitution/TECH_STACK.md` — Authoritative tech stack
3. `docs/01-constitution/LESSONS_LEARNED.md` — Hard constraints from past failures
4. `docs/05-reference/GLOSSARY.md` — Term definitions (TN, Snapshot, etc.)

---

## ✅ Sprint 3B Completed

All milestones done:
- M1-M4: Database, Tokenizer, Dictionary, Engine
- M5-M5.5: UI 2-Pane, UX Improvements
- M6: Integration (dictionary_version 1.0)
- M7: Medicine Summary Sheet

---

## 🎯 NEXT: Sprint 4 Planning

**Focus:** UX Phase 2 + Workflow Revolution

Before starting, consult user for Sprint 4 priorities:

### UX Phase 2 (from 3A+)
- Real-time filter (debounce 300ms)
- Sortable tables
- TN Standardization (HN → TN)

### Workflow Revolution
- Reserved Stock Model
- Patient Statement (ใบสรุปค่าใช้จ่าย)
- Auto Calculator
- Payment Status (3 states)
- End of Day (EOD)

---

## 📁 Key Files (Sprint 3B)

| Component | File |
|-----------|------|
| Tokenizer | `src/lib/dosage/tokenizer.ts` |
| Dictionary | `src/lib/dosage/dictionary-v1.ts` |
| Engine | `src/lib/dosage/engine.ts` |
| Dosage Sheet | `src/components/prescription/dosage-instruction-sheet.tsx` |
| Summary Sheet | `src/components/prescription/medicine-summary-sheet.tsx` |
| Label Print | `src/app/(dashboard)/billing/receipt/[id]/labels/label-print-view.tsx` |

---

## 🛑 REMEMBER: Golden Rule

**NEVER start work without User approval.**
Ask: "ให้เริ่มทำ [Task] เลยไหมครับ?" and wait for confirmation.
