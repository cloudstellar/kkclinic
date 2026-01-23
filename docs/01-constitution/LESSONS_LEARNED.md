# Lessons Learned (บทเรียนราคาแพง)

> ⚠️ **CRITICAL WARNINGS**: กฎเหล่านี้เกิดจากความผิดพลาดในอดีต ห้ามทำผิดซ้ำเด็ดขาด
> This file is a **CONSTITUTIONAL DOCUMENT**. All rules herein are **HARD CONSTRAINTS**.

## 1. Git & Version Control (Pain Level: MAX 💀)
- **CHECK BRANCH BEFORE PUSH**: **NEVER** Push to wrong branch!
    - **Mistake**: Pushing feature code to `main` or wrong branch causes messy merges.
    - **Rule**: **NEVER** work directly on `main`. Always checkout a feature branch before making any change.
    - **Fix**: Before `git push`, **MUST** run `git branch` to verify.

## 2. Printing & Layout
- **Margin Reset**: When doing Thermal Print, **MUST** set `@page { margin: 0 }` otherwise layout breaks.
- **Component Isolation**: Print Container **MUST** be isolated from main UI (use `.print-container` and hide body).

## 3. Database & Migration
- **Backfill Strategy**: **NEVER** leave new columns as NULL if old logic breaks.
- **Trigger Recursion**: Be careful of triggers updating their own table (infinite loop).

## 4. UI/UX
- **Phone Input**: **MUST** use `type="tel"` and `inputMode="numeric"`.
- **Autocomplete**: **MUST** provide correct `autoComplete` attributes (e.g., `tel`, `name`).

## 5. Development Flow
- **DoD First**: **NEVER** start coding without a clear Definition of Done.
- **User Confirmation**: **NEVER** assume. **MUST** ask User before starting new tasks.

## 6. Server / Client Boundary (Pain Level: HIGH ⚠️)
- **No Sensitive Logic on Client**: **NEVER** write logic involving permission, pricing, stock, or medical data on Client Components.
- **Rule**: Logic that mutates data **MUST** reside in Server Actions or Route Handlers only.

## 7. Supabase & RLS (Pain Level: HIGH ⚠️)
- **Default Deny**: Assume RLS blocks everything unless explicitly allowed.
- **Mistake**: Forgot to enable RLS or add policy, exposing data.
- **Rule**: Always verify RLS policies when creating tables.

## 8. Spec Drift (Pain Level: MEDIUM 😤)
- **Mistake**: Code deviated from SPEC because of on-the-fly changes.
- **Rule**: If behavior changes, **MUST** update SPEC first.

## 9. Quick Fix Trap
- **Mistake**: Temporary fix without considering system flow.
- **Rule**: If a workaround is needed, **MUST** add a comment explanation and a clear `TODO`.

## 10. Type Duplication (Pain Level: MEDIUM 😤)
- **Mistake**: Same type (e.g., `Prescription`) defined in multiple component files.
- **Problem**: When adding new fields (e.g., `df`, `df_note`), **MUST** update ALL files.
- **Example (Sprint 3C)**: `Prescription` type was in `payment-button.tsx`, `payment-modal.tsx`, `label-print-view.tsx`.
- **Rule**: Prefer importing from central `types/*.ts` files. If local type is needed, keep minimal and extend from central type.

## 11. Lint Neglect (Pain Level: HIGH ⚠️)
- **Mistake**: Not running `npm run lint` during development, only discovering errors after many commits.
- **Problem**: Accumulated lint errors become harder to fix; need to trace back multiple changes.
- **Rule**: **MUST** run `npm run lint` before every commit. Fix errors immediately.
- **Example (Sprint 3C)**: setState in useEffect error discovered late, required refactoring.

---

## 📚 See also
- [TECH_STACK.md](TECH_STACK.md)
- [RULES.md](RULES.md)
