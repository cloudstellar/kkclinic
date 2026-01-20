---
name: Medical UX with shadcn/ui
description: Expert knowledge for designing clinic management UI that doctors and staff love
---

# Medical UX Design Skill

> 🏥 การออกแบบ UI/UX สำหรับคลินิก โดยเข้าใจ workflow ของแพทย์และ staff

---

## 🎯 Core Principles

### 1. Speed Over Beauty
- แพทย์มี **10-15 นาทีต่อคนไข้** — ทุก click มีค่า
- ลด steps → ใช้ default ที่ดี, auto-complete, shortcuts
- **Rule of 3 clicks:** ทุก action ควรเสร็จใน 3 clicks

### 2. Scannable, Not Readable
- ใช้ **Emoji + Text** สำหรับ headers (e.g., `💳 คิดเงิน`, `💊 จ่ายยา`)
- ข้อมูลสำคัญต้อง **bold** ทันที (ชื่อ, แพ้ยา, ยอดเงิน)
- ใช้ **Emoji badges** แทน text ยาว

### 3. Error Prevention > Error Message
- **Confirmation modals** สำหรับ destructive actions
- **Inline validation** ทันที ไม่รอกด submit
- **Disable** ปุ่มที่ไม่ควรกดแทนการซ่อน

---

## 🧱 Engineering Standards (Next.js / React / TypeScript)

### Next.js App Router Conventions
- ใช้ `app/` (App Router) และ Server Components เป็น default
- ใส่ `"use client"` เฉพาะหน้าที่ต้อง interactive จริง (form, dialog, printing, keyboard shortcuts)
- แยก logic:
  - **Server:** fetch/permission/transactions
  - **Client:** UI interactions, forms, modals

### TypeScript Rules
- ❌ ห้ามใช้ `any` และห้าม cast มั่ว (`as unknown as`)
- ✅ ใช้ `zod` สำหรับ validation + type inference (form + server)
- ✅ สร้าง types กลางไว้ที่ `src/types/*`

### Data Fetching & Mutations
- Query ฝั่ง client ต้องมี loading/error state เสมอ
- Mutation ต้อง:
  - disable ปุ่มขณะทำงาน (`isSubmitting`)
  - toast success/error เป็นภาษาไทย
  - กัน double-submit

---

## 🗄️ Data Integrity Guardrails (Clinic Safety)

### Core Principle
> "ระบบต้องถูกต้องแม้ staff ไม่แตะระบบเลย"

### Patient Rules
| nationality | Required Field | Fallback |
|-------------|----------------|----------|
| `thai` | `name` (ไทย) | ❌ ไม่ fallback ไป EN |
| `other` | `name_en` (EN) | ❌ ไม่ fallback ไปไทย |

- ถ้าข้อมูลไม่ครบ → **Hard stop** ห้ามพิมพ์ฉลาก/ใบสรุป

### Payment Status Rules (Sprint 3B)
- สถานะการเงินมีแค่: `pending` → `confirmed` → `locked`
- ระบบ **ห้ามเดา** ว่ามีการรับเงิน หากไม่มี confirm ในระบบ

---

## 📦 Inventory Model Rules (Sprint 3B)

> ⏳ **หมายเหตุ:** Section นี้จะใช้เมื่อทำ Sprint 3B
> ⚠️ **ห้าม implement logic ใน section นี้ก่อน Sprint 3B**

### Stock Status Definitions
| Status | Meaning |
|--------|---------|
| `available` | คงเหลือที่ "สั่งได้จริง" (on_hand − reserved) |
| `reserved` 🟠 | จัดยาแล้ว รอยืนยัน |
| `consumed` | ตัดสต๊อกจริงแล้ว |
| `released` | คืนสต๊อก (ยกเลิก/ตัดรายการ/ไม่ยืนยัน) |

