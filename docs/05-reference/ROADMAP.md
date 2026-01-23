# KKClinic Roadmap

> อัปเดตล่าสุด: 24 มกราคม 2569

---

## 🎯 Project Vision

ระบบบริหารจัดการคลินิกตา ครอบคลุมการจัดการผู้ป่วย, ใบสั่งยา, สินค้าคงคลัง, และการเงิน

---

## 📊 Sprint Overview

| Sprint | Status | Focus | Tag |
|--------|--------|-------|-----|
| Sprint 1 | ✅ Done | Core foundation: Patients, Inventory, Prescriptions | `v0.1.0` - `v0.3.0` |
| Sprint 2A | ✅ Done | Billing & Payment, Label Printing, Void Transactions | `v0.4.0-sprint2a` |
| Sprint 2B | ✅ Done | DosageSheet UX Refactor | `v0.5.0-sprint2b-dosagesheet` |
| Sprint 2C | ✅ Done | Workflow Documentation Setup | `v0.5.1-workflow-docs` |
| Sprint 3A | ✅ Done | TN, Patient Registry, Prescription, Label | `v0.5.3-sprint3a-ready` |
| Sprint 3B | ✅ Done | Smart Dosage System (Engine, UI, Summary Sheet) | - |
| **Sprint 3C** | 🚧 **In Progress** | Doctor Fee (DF) Feature & UI Fixes | - |
| Sprint 4 | 🔲 Pending | UX Phase 2 + Workflow Revolution | - |

---

## 🚧 Sprint 3C — Doctor Fee & UI Fixes (Current)

### Goal
เพิ่มค่าธรรมเนียมแพทย์ และปรับปรุง UI ตาม Feedback

### Progress

| Task | Status | Note |
|------|--------|------|
| **Core DF Feature** | ✅ Done | DB, Form, Receipt, Summary Sheet Logic |
| **UI Fixes** | 🚧 WIP | Presets & Receipt done |

### Pending UI Fixes (User Feedback)
- [ ] Show DF in prescription view page (`prescriptions/[id]`)
- [ ] Show DF in dispensing/payment page (`dispensing/[id]`)
- [ ] Remove checkmark from DF line in Summary Sheet

---

## 🎯 Sprint 4 — Next (UX Phase 2 + Workflow)

### UX Phase 2
- 🔲 Real-time filter (debounce 300ms, `?q=`)
- 🔲 Sortable tables (`?sort=&order=`)
- 🔲 TN Standardization (HN → TN ทั้งระบบ)

### Workflow Revolution
- 🔲 Reserved Stock Model
- 🔲 ใบสรุปค่าใช้จ่าย (Patient Statement)
- 🔲 Auto Calculator
- 🔲 Payment Status (3 สถานะ)
- 🔲 End of Day (EOD)

---

## 🔒 Key Decisions (Locked)

| Decision | Sprint | Choice |
|----------|--------|--------|
| Doctor Fee location | 3C | `prescriptions` table (per-visit) |
| Receipt Order | 3C | DF first -> Medicines |
| Summary Sheet DF | 3C | First item (no checkbox) |

---

## 🔗 Related Documents

- [HANDOFF_PROMPT.md](../HANDOFF_PROMPT.md) - Next session guide
- [NEXT_SESSION.md](../NEXT_SESSION.md) - Detailed session notes
