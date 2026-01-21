# Sprint 3A+ Implementation Plan

**Sprint:** 3A+  
**วันที่:** 21 มกราคม 2569  
**สถานะ:** 🔲 Ready for Implementation

---

## ✅ Definition of Done (DoD)

> Sprint 3A+ เสร็จเมื่อ:

- [ ] เพิ่มคอลัมน์ `expiry_note_th`, `expiry_note_en` ใน medicines และอ่าน/เขียนได้จริง
- [ ] ฉลากยาแสดงภาษา TH/EN ตาม `patient.nationality` ผ่าน `label-translations.ts`
- [ ] ข้อความ "วันหมดอายุ" บนฉลาก ใช้ `medicine.expiry_note_th/en` (ไม่ hardcode)
- [ ] มี Medicine Summary Sheet 10×7.5 cm และพิมพ์ต่อท้าย label ได้ด้วย checkbox (default ON)
- [ ] ฟอร์มมี `autoComplete`/`type` ตาม Vercel best practice
- [ ] ผ่าน `npm run lint` + `npm run typecheck` และ manual verification

---

## 🎯 เป้าหมาย

1. Medicine Summary Sheet (ใบสรุปรายการยา Internal Use)
2. Label Translations (แปลภาษาฉลากยาตาม nationality)
3. Medicine expiry_note fields
4. Form Quick Fixes (Vercel Best Practices)
5. UX Improvements → **แยกเป็น Sprint 3B (กัน scope creep)**

---

## User Review Required

> [!IMPORTANT]
> **ลำดับการทำงาน:** DB migration → Types update → UI
> **Scope Lock:** UX Phase 2 (Filter/Sort/Nav) แยกไป Sprint 3B

---

## Proposed Changes

### Component 1: Database Migration + Types Update

#### 1.1 [NEW] Migration - Medicine expiry_note fields

```sql
-- Add expiry_note fields to medicines table
ALTER TABLE medicines 
ADD COLUMN IF NOT EXISTS expiry_note_th TEXT DEFAULT 'ดูวันหมดอายุที่ฉลากข้างกล่อง',
ADD COLUMN IF NOT EXISTS expiry_note_en TEXT DEFAULT 'See expiry date on the box';
```

**Verification:** Run migration via Supabase MCP → ตรวจ Table Editor

#### 1.2 [MODIFY] Types Update

**Files:**
- `src/types/medicines.ts` — เพิ่ม `expiry_note_th` และ `expiry_note_en`

```typescript
export type Medicine = {
  // ... existing fields
  expiry_note_th?: string | null
  expiry_note_en?: string | null
}
```

> [!WARNING]
> ถ้าใช้ `SELECT *` ผ่าน typed layer (zod schema / TS types) ต้องอัปเดต types ไม่งั้น build fail

---

### Component 2: Label Translations Library

#### [NEW] [label-translations.ts](file:///Users/cloud/Library/CloudStorage/OneDrive-Personal/Antigravity/kkclinic/src/lib/label-translations.ts)

```typescript
export const LABEL_TRANSLATIONS = {
  th: {
    patientName: 'ชื่อ',
    medicineName: 'ชื่อยา',
    directions: 'วิธีใช้',
    indication: 'สรรพคุณ',
    expiry: 'วันหมดอายุ',
    quantity: 'จำนวน',
    date: 'วันที่',
    total: 'รวม',
    items: 'รายการ',
    clinicName: 'คลินิกตาใสใส',
  },
  en: {
    patientName: 'Name',
    medicineName: 'Medicine',
    directions: 'Directions',
    indication: 'Indication',
    expiry: 'Expiry',
    quantity: 'Qty',
    date: 'Date',
    total: 'Total',
    items: 'items',
    clinicName: 'Taisaisai Eye Clinic',
  },
} as const

export type LabelLanguage = 'th' | 'en'

// null/undefined → 'th' (default)
export function getLabelLang(nationality: string | null): LabelLanguage {
  return nationality === 'other' ? 'en' : 'th'
}
```

---

### Component 3: Form Quick Fixes (Vercel Best Practices)

#### [MODIFY] Forms with phone/name inputs

เพิ่ม attributes ตาม Vercel Web Interface Guidelines:

```tsx
// Phone inputs (ใช้ camelCase สำหรับ React)
<Input type="tel" autoComplete="tel" ... />

// Name inputs  
<Input autoComplete="name" ... />

// Email inputs (ถ้ามี)
<Input type="email" autoComplete="email" ... />
```

