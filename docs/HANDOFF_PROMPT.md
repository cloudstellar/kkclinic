# Handoff Prompt for AI Agent

**Current State:**
Sprint 2B (DosageSheet UX Refactor) is complete. Workflow documentation has been set up.

**Last Updated:** 19 มกราคม 2569  
**Version:** v0.5.0-sprint2b-dosagesheet

---

## ⚠️ Before You Start

**อ่านเอกสารสำคัญก่อนเสมอ:**
1. [docs/AI_RULES.md](AI_RULES.md) - กฎการทำงานกับ AI
2. [docs/ROADMAP.md](ROADMAP.md) - Sprint overview และ decision locks
3. [docs/WORKFLOW.md](WORKFLOW.md) - Definition of Ready (DoR)

---

## ✅ Recently Completed

### Sprint 2B - DosageSheet UX Refactor
- ✅ `DosageInstructionSheet` (bottom sheet component)
- ✅ `DosageDisplay` (2-line clamp, empty badge)
- ✅ `useRecentInstructions` hook (localStorage)
- ✅ Copy from previous item
- ✅ Length badge + keyboard shortcuts
- **ADR:** [docs/ADR/0001-dosage-sheet-ux.md](ADR/0001-dosage-sheet-ux.md)

### Sprint 2A - Billing & Dispensing
- ✅ Payment modal with cash calculation
- ✅ Void transactions with stock reversal
- ✅ Label printing (A6 landscape, 4 per row)
- ✅ Daily billing summary

---

## 🔲 Next Steps (Sprint 3)

- Low stock alerts and thresholds
- Barcode scanning for restock/dispense
- Responsive card layout for mobile
- Monthly/weekly reports

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `docs/ROADMAP.md` | Sprint overview, decision locks |
| `docs/WORKFLOW.md` | Definition of Ready, dev flow |
| `docs/AI_RULES.md` | AI prompt policy |
| `docs/ADR/` | Architecture Decision Records |
| `src/components/prescription/dosage-instruction-sheet.tsx` | Bottom sheet for dosage |
| `src/hooks/use-recent-instructions.ts` | Recent dosages hook |
| `src/lib/clinic-config.ts` | Clinic settings |

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** Supabase (PostgreSQL)
- **UI:** Tailwind CSS, Shadcn UI
- **Auth:** Supabase Auth

---

## 📋 Quick Start Checklist

ก่อนเริ่มงานใหม่:
- [ ] อ่าน `docs/ROADMAP.md`
- [ ] อ่าน `docs/AI_RULES.md`
- [ ] สร้าง implementation plan พร้อม DoR
- [ ] รอ user approve ก่อนเริ่มโค้ด
- [ ] ถ้ามี design decision ใหม่ → สร้าง ADR
- [ ] หลังเสร็จ → อัปเดตเอกสาร + tag
