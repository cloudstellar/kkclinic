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
| **Sprint 4** | 🔲 Pending | **Naming & Semantics Clean** (no DB) | - |
| Sprint 5 | 🔲 Future | Schema + Workflow Revolution | - |
| Sprint 6 | 🔲 Future | UX Phase 2 + Reporting | - |

---

## ✅ Sprint 3C — Complete! (24 ม.ค. 2569)

### Deliverables
- **DB**: `df`, `df_note` columns in `prescriptions` table
- **Prescription Form**: DF input + Note Presets (ตรวจตา, ลอกดูตา, ตรวจประเมิน)
- **View Prescription**: Shows DF breakdown before total
- **Payment Modal**: Shows DF as first item
- **Receipt**: DF shown first with simplified layout
- **Summary Sheet**: DF as first item (no checkbox)

---

## 🎯 Sprint 4 — Next (Naming & Semantics)

> [!IMPORTANT]
> Sprint 4 ไม่แตะ DB schema, ไม่แก้ logic  
> Legacy payment behavior ยังคงเดิม (deduct stock immediately)

### Scope
- 🔲 New routes: `/billing/documents/prepay/` และ `/receipt/`
- 🔲 Rename: `receipt-view` → `billing-document-view`
- 🔲 Semantic terms: PrepaySummary / Receipt
- 🔲 SEMANTIC_GLOSSARY.md
- 🔲 Grep check: กำจัด "receipt" ที่หมายถึง prepay
- 🔲 UI Labels: "ใบสรุปค่าใช้จ่าย" / "ใบเสร็จรับเงิน"

---

## 🎯 Sprint 5 — Schema + Workflow Revolution

- 🔲 **M1**: DB Migration (status, is_dispensed, reserved_qty)
- 🔲 **M2**: Stock Management + Guardrails
- 🔲 **M2.5**: E2E Test (no UI)
- 🔲 **M3**: Staff Confirmation UI + Status Flow
- 🔲 **M4**: Minimal Reporting (optional)

> See [ADR-0002](../02-architecture/ADR/0002-reserved-stock-workflow.md) for details

---

## 🎯 Sprint 6 — UX Phase 2

- 🔲 Real-time filter (debounce 300ms, `?q=`)
- 🔲 Sortable tables (`?sort=&order=`)
- 🔲 Full Reporting (EOD history, top-selling)
- 🔲 Patient Statement
- 🔲 Auto Calculator

---

## 🔒 Key Decisions (Locked)

| Decision | Sprint | Choice |
|----------|--------|--------|
| Smart Dosage snapshot | 3B | Option A: Single Snapshot |
| Dictionary version | 3B | `1.0` (engine on) |
| Summary Sheet | 3B | 6 items/page, dosage_original |
| Doctor Fee location | 3C | `prescriptions` table (per-visit) |
| Receipt Order | 3C | DF first → Medicines |
| **Reserved Stock Workflow** | 5 | ADR-0002 (status flow, guardrails) |
| **Semantic Naming** | 4 | PrepaySummary / Receipt (see Glossary) |

---

## 🔗 Related Documents

- [ADR-0002: Reserved Stock Workflow](../02-architecture/ADR/0002-reserved-stock-workflow.md)
- [SEMANTIC_GLOSSARY.md](SEMANTIC_GLOSSARY.md)
- [HANDOFF_PROMPT.md](../HANDOFF_PROMPT.md)
- [NEXT_SESSION.md](../NEXT_SESSION.md)
- [LESSONS_LEARNED.md](../01-constitution/LESSONS_LEARNED.md)
