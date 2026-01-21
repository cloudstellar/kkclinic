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
| **Sprint 3A+** | 🟡 In Progress (M1, M2 Done) |
| Sprint 3B | 🔲 Pending (UX Phase 2) |

---

## ✅ Definition of Done (Sprint 3A+)

> Sprint เสร็จเมื่อ:

- [x] Create `expiry_note_th`, `expiry_note_en` & Types (M1)
- [x] ฟอร์มมี `autoComplete`/`type` ตาม Vercel best practice (M2)
- [x] Label translations library created (M2)
- [ ] `medicine-form` รองรับ input ทั้ง 2 ภาษา (M3)
- [ ] ฉลากยาแสดงภาษา TH/EN ตาม `patient.nationality` (M4)
- [ ] ข้อความ "วันหมดอายุ" ใช้ `medicine.expiry_note_th/en` (M4)
- [ ] Medicine Summary Sheet 10×7.5 cm + Checkbox default ON (M5)
- [ ] ผ่าน `npm run lint` + `npm run typecheck` (M6)

---

## 🎯 Sprint 3A+ Tasks

### Part 1: Completed Tasks ✅

**Milestone 1: Database + Types**
- [x] DB Migration: Added `expiry_note_th`, `expiry_note_en` columns
- [x] Updated `src/types/medicines.ts`

**Milestone 2: Translations + Form Fixes**
- [x] Create `src/lib/label-translations.ts`
- [x] Add `type="tel"`, `inputMode="numeric"` and `autoComplete` to `patient-form.tsx`

### Part 2: Next Steps (PENDING) 🚀

**Milestone 3: Medicine Form Update** (START HERE)
- [ ] Add `expiry_note_th`, `expiry_note_en` fields to `medicine-form.tsx`
- [ ] Add helper text using `DEFAULT_EXPIRY_NOTE` from `src/lib/label-translations.ts`

**Milestone 4: Label Print Translation**
- [ ] Update labels to use translation logic based on nationality
- [ ] Display correct `expiry_note`

**Milestone 5: Medicine Summary Sheet**
- [ ] Thermal 10x7.5cm layout
- [ ] **CSS Rule:** Directions must NOT be truncated

---

## 📋 Next Session Instructions

```
1. อ่าน HANDOFF_PROMPT.md (ฉบับนี้)
2. ดู implementation_plan.md ใน artifacts (หรือ docs/IMPLEMENTATION_PLAN_SPRINT3A_PLUS.md)
3. เริ่มทำ Milestone 3 ต่อทันที:
   - เปิด `src/components/forms/medicine-form.tsx`
   - เพิ่ม field expiry_note_th/en
   - **Note:** อย่าลืมใช้ DEFAULT_EXPIRY_NOTE จาก library ที่สร้างไว้แล้วใน M2
4. ทำต่อ Milestone 4 -> 5 -> 6 ตามลำดับ
5. ทดสอบทุก Milestone ตามที่ระบุใน plan
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
