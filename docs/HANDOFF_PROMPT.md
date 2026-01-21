# Handoff Prompt for AI Agent

**Current State:** Sprint 3B M1 Ready to Start
**Last Updated:** 22 มกราคม 2569 @ 03:05
**Version:** `feature/sprint-3b` — Plan finalized with 8 critical fixes

---

## ⚠️ CRITICAL: Read These First (In Order)

1. `docs/01-constitution/RULES.md` — AI workflow rules + User Confirmation requirement
2. `docs/01-constitution/TECH_STACK.md` — Authoritative tech stack
3. `docs/01-constitution/LESSONS_LEARNED.md` — Hard constraints from past failures
4. `docs/05-reference/GLOSSARY.md` — Term definitions (TN, Snapshot, etc.)

---

## 🎯 NEXT ACTION: Start Sprint 3B M1

**Task:** Database Migration + Types

**What to do:**
1. Run migration on Supabase to add columns to `prescription_items`:
   - `dosage_original` (text, nullable)
   - `dictionary_version` (text, nullable)
2. Add DB CHECK constraint for data integrity (see PLAN.md)
3. Backfill existing data: copy `dosage_instruction` → `dosage_original`, set `dictionary_version = 'legacy'`
4. Update `src/types/prescriptions.ts` with new fields
5. Run `npm run typecheck` to verify

**Key Documents:**
- `docs/04-features/sprint-3b-dosage/SPEC.md` — Full specification
- `docs/04-features/sprint-3b-dosage/PLAN.md` — Implementation plan with DoD (JUST UPDATED)

**Done When:**
- ✅ Migration applied successfully
- ✅ CHECK constraint active
- ✅ `npm run typecheck` passes

---

## 📊 Sprint 3B Milestones

| M | Task | Status |
|---|------|--------|
| **M1** | Database Migration + Types | 🟡 **START HERE** |
| M2 | Tokenizer Implementation | 🔲 Pending |
| M3 | Dictionary V1 (Frozen) | 🔲 Pending |
| M4 | Translation Engine | 🔲 Pending |
| M5 | UI 2-Pane Preview | 🔲 Pending |
| M6 | Integration (Save/Load) | 🔲 Pending |
| M7 | Medicine Summary Sheet | 🔲 Pending |

---

## ⚡ Decision Lock (Important for M1)

| Decision | Choice |
|----------|--------|
| Patient ID | **TN only** (DB column still `hn`) |
| `dictionary_version` values | `NULL` (no instruction), `'legacy'`, `'1.0'` |
| Empty dosage rule | Both fields NULL + version NULL |
| Constraint enforcement | **DB-level CHECK** + Server-side assertion |
| Snapshot Policy | Frozen at save time, never re-translate |

---

## 🔧 Recent Changes (This Session)

1. ✅ Restructured `docs/` folder (constitution, architecture, features, reference)
2. ✅ Created `TECH_STACK.md`, `LESSONS_LEARNED.md`, `GLOSSARY.md`
3. ✅ Fixed all broken links and outdated content
4. ✅ Updated PLAN.md with 8 critical fixes:
   - Unknown token preservation (no case change)
   - Dictionary version rule (NULL/legacy/1.0 clear)
   - DB-level CHECK constraint added
   - Tokenizer supports joined patterns (x7d)
   - Highlight in Preview, not Editor
   - Fail = exception only, garbage = OK
   - Added test cases (case-insensitive, whitespace)
   - Fixed SPEC filename reference

---

## 📁 Key Files for M1

| File | Purpose |
|------|---------|
| `docs/04-features/sprint-3b-dosage/PLAN.md` | Full plan with M1 details |
| `src/types/prescriptions.ts` | Update with new fields |
| Supabase Dashboard | Run migration SQL |

---

## 🛑 REMEMBER: Golden Rule

**NEVER start work without User approval.**
Ask: "ให้เริ่มทำ [Task] เลยไหมครับ?" and wait for confirmation.
