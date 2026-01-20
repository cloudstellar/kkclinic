# Handoff Prompt for AI Agent

**Current State:** Sprint 3A+ Ready for Implementation  
**Last Updated:** 21 มกราคม 2569 @ 03:08  
**Version:** `feature/sprint-3a+` — Final plan approved, DoD defined

---

## ⚠️ CRITICAL: TN Standardization

**Patient Identifier = TN only**
- ❌ ไม่ใช้ HN ในที่ใดเลย
- DB column ยังเป็น `hn` ได้ชั่วคราว
- UI / URL / sort / search / print = **TN**

---

## 📊 Sprint Status

| Sprint | Status |
|--------|--------|
| Sprint 3A | ✅ Done |
| **Sprint 3A+** | 🔲 Ready for Implementation |
| Sprint 3B | 🔲 Pending (UX Phase 2) |

---

## ✅ Definition of Done (Sprint 3A+)

> Sprint เสร็จเมื่อ:

- [ ] `expiry_note_th`, `expiry_note_en` ใน medicines และอ่าน/เขียนได้
- [ ] ฉลากยาแสดงภาษา TH/EN ตาม `patient.nationality`
- [ ] ข้อความ "วันหมดอายุ" ใช้ `medicine.expiry_note_th/en` (ไม่ hardcode)
- [ ] Medicine Summary Sheet 10×7.5 cm + Checkbox default ON
- [ ] ฟอร์มมี `autoComplete`/`type` ตาม Vercel best practice
- [ ] ผ่าน `npm run lint` + `npm run typecheck`

---

## 🎯 Sprint 3A+ Tasks

### Part 1: Bug Fixes (DONE ✅)

Commit `004c9f1`:
- Foreign Names: Unified display in Rx list, Payment, Print
- Search: Added `name_en` to search query
- Label Print: Fixed 10x7.5cm thermal layout

### Part 2: Implementation (PENDING)

**PR-DB-01: Database Migration**
- [ ] Add `expiry_note_th`, `expiry_note_en` columns
- [ ] Update `src/types/medicines.ts`

**PR-PRINT-01: Medicine Summary Sheet**
- [ ] ใบสรุปรายการยา — thermal 10×7.5 cm
- [ ] Compact layout (~10-11 รายการ)
- [ ] Checkbox "พิมพ์ใบสรุปฯ" default ON
- [ ] **CSS: directions ห้ามตัด**

**PR-PRINT-02: Label Translations**
- [ ] สร้าง `src/lib/label-translations.ts`
- [ ] แปลภาษาตาม `nationality`
- [ ] ใช้ `medicine.expiry_note_th/en`

**PR-FIX-01: Form Quick Fixes**
- [ ] เพิ่ม `type="tel"` ใน phone inputs
- [ ] เพิ่ม `autoComplete` attributes (camelCase)

### Part 3: UX Improvements → **แยกไป Sprint 3B**

> ⚠️ **Scope Lock:** ไม่ทำใน Sprint 3A+

- PR-UX-01: Filter + Sort
- PR-UX-02: Nav highlight + TN Standardization

---

## 📋 Next Session Instructions

```
1. อ่าน HANDOFF_PROMPT.md
2. ดู implementation_plan.md ใน artifacts
3. ทำตามลำดับ:
   - DB Migration + Types Update
   - Label Translations Library
   - Form Quick Fixes
   - Medicine Form Update
   - Label Print Translation
   - Medicine Summary Template
   - Integration + Checkbox
   - Test + Verify
4. ใช้ DoD checklist ตรวจสอบก่อนจบ
```

---

## ⚡ Decision Lock

| Decision | Choice |
|----------|--------|
| Patient ID | **TN only** |
| Medicine `name_en` | ❌ ตัดออก — ใช้ Brand name |
| Medicine `expiry_note` | ✅ `expiry_note_th` + `expiry_note_en` |
| Label Translations | ✅ `label-translations.ts` — TH/EN ตาม nationality |
| Summary Sheet | Thermal 10×7.5, Checkbox default ON |
| Summary CSS | **directions ห้ามตัด** (ชื่อยาตัดได้) |
| Form autocomplete | ✅ camelCase `autoComplete` (React) |
| UX Phase 2 | ❌ แยกไป Sprint 3B |

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `implementation_plan.md` | แผนการทำงานละเอียด (artifacts) |
| `.agent/skills/medical-ux/SKILL.md` | Vercel Best Practices + Medical UX |
| `docs/ROADMAP.md` | Sprint overview |
| `docs/CHANGE_REQUEST_SPRINT3.md` | Full spec |
