# Handoff Prompt for AI Agent

**Current State:** Sprint 3B M6 Ready to Start
**Last Updated:** 24 มกราคม 2569 @ 04:46
**Version:** `main` — M5.5 Completed

---

## ⚠️ CRITICAL: Read These First (In Order)

1. `docs/01-constitution/RULES.md` — AI workflow rules + User Confirmation requirement
2. `docs/01-constitution/TECH_STACK.md` — Authoritative tech stack
3. `docs/01-constitution/LESSONS_LEARNED.md` — Hard constraints from past failures
4. `docs/05-reference/GLOSSARY.md` — Term definitions (TN, Snapshot, etc.)

---

## 🎯 NEXT ACTION: Start Sprint 3B M6

**Task:** Integration (Server Actions)

**What to do:**
1. Update `createPrescription` in `actions.ts`:
   - Change `dictionary_version: 'legacy'` → `'1.0'`
   - Accept Doctor Override (use client snapshot if different from server translation)
   - Validation: v1.0 requires all fields
2. Verify save/reload flow works correctly

**Key Documents:**
- `docs/04-features/sprint-3b-dosage/PLAN.md` — Full plan with DoD
- `docs/NEXT_SESSION.md` — Latest session notes

**Done When:**
- ✅ Save prescription → reload → all dosage fields persist
- ✅ Doctor Override saves correctly

---

## 📊 Sprint 3B Milestones

| M | Task | Status |
|---|------|--------|
| M1 | Database Migration + Types | ✅ Done |
| M2 | Tokenizer Implementation | ✅ Done |
| M3 | Dictionary V1 (Frozen) | ✅ Done |
| M4 | Translation Engine | ✅ Done |
| M5 | UI 2-Pane Preview | ✅ Done |
| **M5.5** | UX Improvements | ✅ Done |
| **M6** | Integration (Save/Load) | 🟡 **START HERE** |
| M7 | Medicine Summary Sheet | 🔲 Pending |

---

## 🛑 REMEMBER: Golden Rule

**NEVER start work without User approval.**
Ask: "ให้เริ่มทำ [Task] เลยไหมครับ?" and wait for confirmation.