### State Transitions (Must be Idempotent)
- **Reserve:** เกิดเมื่อแพทย์กด "จัดยาแล้ว"
- **Release:** เกิดเมื่อ staff ตัดรายการ หรือ EOD ไม่ยืนยัน
- **Consume:** เกิดเมื่อ Confirm หรือ EOD ยืนยัน
- **No reserved overnight:** EOD ต้องเคลียร์ reserved ทั้งหมด

### Transaction Safety
- การเปลี่ยนสถานะสต๊อกต้องทำใน transaction เดียวเสมอ
- ห้าม "ตัดสต๊อกจริง" จาก client โดยตรง (ต้องผ่าน server)

---

## 🧾 Printing Standards

### Thermal Label (10×7.5 cm)
```css
@page {
  size: 10cm 7.5cm;
  margin: 3mm;
}
```
- หลีกเลี่ยง layout shift: ใช้ขนาดตัวอักษรและ spacing แบบ fixed
- ห้ามพึ่ง dynamic font load ตอนพิมพ์ (ใช้ system font / preload)

### Patient Statement (ใบสรุปค่าใช้จ่าย) — ไม่ใช่ Thermal
- พิมพ์แบบ A4 หรือ browser print
- ต้องมีข้อความกำกับชัดเจน:
  - TH: **"เอกสารฉบับนี้ไม่ใช่ใบเสร็จรับเงิน"**
  - EN: **"This is not a receipt"**
- ยอดเงินต้อง format ผ่าน `formatCurrency()` เท่านั้น

---

## 🧪 Quality Bar (Before Merge)

### Required Checks
- `npm run lint` ผ่าน
- `npm run typecheck` ผ่าน
- migrations ใช้ได้จริง (apply ได้ clean)
- UI มี loading state สำหรับทุกปุ่มที่ทำงานกับ server

### Minimum Test Cases (Sprint 3B)
- reserve → release (ตัดยาบางรายการ)
- reserve → consume (confirm)
- EOD เคลียร์ reserved ทั้งหมด (ไม่มีค้างข้ามวัน)
- `pending` ไม่ถูกเปลี่ยนเป็น `confirmed` โดยอัตโนมัติ

---

## 🧭 Repo Workflow

- ทุก PR ต้องระบุว่าแก้ CR section ไหน เช่น: `Implements CR-2026-003 §3A.2`
- Schema เปลี่ยน → update `/docs/DATABASE_SCHEMA.md`
- Workflow เปลี่ยน → update `/docs/WORKFLOW.md`

---

## 🎨 KKClinic Design System

### Page Headers
```tsx
<h1 className="text-2xl font-bold mb-4">💳 คิดเงิน / ประวัติการชำระ</h1>
```

### Status Badges (Custom Colors)
```tsx
// รอจ่ายยา (Yellow)
<Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
  รอจ่ายยา
</Badge>

// ยกเลิก (Destructive)
<Badge variant="destructive" className="text-xs">❌ ยกเลิก</Badge>
```

### Payment Method Icons
```tsx
const paymentMethodLabels = {
  cash: '💵 เงินสด',
  transfer: '📲 โอน',
  card: '💳 บัตร',
}
```

### Color Coding
| Context | Color |
|---------|-------|
| Money (positive) | `text-green-600` |
| Voided/Cancelled | `text-red-600`, `bg-red-50` |
| Warning/Pending | `text-yellow-700`, `bg-yellow-50` |
| Muted/Secondary | `text-muted-foreground` |

### Drug Allergy Warning (CRITICAL)
```tsx
<Label className="text-red-600 font-medium">🚨 ประวัติแพ้ยา</Label>
<Textarea className="border-red-200 focus:border-red-400" />
```

### Empty State
```tsx
<div className="p-8 text-center text-muted-foreground">
  <p className="text-lg mb-2">📭 ยังไม่มีรายการชำระเงินวันนี้</p>
  <p className="text-sm">รายการจะแสดงเมื่อมีการชำระเงินสำเร็จ</p>
</div>
```

### Tip Text
```tsx
<p className="text-sm text-muted-foreground mt-4">
  💡 คลิกปุ่ม "พิมพ์" เพื่อดูและพิมพ์ใบเสร็จซ้ำ
</p>
```

