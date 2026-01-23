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
| **Sprint 3C** | 🚀 **In Progress** | Doctor Fee (DF) Enhancement | - |
| Sprint 4 | 🔲 Pending | UX Phase 2 + Workflow Revolution | - |

---

## 🚀 Sprint 3C — Doctor Fee (In Progress)

### Goal
เพิ่มค่าธรรมเนียมแพทย์ (Doctor Fee) ในใบสั่งยา

### Scope
| Phase | Task | Status |
|-------|------|--------|
| 1 | DB Migration (`df`, `df_note` in prescriptions) | 🔲 |
| 2 | Prescription Form: DF input + note | 🔲 |
| 3 | Payment: Show DF in breakdown | 🔲 |
| 3 | Receipt: Show DF line item | 🔲 |

### ไม่ขัดกับแผนใหญ่เพราะ:
- ใช้ `prescriptions` table ที่มีอยู่ (ไม่สร้าง table ใหม่)
- เป็น enhancement ไม่ใช่ breaking change
- รองรับ Sprint 4 (Billing summary, EOD) ได้เลย

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
| Smart Dosage snapshot | 3B | Option A: Single Snapshot |
| Dictionary version | 3B | `1.0` (engine on) |
| Summary Sheet | 3B | 6 items/page, dosage_original |
| **Doctor Fee location** | 3C | `prescriptions` table (per-visit) |

---

## 📅 Recent Completion

### Sprint 3B - Smart Dosage System ✅
- ✅ Tokenizer, Dictionary V1, Translation Engine
- ✅ 2-Pane UI with Doctor Override
- ✅ UX Improvements (nationality defaults, shorthand history)
- ✅ Integration with dictionary_version 1.0
- ✅ Medicine Summary Sheet (Internal Use)

---

## 🔗 Related Documents

- [HANDOFF_PROMPT.md](../HANDOFF_PROMPT.md) - Next session guide
- [Sprint 3B PLAN](../04-features/sprint-3b-dosage/PLAN.md) - Smart Dosage spec
