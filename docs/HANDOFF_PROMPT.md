# Handoff Prompt for AI Agent

**Current State:** Sprint 5+ In Progress — Doctor Workspace
**Last Updated:** 25 มกราคม 2569 @ 22:17
**Version:** `v0.7.0-rc1`

---

## ⚠️ CRITICAL: Read These First

1. `docs/01-constitution/RULES.md`
2. `docs/04-features/sprint-5-plus/PLAN.md` ← **START HERE**
3. `docs/02-architecture/ADR/0003-role-based-access-control.md`
4. `src/lib/clinic-config.ts`

---

## 🎯 CURRENT: Sprint 5+ — Doctor Workspace

**Goal:** Transform `/prescriptions` to Doctor-first Workspace

| Change | Detail |
|--------|--------|
| Default | วันนี้ + ของฉัน |
| Search | ปลด constraint → all-time |
| Hide | ยอดเงิน column |
| Status | ยังไม่สรุปเคส / สรุปเคสแล้ว |

**Implementation:** See `PLAN.md` for code details.

---

## ✅ Sprint 5 — Complete!

- `/frontdesk` (Staff Dashboard)
- `/dispensing` (Doctor History)
- Print Layout fixes
- RBAC + Timezone

---

## 🛑 REMEMBER: Golden Rule

**NEVER start work without User approval.**
Ask: "ให้เริ่มทำ [Task] เลยไหมครับ?" and wait for confirmation.
