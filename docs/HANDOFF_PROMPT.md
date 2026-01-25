# Handoff Prompt for AI Agent

**Current State:** Sprint 5 Complete! — Ready for Sprint 6
**Last Updated:** 25 มกราคม 2569 @ 17:00
**Version:** `v0.7.0-rc1`

---

## ⚠️ CRITICAL: Read These First

1. `docs/01-constitution/RULES.md`
2. `docs/01-constitution/TECH_STACK.md`
3. `docs/05-reference/SEMANTIC_GLOSSARY.md`
4. `src/lib/clinic-config.ts` (Single Source of Truth)

---

## ✅ Sprint 5 — Complete!

### Features in v0.7.0-rc1:
1. **Modules**:
   - `/frontdesk` (Staff Dashboard)
   - `/dispensing` (Doctor History View)
   - `/prescriptions/[id]/rx-history` (Timeline)
2. **UX Improvements**:
   - **Print Layout**: Fixed A6 receipt & 100x75mm labels (Chrome/Safari compatible)
   - **Close Transaction**: "ปิดงาน" workflow
   - **Smart Empty State**: "ดูย้อนหลัง" suggestion at night (≥21:00)
3. **Architecture**:
   - **RBAC**: Guard 3 layers (Route/Nav/Server)
   - **Timezone**: Centralized in `clinic-config.ts`

---

## 🎯 NEXT: Sprint 6 — Reports & Dashboard

> **Goal:** High-level insights for clinic owners.

### Candidates for Implementation:
1. **Daily Revenue Report** (Cash vs Transfer)
2. **Patient Statistics** (New vs Returning)
3. **Inventory Alerts** (Low stock dashboard)

---

## 📚 Key Documents

| Document | Path |
|----------|------|
| **Sprint 5 Plan** | [docs/04-features/sprint-5/PLAN.md](04-features/sprint-5/PLAN.md) |
| **ADR-0003** | [docs/02-architecture/ADR/0003-role-based-access-control.md](02-architecture/ADR/0003-role-based-access-control.md) |
| **Clinic Config** | `src/lib/clinic-config.ts` |

---

## 🛑 REMEMBER: Golden Rule

**NEVER start work without User approval.**
Ask: "ให้เริ่มทำ [Task] เลยไหมครับ?" and wait for confirmation.
