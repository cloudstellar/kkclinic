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
| Sprint 3C | ✅ Done | Doctor Fee (DF) Feature | `v0.6.0-sprint3-complete` |
| ~~Sprint 4~~ | ❌ Archived | ~~Naming & Semantics~~ | Replaced |
| ~~Sprint 5~~ | ❌ Archived | ~~Reserved Stock Workflow~~ | Replaced |
| **Sprint 4 (New)** | 🔲 Next | **Pre-Payment Adjustment + Transaction Adjustments** | - |
| Sprint 5 | 🔲 Future | UX Phase 2 + Reporting | - |

---

## ✅ Sprint 3C — Complete! (24 ม.ค. 2569)

### Deliverables
- **DB**: `df`, `df_note` columns in `prescriptions` table
- **Prescription Form**: DF input + Note Presets
- **Receipt**: DF shown first with simplified layout
- **Summary Sheet**: DF as first item (no checkbox)

---

## 🎯 Sprint 4 (New) — Pre-Payment Adjustment

> [!IMPORTANT]
> แทน Sprint 4-5 เดิม (Reserved Stock Workflow)  
> ไม่รื้อ flow เดิม แค่เพิ่ม feature

### Scope

| Phase | Description |
|-------|-------------|
| Phase 0 | DB: `transaction_adjustments` table + RPC |
| Phase 1 | Pre-payment tick-off (ติ๊กก่อนชำระ) |
| Phase 2 | Adjustment UI (ปุ่ม "ปรับปรุงรายการ") |
| Phase 3 | RPC integration (atomic stock restore) |
| Phase 4 | Print effective items |

### Key Features
- ติ๊ก "ไม่เอา" ก่อนชำระ → ลด receipt items
- ปุ่ม "ปรับปรุงรายการ" หลังชำระ → ลด/ติ๊กออก → restore stock
- Adjustment record (ไม่แก้ทับ original)
- Print แสดงยอดสุทธิ + "ฉบับปรับปรุง"

> See [ADR-0002](../02-architecture/ADR/0002-reserved-stock-workflow.md) for details

---

## 🎯 Sprint 5 — UX Phase 2

- 🔲 Real-time filter (debounce 300ms)
- 🔲 Sortable tables
- 🔲 Full Reporting (EOD history, top-selling)
- 🔲 Patient Statement
- 🔲 Auto Calculator

---

## 🔒 Key Decisions (Locked)

| Decision | Sprint | Choice |
|----------|--------|--------|
| Smart Dosage snapshot | 3B | Option A: Single Snapshot |
| Dictionary version | 3B | `1.0` (engine on) |
| Doctor Fee location | 3C | `prescriptions` table (per-visit) |
| **Pre-Payment Adjustment** | 4 (New) | ADR-0002 (replaces Reserved Stock) |

---

## 🔗 Related Documents

- [ADR-0002: Pre-Payment Adjustment](../02-architecture/ADR/0002-reserved-stock-workflow.md)
- [SEMANTIC_GLOSSARY.md](SEMANTIC_GLOSSARY.md)
- [HANDOFF_PROMPT.md](../HANDOFF_PROMPT.md)