**Files ที่ต้องแก้:**
- `src/components/forms/patient-form.tsx`
- `src/components/forms/medicine-form.tsx` (ถ้ามี phone)

---

### Component 4: Medicine Form Update

#### [MODIFY] [medicine-form.tsx](file:///Users/cloud/Library/CloudStorage/OneDrive-Personal/Antigravity/kkclinic/src/components/forms/medicine-form.tsx)

เพิ่ม fields:
- `expiry_note_th` — ข้อความวันหมดอายุ (TH)
- `expiry_note_en` — ข้อความวันหมดอายุ (EN)

**UX:**
- ใช้ **placeholder** แสดง default value (ไม่เพิ่มปุ่ม Reset)
- ปล่อยว่างได้ (DB มี default)
- ถ้า edit record เก่าที่ค่าเป็น null → ใช้ placeholder เป็น hint
- เพิ่ม **helper text** ใต้ input: "ถ้าเว้นว่าง ระบบจะใช้ข้อความมาตรฐาน"

```tsx
<div className="space-y-2">
  <Label>ข้อความวันหมดอายุ (TH)</Label>
  <Input 
    placeholder="ดูวันหมดอายุที่ฉลากข้างกล่อง" 
    {...register('expiry_note_th')}
  />
  <p className="text-xs text-muted-foreground">
    💡 ถ้าเว้นว่าง ระบบจะใช้ข้อความมาตรฐาน
  </p>
</div>
```

> [!IMPORTANT]
> **Server-side:** ต้องแปลง empty string `''` → `null` เพื่อให้ DB default ทำงาน
> ```typescript
> expiry_note_th: data.expiry_note_th || null,
> expiry_note_en: data.expiry_note_en || null,
> ```

---

### Component 5: Label Print View Update

#### [MODIFY] [label-print-view.tsx](file:///Users/cloud/Library/CloudStorage/OneDrive-Personal/Antigravity/kkclinic/src/app/(dashboard)/billing/receipt/[id]/labels/label-print-view.tsx)

1. Import `LABEL_TRANSLATIONS` และ `getLabelLang`
2. แปลข้อความบนฉลากตาม `patient.nationality`
3. ใช้ `medicine.expiry_note_th/en` แทนข้อความ hardcode

```typescript
const lang = getLabelLang(patient.nationality)
const t = LABEL_TRANSLATIONS[lang]

// Fallback กัน undefined/null (defense in depth)
const expiryNote = (lang === 'th' 
  ? medicine.expiry_note_th 
  : medicine.expiry_note_en)
  ?? (lang === 'th' 
    ? 'ดูวันหมดอายุที่ฉลากข้างกล่อง' 
    : 'See expiry date on the box')
```

---

### Component 6: Medicine Summary Sheet

#### [NEW] [medicine-summary-template.tsx](file:///Users/cloud/Library/CloudStorage/OneDrive-Personal/Antigravity/kkclinic/src/app/(dashboard)/billing/receipt/[id]/labels/medicine-summary-template.tsx)

**Layout Spec:**
- ขนาด: 10×7.5 cm (100mm × 75mm)
- Font: 9-10pt, line-height 1.1-1.2
- **maxItems: 11** (ถ้าเกิน แสดง "...และอีก X รายการ")

```typescript
const MAX_ITEMS = 11
const displayItems = items.slice(0, MAX_ITEMS)
const remainingCount = items.length - MAX_ITEMS

// แสดง "...และอีก X รายการ" ถ้าเกิน
{remainingCount > 0 && (
  <p className="text-xs">...และอีก {remainingCount} รายการ</p>
)}
```

**ข้อมูลที่แสดง:**
- TN, ชื่อผู้ป่วย, วันที่
- รายการยา: index, ชื่อยา (ตัดได้), จำนวน+หน่วย, วิธีใช้ภาษาหมอ (**ห้ามตัด**)
- Footer: "รวม X รายการ" + ชื่อคลินิก

**CSS Rules (สำคัญ):**

```css
/* Print margin: ล็อกไว้ป้องกัน browser ใส่ margin เอง */
@media print {
  @page { margin: 0; }
  body { margin: 0; }
}

.print-page {
  width: 100mm;
  height: 75mm;
  overflow: hidden;
}

/* ชื่อยา: ตัดได้ถ้ายาว */
.medicine-name { 
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 60%;
}

/* วิธีใช้ภาษาหมอ: ห้ามตัด! */
.directions { 
  white-space: normal;
  word-wrap: break-word;
}
```

> [!WARNING]
> **ตรวจสอบ Print Margin:** ดู `label-print-view.tsx` ว่ามี `@page { margin: 0 }` หรือยัง

