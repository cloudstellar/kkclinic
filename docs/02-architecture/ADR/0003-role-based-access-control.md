# ADR 0003: Role-Based Access Control for Billing & Dispensing

**Status:** Proposed  
**Date:** 2025-01-25  
**Context:** Sprint 4 complete, Sprint 5 planning

## Decision

### Access Control Matrix

| Route / Action | Admin | Doctor | Staff |
|----------------|-------|--------|-------|
| `/billing` (สรุปรายวัน) | ✅ | ❌ | ❌ |
| `/dispensing` (รายการจ่ายยา) | ✅ | ✅ (read-only) | ✅ |
| `/prescriptions/[id]` (รายละเอียด) | ✅ | ✅ | ✅ |
| Receipt view | ✅ | ✅ | ✅ |
| Payment (ชำระเงิน) | ✅ | ❌ | ✅ |
| Adjust (ปรับปรุงรายการ) | ✅ | ❌ | ✅ |
| Void (ยกเลิก) | ✅ | ✅ | ❌ |

### UI Changes

1. **"ปรับปรุงรายการ" button** → ย้ายไปอยู่ในเมนู "⋯ เพิ่มเติม" (dropdown)
2. **Void button** → ซ่อนสำหรับ staff

### Guards

- Route guards: Redirect unauthorized access
- Server action guards: Return error for unauthorized calls
- UI guards: Hide buttons based on role

## Consequences

- Staff ทำงานจ่ายยาได้คล่องขึ้น ไม่เห็นข้อมูลทางการเงินรวม
- ลดความเสี่ยงจากการ void โดยไม่ได้รับอนุญาต
- UI เรียบง่ายขึ้นสำหรับ staff

## Related

- Sprint 5 Plan: `/docs/04-features/sprint-5/PLAN.md`
