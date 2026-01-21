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

#### [NEW] `src/lib/label-translations.ts`

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

// ✅ Constant เดียวสำหรับ fallback (กัน drift)
export const DEFAULT_EXPIRY_NOTE = {
  th: 'ดูวันหมดอายุที่ฉลากข้างกล่อง',
  en: 'See expiry date on the box',
} as const
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

#### [MODIFY] `src/components/forms/medicine-form.tsx`

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
> **Server-side:** ต้องใช้ trim-based normalize (ไม่ใช่ `|| null`)
> ```typescript
> const normalizeNote = (v?: string | null) => {
>   const s = (v ?? '').trim()
>   return s.length ? s : null
> }
> 
> expiry_note_th: normalizeNote(data.expiry_note_th),
> expiry_note_en: normalizeNote(data.expiry_note_en),
> ```

---

### Component 5: Label Print View Update

#### [MODIFY] `src/app/(dashboard)/billing/receipt/[id]/labels/label-print-view.tsx`

1. Import `LABEL_TRANSLATIONS` และ `getLabelLang`
2. แปลข้อความบนฉลากตาม `patient.nationality`
3. ใช้ `medicine.expiry_note_th/en` แทนข้อความ hardcode

```typescript
import { LABEL_TRANSLATIONS, getLabelLang, DEFAULT_EXPIRY_NOTE } from '@/lib/label-translations'

const lang = getLabelLang(patient.nationality)
const t = LABEL_TRANSLATIONS[lang]

// Fallback ใช้ constant เดียวกัน (กัน drift)
const expiryNote = (lang === 'th' 
  ? medicine.expiry_note_th 
  : medicine.expiry_note_en)
  ?? DEFAULT_EXPIRY_NOTE[lang]
```

---

### Component 6: Medicine Summary Sheet

#### [NEW] `src/app/(dashboard)/billing/receipt/[id]/labels/medicine-summary-template.tsx`

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
- รายการยา: index, **ชื่อยา**, จำนวน+หน่วย, **วิธีใช้ภาษาหมอ**
- "...และอีก X รายการ" (ถ้าเกิน) — **อยู่ก่อน footer**
- Footer: "รวม X รายการ" + ชื่อคลินิก — **ติดขอบล่าง (sticky bottom)**

> [!IMPORTANT]
> ## 📝 Medicine Name Rule (Summary Sheet Only)
> 
> | Rule | รายละเอียด |
> |------|-----------|
> | **ห้ามตัด** | ไม่ใช้ ellipsis/truncate เด็ดขาด |
> | **ค่าเริ่มต้น** | ใช้ชื่อเต็ม `medicine.name` |
> | **ล้นหน้า** | ตัดสินจาก layout constraint (maxItems=11) ไม่ใช่การตัด string |
> | **directions** | ห้ามตัดเสมอ (ข้อมูลหลัก) |
> 
> ⚠️ **Sprint 3A+ ไม่มี short_name field** — ใช้ `medicine.name` เท่านั้น
> (หากต้องการชื่อย่อในอนาคต ต้องเพิ่ม field ใหม่ใน Sprint ถัดไป)
> 
> **Scope:** เฉพาะ Medicine Summary Sheet (Internal Use) ไม่กระทบ label คนไข้

**Display Name Logic:**
```typescript
// Sprint 3A+: ใช้ name เท่านั้น (ไม่มี short_name)
const displayName = medicine.name
```

**Layout Structure (Flex):**
```tsx
<div className="flex flex-col h-full">
  <header>...</header>
  <div className="flex-1">รายการยา + ...และอีก X</div>
  <footer className="mt-auto">รวม X รายการ</footer>
</div>
```

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

/* ชื่อยา: ห้ามตัด (wrap ได้) */
.medicine-name { 
  white-space: normal;
  word-break: break-word;
}

