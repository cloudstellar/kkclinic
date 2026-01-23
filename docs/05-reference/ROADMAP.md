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
| **Sprint 3B** | ✅ **Done** | Smart Dosage System (Engine, UI, Summary Sheet) | - |
| Sprint 4 | 🔲 Pending | UX Phase 2 + Workflow Revolution | - |

---

## ✅ Sprint 3B — Completed (24 ม.ค. 2569)

### Milestones Completed

| M | Task | Status |
|---|------|--------|
| M1 | Database Migration + Types | ✅ |
| M2 | Tokenizer Implementation | ✅ |
| M3 | Dictionary V1 (Frozen) | ✅ |
| M4 | Translation Engine | ✅ |
| M5 | UI 2-Pane Preview | ✅ |
| M5.5 | UX Improvements (Smart defaults) | ✅ |
| M6 | Integration (dictionary_version 1.0) | ✅ |
| M7 | Medicine Summary Sheet | ✅ |

### Key Deliverables

- **Smart Dosage System**: Shorthand → Thai/English translation
- **Doctor Override**: Silent feedback, preserve manual edits
- **Medicine Summary Sheet**: Thermal 10×7.5cm, 6 items/page, Internal Use
- **Shorthand History**: Per-user localStorage with v2 storage

---

## 🎯 Sprint 4 — Next (UX Phase 2 + Workflow)

### UX Phase 2
- 🔲 Real-time filter (debounce 300ms, `?q=`)
- 🔲 Sortable tables (`?sort=&order=`)
- 🔲 Nav highlight (`?from=billing`)
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
| DosageSheet bottom sheet | 2B | ✅ Shipped |
| Sprint 3 approach | 3 | **Option B** (แบ่ง 3A + 3B) |
| TN format | 3A | `TN` + 6 หลัก กรอกเอง |
| Label size | 3A | 10×7.5 cm (Thermal) |
| Smart Dosage snapshot | 3B | Option A: Single Snapshot |
| Dictionary version | 3B | `1.0` (engine on) |
| Summary Sheet | 3B | 6 items/page, dosage_original |

---

## 📅 Sprint History

### Sprint 1 - Core Foundation
- ✅ Patient management (CRUD, search, drug allergies)
- ✅ Inventory management (medicines, stock tracking)
- ✅ Prescription creation and viewing
- ✅ Authentication with Supabase

### Sprint 2A - Billing & Dispensing
- ✅ Payment modal with cash calculation
- ✅ Receipt generation
- ✅ Label printing (4 labels per row)
- ✅ Void transactions with stock reversal
- ✅ Daily billing summary

### Sprint 2B - DosageSheet UX
- ✅ Bottom sheet for dosage input
- ✅ Recent/Preset chips (replace mode)
- ✅ Copy from previous item
- ✅ Character/line counter with badge
- ✅ Keyboard shortcuts (Cmd+Enter, Esc)

### Sprint 3B - Smart Dosage System
- ✅ Tokenizer, Dictionary V1, Translation Engine
- ✅ 2-Pane UI with Doctor Override
- ✅ UX Improvements (nationality defaults, shorthand history)
- ✅ Integration with dictionary_version 1.0
- ✅ Medicine Summary Sheet (Internal Use)

---

## 🔗 Related Documents

- [HANDOFF_PROMPT.md](../HANDOFF_PROMPT.md) - Next session guide
- [Sprint 3B PLAN](../04-features/sprint-3b-dosage/PLAN.md) - Detailed spec
