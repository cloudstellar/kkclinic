# KKClinic Roadmap

> อัปเดตล่าสุด: 2026-01-19

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
| Sprint 2C | 🔲 Planned | Workflow Documentation Setup | - |
| Sprint 3 | 🔲 Planned | Low stock alerts, Barcode scanning, Reports | - |

---

## 🔒 Decision Lock (Current)

| Feature | Sprint | Status | ADR |
|---------|--------|--------|-----|
| DosageSheet bottom sheet | 2B | ✅ Shipped | [ADR-0001](ADR/0001-dosage-sheet-ux.md) |
| Recent instructions (localStorage) | 2B | ✅ Shipped | [ADR-0001](ADR/0001-dosage-sheet-ux.md) |
| Pinned instructions | - | ❌ Not planned | - |
| Responsive card layout | 3 | 🔲 Planned | - |

---

## 📅 Sprint Details

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

### Sprint 3 - Inventory & Reports (Planned)
- 🔲 Low stock alerts and thresholds
- 🔲 Barcode scanning for restock/dispense
- 🔲 Monthly/weekly reports
- 🔲 Export to Excel

---

## 🔗 Related Documents

- [PRD](PRD.md) - Product Requirements Document
- [Database Schema](DATABASE_SCHEMA.md) - Complete schema documentation
- [Implementation Plan](IMPLEMENTATION_PLAN.md) - Technical implementation details
- [Knowledge Base](KNOWLEDGE_BASE.md) - Clinic domain knowledge
- [Workflow](WORKFLOW.md) - Definition of Ready & development workflow
- [AI Rules](AI_RULES.md) - Antigravity prompt policy