/* วิธีใช้ภาษาหมอ: ห้ามตัด! */
.directions { 
  white-space: normal;
  word-wrap: break-word;
}
```

> [!WARNING]
> **Print CSS Location:** ควรอยู่ใน `src/app/globals.css` หรือ print stylesheet ที่มีอยู่
> ไม่ใช่ใน component เพราะจะซ้ำซ้อน — ตรวจสอบ `@page { margin: 0 }` ก่อน implement

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

#### [MODIFY] `src/app/(dashboard)/billing/receipt/[id]/labels/label-print-view.tsx`

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
- [ ] ทดสอบ 11 รายการ: ไม่ล้นเกินกระดาษ (ชื่อยาไม่ตัด, directions ครบ)

#### 5. Form Quick Fixes
- [ ] มือถือ: ช่อง tel ขึ้น numpad
- [ ] Browser: autofill name/tel ทำงาน

---

## 🚀 Milestone Approach (Incremental)

> **แนวทาง:** ค่อยๆ ทำ + test ไป — ไม่ทำรวดเลย

### Milestone 1: Database + Types (15 นาที)

**Tasks:**
- [ ] 1.1 Run DB Migration (expiry_note_th, expiry_note_en)
- [ ] 1.2 Update `src/types/medicines.ts`

**Test:**
- [ ] ดู Supabase Table Editor: มี 2 columns + default ถูกต้อง
- [ ] `npm run typecheck` ผ่าน

**Commit:** `feat: add expiry_note fields to medicines table`

---

### Milestone 2: Translations + Form Fixes (30 นาที)

**Tasks:**
- [ ] 2.1 สร้าง `src/lib/label-translations.ts`
- [ ] 2.2 เพิ่ม `type="tel"` + `autoComplete` ใน `patient-form.tsx`

**Test:**
- [ ] `npm run lint` ผ่าน
- [ ] `npm run typecheck` ผ่าน

**Commit:** `feat: add label translations and form quick fixes`

---

### Milestone 3: Medicine Form (30 นาที)

**Tasks:**
- [ ] 3.1 เพิ่ม expiry_note_th/en fields ใน form
- [ ] 3.2 เพิ่ม helper text "ถ้าเว้นว่าง..."
- [ ] 3.3 Server-side: แปลง `''` → `null`

**Test:**
- [ ] Create ยาใหม่ → ดู record ใน DB
- [ ] Edit ยาเก่า → ค่าบันทึกถูกต้อง

**Commit:** `feat: add expiry_note fields to medicine form`

---

### Milestone 4: Label Print Translation (45 นาที)

**Tasks:**
- [ ] 4.1 Import LABEL_TRANSLATIONS + getLabelLang
- [ ] 4.2 แปลข้อความตาม nationality
- [ ] 4.3 ใช้ medicine.expiry_note_th/en + fallback

**Test:**
- [ ] พิมพ์ฉลากคนไข้ไทย → ข้อความ TH
- [ ] พิมพ์ฉลากคนไข้ต่างชาติ → ข้อความ EN

**Commit:** `feat: bilingual label printing`

---

### Milestone 5: Summary Sheet + Integration (1.5 ชม.)

**Tasks:**
- [ ] 5.1 สร้าง MedicineSummaryTemplate (maxItems=11)
- [ ] 5.2 เพิ่ม Checkbox "พิมพ์ใบสรุปฯ" (default ON)
- [ ] 5.3 รวม Summary ใน print container

**Test:**
- [ ] Checkbox default ON
- [ ] พิมพ์ได้ใน print dialog เดียว
- [ ] ทดสอบ 11 รายการ: ไม่ล้น

**Commit:** `feat: add medicine summary sheet`

---

### Milestone 6: Final Verification (30 นาที)

**Tasks:**
- [ ] ทดสอบ DoD ทุกข้อ
- [ ] `npm run lint` + `npm run typecheck`
- [ ] ตรวจสอบ print margin

**Final Commit:** `feat: complete Sprint 3A+ label and summary features`

---

## ⏱️ เวลารวม

| Milestone | เวลา |
|-----------|------|
| M1: Database + Types | 15 นาที |
| M2: Translations + Form Fixes | 30 นาที |
| M3: Medicine Form | 30 นาที |
| M4: Label Print | 45 นาที |
| M5: Summary + Integration | 1.5 ชม. |
| M6: Verification | 30 นาที |
| **รวม** | **~4 ชม.** |

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
| DB Backfill | ❌ ไม่ทำ — ยอมรับ NULL + ใช้ client fallback + server normalize กันข้อมูลผิด |

---

*Plan Updated: 21 มกราคม 2569 @ 11:45*
*Applied 6 refinements from final review*
