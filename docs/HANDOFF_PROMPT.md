# Handoff Prompt for AI Agent

**Current State:** Sprint 3C — Doctor Fee Implementation
**Last Updated:** 24 มกราคม 2569 @ 23:35
**Version:** `main`

---

## ⚠️ CRITICAL: Read These First (In Order)

1. `docs/01-constitution/RULES.md` — AI workflow rules + User Confirmation requirement
2. `docs/01-constitution/TECH_STACK.md` — Authoritative tech stack
3. `docs/01-constitution/LESSONS_LEARNED.md` — Hard constraints from past failures
4. `docs/05-reference/GLOSSARY.md` — Term definitions (TN, Snapshot, etc.)

---

## 🎯 CURRENT: Sprint 3C — Doctor Fee

### Scope
เพิ่มค่าธรรมเนียมแพทย์ (Doctor Fee) ในใบสั่งยา

### Tasks
1. **DB Migration**: Add `df`, `df_note` to `prescriptions` table
2. **Prescription Form**: Input field for DF + note
3. **Payment Page**: Show DF in price breakdown
4. **Receipt Print**: Show DF as line item

### Files to Modify
| File | Change |
|------|--------|
| DB (Supabase) | Add columns to prescriptions |
| `types/prescriptions.ts` | Add df, df_note types |
| `prescriptions/actions.ts` | Accept DF in createPrescription |
| `prescriptions/new/page.tsx` | Add DF input UI |
| `billing/receipt/[id]/page.tsx` | Show DF in receipt |

---

## ✅ Sprint 3B Completed

All milestones done:
- M1-M4: Database, Tokenizer, Dictionary, Engine
- M5-M5.5: UI 2-Pane, UX Improvements
- M6: Integration (dictionary_version 1.0)
- M7: Medicine Summary Sheet

---

## 🛑 REMEMBER: Golden Rule

**NEVER start work without User approval.**
Ask: "ให้เริ่มทำ [Task] เลยไหมครับ?" and wait for confirmation.