---

## ⌨️ Keyboard Shortcuts

```tsx
// Essential shortcuts
if (e.metaKey || e.ctrlKey) {
  switch (e.key) {
    case 'Enter': handleSubmit(); break;
    case 's': handleSave(); break;
    case 'p': handlePrint(); break;
  }
}
if (e.key === 'Escape') handleClose();
```

---

## 📋 Checklist for New Pages

- [ ] Page header with emoji + title
- [ ] Summary cards if applicable
- [ ] Empty state with emoji
- [ ] Tip text at bottom
- [ ] Drug allergy always visible (red)
- [ ] Format all money with `formatCurrency()`
- [ ] Loading states for buttons
- [ ] Thai error messages
- [ ] `npm run lint` + `npm run typecheck` pass

---

## 🔗 Key Components

| Component | Path |
|-----------|------|
| `PatientForm` | `src/components/forms/patient-form.tsx` |
| `DosageSheet` | `src/components/prescription/dosage-instruction-sheet.tsx` |
| `PaymentModal` | `src/components/payment/payment-modal.tsx` |

---

## 📚 Tech Stack

- **Framework:** Next.js (App Router)
- **UI:** shadcn/ui + Radix UI + Tailwind CSS
- **Validation:** Zod
- **Icons:** Emoji (primary, UI text & badges)
- **Database:** Supabase (PostgreSQL)

---

## 🌐 Web Interface Guidelines (Vercel Best Practices)

> 📖 **Source:** [vercel-labs/web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines)
> อัปเดตล่าสุด: 21 มกราคม 2569

### 🎯 Focus States
- Interactive elements ต้องมี visible focus: `focus-visible:ring-*`
- ❌ ห้าม `outline-none` โดยไม่มี focus replacement
- ใช้ `:focus-visible` แทน `:focus` (หลีกเลี่ยง focus ring on click)

### 📝 Forms (สำคัญมากสำหรับ Medical)
- Inputs ต้องมี `autocomplete` และ `name` ที่สื่อความหมาย
- ใช้ `type` ที่ถูกต้อง: `email`, `tel`, `number`
- ❌ ห้าม block paste (`onPaste` + `preventDefault`)
- Labels ต้อง clickable (`htmlFor` หรือ wrap control)
- ปิด spellcheck สำหรับ emails, codes, usernames: `spellCheck={false}`
- Submit button enabled จนกว่า request เริ่ม → spinner ระหว่าง request
- Errors inline ข้างๆ fields; focus ที่ error แรกเมื่อ submit
- Placeholders ลงท้ายด้วย `…` และแสดงตัวอย่าง pattern
- Warn ก่อน navigate ถ้ามี unsaved changes (`beforeunload`)

### 🎬 Animation
- Honor `prefers-reduced-motion` (ให้ reduced variant หรือ disable)
- Animate `transform`/`opacity` เท่านั้น (compositor-friendly)
- ❌ ห้าม `transition: all` — list properties เฉพาะเจาะจง

### 🔤 Typography
- ใช้ `…` ไม่ใช่ `...`
- ใช้ curly quotes `"` `"` ไม่ใช่ straight `"`
- Loading states ลงท้ายด้วย `…`: `"กำลังบันทึก…"`, `"กำลังโหลด…"`
- ใช้ `font-variant-numeric: tabular-nums` สำหรับ **ตัวเลขยา/ราคา**
- ใช้ `text-wrap: balance` หรือ `text-pretty` สำหรับ headings

### 📦 Content Handling
- Text containers จัดการ long content: `truncate`, `line-clamp-*`, `break-words`
- Flex children ต้องมี `min-w-0` เพื่อให้ text truncation ทำงาน
- Handle empty states — อย่า render broken UI สำหรับ empty strings/arrays

### 🖼️ Images
- `<img>` ต้องมี `width` และ `height` เสมอ (ป้องกัน CLS)
- Below-fold images: `loading="lazy"`
- Above-fold critical images: `priority` หรือ `fetchpriority="high"`

