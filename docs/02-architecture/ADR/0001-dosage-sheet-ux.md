# ADR-0001: DosageSheet UX Design

> **Status:** Accepted  
> **Date:** 2026-01-19  
> **Sprint:** 2B  
> **Tag:** `v0.5.0-sprint2b-dosagesheet`

---

## Context

ระบบใบสั่งยาต้องการให้ผู้ใช้กรอก "วิธีใช้ยา" สำหรับแต่ละรายการยาเพื่อพิมพ์ลงฉลาก เดิมใช้ Popover + Textarea ซึ่งมีปัญหา:

1. **พื้นที่จำกัด** - Popover เล็ก ใช้งานยากบน mobile
2. **ไม่มี recent history** - ต้องพิมพ์ซ้ำทุกครั้ง
3. **ไม่มี feedback** - ไม่รู้ว่าข้อความยาวเกินฉลากหรือไม่

---

## Decision

เปลี่ยนจาก Popover เป็น **Bottom Sheet** พร้อมฟีเจอร์:

1. **Recent chips** - จาก localStorage (per user)
2. **Preset chips** - วิธีใช้มาตรฐาน (ยากิน, ยาหยอด, ยาทา)
3. **Copy from previous** - คัดลอกจากรายการก่อนหน้า
4. **Length badge** - แสดงสถานะความยาว (สั้น/กลาง/ยาว)
5. **Keyboard shortcuts** - Cmd+Enter บันทึก, Esc ยกเลิก

---

## Options Considered

### Option A: Enhanced Popover (❌ Rejected)
- ขยาย popover เดิม + เพิ่ม chips
- **ปัญหา:** ยังเล็กเกินไปบน mobile, ไม่รองรับ multiline ดี

### Option B: Inline Expand (❌ Rejected)
- ขยาย cell ในตาราง
- **ปัญหา:** Layout shift, ซับซ้อน

### Option C: Bottom Sheet (✅ Selected)
- Sheet เต็มหน้าจอครึ่งล่าง
- **ข้อดี:** พื้นที่เพียงพอ, mobile-friendly, pattern ที่ผู้ใช้คุ้นเคย

---

## Consequences

### Positive
- ✅ UX ดีขึ้นมาก โดยเฉพาะ mobile
- ✅ Recent history ลดการพิมพ์ซ้ำ
- ✅ Copy from previous เร็วขึ้นมากสำหรับ multi-item
- ✅ Length badge ป้องกันข้อความยาวเกิน

### Negative
- ⚠️ Extra click เปิด sheet (vs inline edit)
- ⚠️ localStorage ไม่ sync ข้าม device

### Technical
- เพิ่ม 3 components: `DosageInstructionSheet`, `DosageDisplay`, `useRecentInstructions`
- ลบ component เดิม: `DosageInput`
- State เปลี่ยนจาก index-based เป็น id-based (`openSheetItemId`)

---

## Related

- [ROADMAP.md](../ROADMAP.md) - Sprint 2B
- [DosageInstructionSheet](../../src/components/prescription/dosage-instruction-sheet.tsx)
- [useRecentInstructions](../../src/hooks/use-recent-instructions.ts)
