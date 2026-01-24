# Session Handoff: Sprint 5 Implementation

**Date:** 2025-01-25  
**Previous Session:** Sprint 4 Complete + Documentation

---

## ✅ What's Done

### Sprint 4 (Merged to main)
- Pre-payment adjustment (tick-off before payment)
- Post-payment adjustment (reduce/remove only)
- Stock restoration logic (effective items)
- Void = Admin/Doctor only
- Adjust button → dropdown menu

### Documentation
- ADR-0003: Role-Based Access Control
- Sprint 5 PLAN: Complete with all decisions

---

## 🚀 Sprint 5 Tasks (This Session)

### 1. Guard 3 ชั้น (45m)
- **Route:** `billing/page.tsx` → `if (staff) redirect('/frontdesk')`
- **Nav:** Hide `/billing` for staff
- **Default:** Staff login → `/frontdesk`

### 2. Create `/frontdesk` (2h)
- **File:** `app/(dashboard)/frontdesk/page.tsx`
- Card 1: Patient search + add
- Card 2: Tabs (รอสรุปเคส / สรุปเคสแล้ว)
- Badge count on tabs
- Void items: show with badge, disabled actions

### 3. Rx History MVP (1.5h)
- **File:** `prescriptions/[id]/page.tsx`
- Merge 3 sources:
  - `transaction.created_at` → สรุปเคส
  - `transaction_adjustments` → ปรับปรุง #N
  - `voided_at` → ยกเลิก
- Sort by timestamp

---

## 🔒 Locked Decisions

| Item | Decision |
|------|----------|
| Staff default | `/frontdesk` |
| Tab naming | รอสรุปเคส / สรุปเคสแล้ว |
| Void items | Show with badge, no actions |
| Rx History | MVP from existing data (no new table) |
| Timezone | Asia/Bangkok |

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `/docs/04-features/sprint-5/PLAN.md` | Full implementation plan |
| `/docs/02-architecture/ADR/0003-role-based-access-control.md` | RBAC decisions |
| `src/app/(dashboard)/billing/actions.ts` | Server actions (createAdjustment, voidTransaction) |
| `src/app/(dashboard)/billing/receipt/[id]/receipt-view.tsx` | Receipt with dropdown menu |

---

## 🎯 Sprint 5 Complete = Ready for UAT

## Sprint 6 = UI/UX Polish & Bug Fix
