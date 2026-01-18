# Handoff Prompt for AI Agent

**Current State:**
We have just completed **Sprint 2A** for the KKClinic Billing & Inventory System. The system is stable, and all core features for this sprint are implemented and verified.

**Recently Completed Features (Sprint 2A):**
1. **Void Transaction:** Soft-delete (`status='voided'`), audit logging, and strict inventory logic (void != restore).
2. **Idempotency:** Payment processing uses `request_id` preventing double-charging.
3. **Label Printing:** A6 Landscape page (`/billing/receipt/[id]/labels`) with clinic config.
4. **Current Dosage UX:**
   - `DosageInput` with basic preset chips (Oral/Eye/Topical).
   - Character counter (80 chars).
   - Saved separately from `note`.
5. **Medicine Search:**
   - Default: "Frequently Used Medicines" (RPC).
   - Limit: 20/30 items.

**Key Documentation:**
- `docs/SPRINT_2A.md`: Detailed feature breakdown.
- `src/lib/clinic-config.ts`: Config/settings.
- `src/components/ui/dosage-input.tsx`: Current dosage component.

---

## 🚀 Sprint 2B: UX/UI Refinement (Critical for iPad)

The next phase requires significant UX improvements for iPad/Touch usability. Please follow these **User-Approved Patterns**:

### 1. Dosage Input Pattern (Pattern A: Summary + Sheet)
**Problem:** Small textareas in table rows are hard to use on iPad.
**Solution:**
- **In Table Row:** Show **Read-only Summary** (line-clamp 2) + **"Edit" Button**.
- **Action:** Clicking "Edit" opens a **Bottom Sheet / Drawer** (Shadcn Sheet).
- **Sheet Content:**
  - Large Textarea (Auto-grow).
  - **Preset Chips** (Touch-friendly, min 44px target).
  - **Save** / **Cancel** buttons (Large).
  - (Optional) Label Preview.

### 2. Responsive Layout (Pattern C: Table vs Card)
- **Desktop:** Keep standard Table layout.
- **Mobile/iPad:** Switch row to **Card Layout**.
  - Medicine Name (Top)
  - Qty / Dosage / Price (Stacked)
  - Full-width "Method" button.

### 3. Smart Features (Next Steps)
- **Recent Presets:** Store "Last 5 used dosages" per doctor (LocalStorage or DB).
- **Copy Function:** "Copy dosage to all items" button.
- **Refined Presets:** (From Eye Clinic specific list)
  - "หลังอาหาร เช้า-กลางวัน-เย็น ครั้งละ 1 เม็ด"
  - "หยอดตา ครั้งละ 1 หยด วันละ 4 ครั้ง"
  - "ทาบางๆ เช้า-เย็น"

---

**Codebase Context:**
- Tech Stack: Next.js 14, Supabase, Tailwind, Shadcn UI.
- Database: see `docs/DATABASE_SCHEMA.md`.

**Action Item:** Start Sprint 2B by refactoring `DosageInput` into a **Sheet-based component** (`DosageInstructionSheet`) to solve the "small input" problem once and for all.