**Layout:**
```
┌───────────────────────────────────────────────┐
│ TN250429  นายสมชาย ใจดี       21/01/69        │
├───────────────────────────────────────────────┤
│ 1. Vigamox 5ml ×1 ขวด                         │
│    → 1 gtt OU qid pc                          │
│ 2. Pred Forte 5ml ×2 ขวด                      │
│    → 2 gtt OS bid ac                          │
├───────────────────────────────────────────────┤
│ รวม 2 รายการ                   คลินิกตาใสใส  │
└───────────────────────────────────────────────┘
```

---

### Component 7: Integration — Checkbox + Print Pipeline

#### [MODIFY] [label-print-view.tsx](file:///Users/cloud/Library/CloudStorage/OneDrive-Personal/Antigravity/kkclinic/src/app/(dashboard)/billing/receipt/[id]/labels/label-print-view.tsx)

1. เพิ่ม Checkbox "☑️ พิมพ์ใบสรุปรายการยาด้วย" (default ON)
2. State: `const [printSummary, setPrintSummary] = useState(true)`
3. ถ้า `printSummary` → append `MedicineSummaryTemplate` ใน `.print-container`

> [!IMPORTANT]
> **พิมพ์ในปุ่มเดียว** — Summary ต้องอยู่ใน DOM/print container เดียวกับ labels

---

### Component 8: UX Improvements (แยกเป็น Sprint 3B)

> **ไม่ทำใน Sprint 3A+** — กัน scope creep

- PR-UX-01: Filter + Sort
- PR-UX-02: Nav highlight + TN Standardization

---

## Verification Plan

### Automated Tests

```bash
npm run lint
npm run typecheck
```

### Manual Verification

#### 1. หลัง DB Migration
- [ ] เปิด Supabase Table Editor ดูว่ามี 2 columns และ default ถูกต้อง

#### 2. Medicine Form
- [ ] Create ใหม่: save แล้วไปดู record ว่าค่าถูกบันทึก
- [ ] Edit ยาเก่า: ใส่ expiry note แล้ว print label ดูผล

#### 3. Label Print
- [ ] คนไข้ไทย (nationality = 'thai') → label TH + expiry_note_th
- [ ] คนไข้ต่างชาติ (nationality = 'other') → label EN + expiry_note_en

#### 4. Medicine Summary Sheet
- [ ] Checkbox default ON
- [ ] พิมพ์แล้วได้ label + summary ต่อท้ายในครั้งเดียว
- [ ] ทดสอบ 11 รายการ: ไม่ล้นเกินกระดาษ (ชื่อยาตัดได้ แต่ directions ครบ)

#### 5. Form Quick Fixes
- [ ] มือถือ: ช่อง tel ขึ้น numpad
- [ ] Browser: autofill name/tel ทำงาน

---

## Task Order

| ลำดับ | งาน | ประมาณเวลา |
|------|-----|-----------|
| 1 | DB Migration (expiry_note) | 10 นาที |
| 1.2 | **Types Update** (medicines.ts) | 5 นาที |
| 2 | Label Translations Library | 15 นาที |
| 3 | Form Quick Fixes | 15 นาที |
| 4 | Medicine Form Update | 30 นาที |
| 5 | Label Print Translation + expiry_note | 45 นาที |
| 6 | Medicine Summary Template | 1 ชม. |
| 7 | Integration + Checkbox | 30 นาที |
| 8 | Test + Verify | 30 นาที |
| **รวม** | | **~4 ชม.** |

---

## Decision Lock

| Decision | Choice |
|----------|--------|
| Medicine `name_en` | ❌ ตัดออก |
| Medicine `expiry_note` | ✅ `expiry_note_th` + `expiry_note_en` |
| Label Translations | ✅ Centralized in `label-translations.ts` |
| Summary Sheet | Thermal 10×7.5, Checkbox default ON, **maxItems=11** |
| Summary CSS | **directions ห้ามตัด**, print margin locked |
| expiry_note Fallback | ✅ Client-side fallback กัน undefined |
| Form Helper Text | ✅ แสดง "ถ้าเว้นว่าง..." + Server แปลง `''` → `null` |
| UX Phase 2 | ❌ แยกไป Sprint 3B |
| Form autocomplete | ✅ camelCase `autoComplete` (React) |
| DB Backfill | ❌ ไม่จำเป็น — PostgreSQL ADD COLUMN + DEFAULT ใส่ให้อัตโนมัติ |

---

*Plan Updated: 21 มกราคม 2569 @ 08:41*
*Recommendations analyzed and incorporated*
