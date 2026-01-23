# Session Note: Sprint 3C — Doctor Fee

**Date**: 24 มกราคม 2569
**Status**: Planning Complete — Ready to Implement
**Branch**: `main`

---

## 🎯 Sprint 3C Goal

เพิ่มค่าธรรมเนียมแพทย์ (Doctor Fee) ในใบสั่งยา

---

## ✅ Design Decisions

| Question | Decision | Reason |
|----------|----------|--------|
| DF location | `prescriptions` table | Standard: 1 visit = 1 fee |
| Fields | `df` (decimal), `df_note` (text) | Simple, direct |
| UI | ในหน้า prescription form | หมอกรอกตอนสั่งยา |
| Receipt | แสดงเป็น line item แยก | ชัดเจนสำหรับคนไข้ |

---

## 📋 Implementation Plan

### Phase 1: Database
```sql
ALTER TABLE prescriptions
ADD COLUMN df DECIMAL(10,2) DEFAULT 0,
ADD COLUMN df_note TEXT;
```

### Phase 2: Prescription Form
- Add DF input (number) + note textarea
- Update total calculation

### Phase 3: Payment & Receipt
- Show DF in payment breakdown
- Print DF line in receipt

---

## ⚠️ ไม่ขัดกับแผนใหญ่

- ใช้ `prescriptions` table ที่มีอยู่แล้ว
- เป็น enhancement ไม่ใช่ breaking change
- รองรับ Sprint 4 (EOD, Billing summary) ได้เลย

---

## 📜 Previous Session (Sprint 3B)

All completed:
- M1-M7: Smart Dosage System ✅
- Commits: `2627f92`, `f5b4ba0`, `73fb0de`, `2ecc0e6`