### ⚡ Performance
- Large lists (>50 items): virtualize (`virtua`, `content-visibility: auto`)
- ❌ ห้าม layout reads in render (`getBoundingClientRect`, `offsetHeight`)
- Prefer uncontrolled inputs; controlled inputs ต้อง cheap per keystroke
- เพิ่ม `<link rel="preconnect">` สำหรับ CDN/asset domains

### 🌍 Locale & i18n (สำคัญสำหรับคนไข้ต่างชาติ)
- วันที่/เวลา: ใช้ `Intl.DateTimeFormat` ไม่ hardcode formats
- ตัวเลข/สกุลเงิน: ใช้ `Intl.NumberFormat` ไม่ hardcode formats
- ตรวจจับภาษาผ่าน `Accept-Language` / `navigator.languages` ไม่ใช่ IP

### 📱 Touch & Interaction
- `touch-action: manipulation` (ป้องกัน double-tap zoom delay)
- `overscroll-behavior: contain` ใน modals/drawers/sheets
- `autoFocus` ใช้อย่างระวัง — desktop only, single primary input

### 🌙 Dark Mode & Theming
- `color-scheme: dark` บน `<html>` สำหรับ dark themes
- `<meta name="theme-color">` ตรงกับ page background
- Native `<select>`: explicit `background-color` และ `color`

---

## 🚫 Anti-patterns (ต้อง flag)

| Pattern | ปัญหา |
|---------|-------|
| `user-scalable=no` | ปิดการ zoom ของ user |
| `onPaste` + `preventDefault` | Block paste in forms |
| `transition: all` | Performance issue |
| `outline-none` โดยไม่มี focus-visible | Accessibility issue |
| `onClick` navigation ไม่มี `<Link>` | ไม่รองรับ Cmd/Ctrl+click |
| `<div>` หรือ `<span>` with click handlers | ควรเป็น `<button>` |
| Images ไม่มี dimensions | Layout shift (CLS) |
| Large arrays `.map()` ไม่มี virtualization | Performance issue |
| Form inputs ไม่มี labels | Accessibility issue |
| Icon buttons ไม่มี `aria-label` | Screen reader issue |
| Hardcoded date/number formats | i18n issue |

---

## ⚡ React Performance Rules (Vercel)

> 📖 **Source:** [vercel-labs/agent-skills/react-best-practices](https://github.com/vercel-labs/agent-skills)

### CRITICAL: Eliminating Waterfalls
```typescript
// ❌ Bad - Waterfall
const patients = await getPatients()
const medicines = await getMedicines()

// ✅ Good - Parallel
const [patients, medicines] = await Promise.all([
  getPatients(),
  getMedicines()
])
```

### CRITICAL: Bundle Size
```typescript
// ❌ Bad - Barrel import
import { Button, Dialog } from '@/components/ui'

// ✅ Good - Direct import
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'

// ✅ Good - Dynamic import for heavy components
const PaymentModal = dynamic(() => import('./payment-modal'))
```

### HIGH: Server-Side Performance
- ใช้ `React.cache()` สำหรับ per-request deduplication
- Minimize data passed to client components

---

## 📋 Enhanced Checklist for New Pages

- [ ] Page header with emoji + title
- [ ] Summary cards if applicable
- [ ] Empty state with emoji
- [ ] Tip text at bottom
- [ ] Drug allergy always visible (red)
- [ ] Format all money with `Intl.NumberFormat` or `formatCurrency()`
- [ ] Format all dates with `Intl.DateTimeFormat`
- [ ] Loading states for buttons (spinner, `…`)
- [ ] Thai error messages with fix/next step
- [ ] Focus states visible (`focus-visible:ring-*`)
- [ ] Form inputs have labels and correct `type`
- [ ] Icon buttons have `aria-label`
- [ ] Images have `width` and `height`
- [ ] No `transition: all`
- [ ] Direct imports (no barrel files)
- [ ] `npm run lint` + `npm run typecheck` pass
