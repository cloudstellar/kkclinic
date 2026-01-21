# KKClinic Roadmap

> อัปเดตล่าสุด: 21 มกราคม 2569

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
| **Sprint 3A** | 🚀 **In Progress** | TN, Patient Registry, Prescription, Label | `v0.5.3-sprint3a-ready` |
| Sprint 3B | 🔲 Pending | Reserved Stock, EOD, AutoCalc, Payment | - |

---

## 🎯 Sprint 3A+ — Ready for Implementation

> **Plan Finalized:** 21 มกราคม 2569  
> **DoD Defined:** ✅

### Definition of Done

- [ ] `expiry_note_th/en` ใน medicines + types update
- [ ] ฉลากยา TH/EN ตาม nationality
- [ ] Medicine Summary Sheet 10×7.5 + Checkbox ON
- [ ] Form `autoComplete`/`type` (Vercel best practice)
- [ ] `npm run lint` + `npm run typecheck` ผ่าน

### Decision Lock

| Feature | Status |
|---------|--------|
| TN format validation | ✅ UI + Server |
| TN DB constraint | ⏳ Deferred |
| Patient fields (nationality, postal, emergency) | ✅ Do |
| Prescription fields (df, dosage_raw) | ✅ Do |
| Label 10×7.5 cm | ✅ Do |
| Medicine `name_en` | ❌ ตัดออก (ใช้ Brand name) |
| Medicine `expiry_note_th/en` | ✅ Do |
| Medicine Summary Sheet | ✅ Do |
| Label Translations | ✅ `label-translations.ts` |
| Form Quick Fixes | ✅ `autoComplete` + `type="tel"` |
| **UX Phase 2** | ❌ **แยกไป Sprint 3B** |

### Tasks
- 🔲 DB migration (expiry_note) + Types update
- 🔲 Label Translations Library
- 🔲 Form Quick Fixes (Vercel best practice)
- 🔲 Update medicine-form (+ expiry_note fields)
- 🔲 Label Print Translation + expiry_note swap
- 🔲 **Medicine Summary Sheet** (Internal Use thermal print)
- 🔲 Integration + Checkbox
- 🔲 Test + Verify

---

## 🎯 Sprint 3B — Pending (UX Phase 2 + Workflow)

> **ห้าม implement ก่อน Sprint 3A+ เสร็จ**

### UX Phase 2 (ย้ายมาจาก 3A+)
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
| TN validation | 3A | UI + Server (DB deferred) |
| Nationality | 3A | thai / other (no fallback) |
| Label size | 3A | 10×7.5 cm (Thermal) |
| Medicine name_en | 3A+ | ❌ ตัดออก — ใช้ Brand name |
| Medicine expiry_note | 3A+ | ✅ `expiry_note_th` + `expiry_note_en` |
| Medicine Summary | 3A+ | Thermal + Checkbox default ON |
| Summary CSS | 3A+ | **directions ห้ามตัด** |
| Label Translations | 3A+ | ✅ `label-translations.ts` |
| Form autocomplete | 3A+ | ✅ camelCase `autoComplete` |
| UX Phase 2 | 3A+ → 3B | ❌ แยกออก (กัน scope creep) |

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

---

## 🔗 Related Documents

- [Change Request Sprint 3](CHANGE_REQUEST_SPRINT3.md) - **Current focus**
- [Handoff Prompt](HANDOFF_PROMPT.md) - Next session guide
- [Database Schema](DATABASE_SCHEMA.md) - Complete schema documentation
- [SKILL.md](../.agent/skills/medical-ux/SKILL.md) - Engineering + UX standards
