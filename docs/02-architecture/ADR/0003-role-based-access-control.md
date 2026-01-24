# ADR 0003: Role-Based Access Control for Billing & Dispensing

**Status:** Accepted  
**Date:** 2025-01-25  
**Context:** Sprint 4 complete, Sprint 5 planning

## Context

> **Doctor role** ในระบบนี้หมายถึง **แพทย์เจ้าของคลินิก (Owner)** ไม่ใช่ associate physician

### Real World Flow

```
1. หมอสร้าง Rx
2. หมอกด "ชำระ" (= สรุปเคส, ไม่ใช่รับเงินจริง)
3. หมอพิมพ์ใบเสร็จ+ฉลาก (ส่งให้ staff)
4. Stock ตัด ณ จุดนี้
5. Staff เก็บเงินจริงจากคนไข้
6. ถ้าคนไข้คืนยา → Staff adjust → Stock คืน
```

## Decision

### Access Control Matrix

| Route / Action | Admin | Doctor | Staff |
|----------------|-------|--------|-------|
| `/billing` (สรุปรายวัน) | ✅ | ✅ (เจ้าของ) | ❌ → redirect `/frontdesk` |
| `/frontdesk` (งานหน้าบ้าน) | ✅ | ✅ | ✅ (default landing) |
| `/prescriptions/[id]` | ✅ | ✅ | ✅ |
| Receipt view | ✅ | ✅ | ✅ |
| Payment/สรุปเคส | ✅ | ✅ | ❌ (หมอทำ) |
| Adjust (ปรับรายการ) | ✅ | ✅ | ✅ |
| Void (ยกเลิก) | ✅ | ✅ | ❌ |

> **Adjust = Reduce / Remove only** — ห้ามเพิ่ม qty, ห้ามเพิ่มรายการ, ห้ามแก้ราคา

### Staff Default Landing = `/frontdesk`

```
/frontdesk
├── Card 1: ผู้ป่วย
│   ├── ค้นหาผู้ป่วย
│   └── ➕ เพิ่มผู้ป่วยใหม่
│
├── Card 2: งานวันนี้
│   ├── Tab: รอสรุปเคส (Rx ที่หมอยังไม่กด)
│   └── Tab: สรุปเคสแล้ว (transactions วันนี้) ← Staff ทำงานหลัก
│
└── ❌ ไม่มียอดสรุป
```

### UI Changes

1. **"ปรับปรุงรายการ"** → เมนู "⋯ เพิ่มเติม"
2. **Void** → ซ่อนสำหรับ staff
3. **Nav** → ซ่อน `/billing` สำหรับ staff

### Guards

- Route guards: Redirect unauthorized
- Server action guards: Return error
- UI guards: Hide buttons/menus

### Data Enforcement (Server-side)

> Adjust validated at server (`createAdjustment`):
> - `new_qty ≤ effective_qty` (ห้ามเพิ่ม)
> - `new_qty ≥ 0` (ห้ามติดลบ)
> - ห้ามเพิ่มรายการใหม่
> - ห้ามแก้ราคา (ใช้ unit_price จาก base snapshot)

> Void:
> - Staff เห็นสถานะ void ได้ (read-only badge "ยกเลิก")
> - Staff ทำ void ไม่ได้ (UI + server guard)

## Consequences

- Staff ทำงานได้ครบที่หน้าเดียว
- ไม่เห็นข้อมูลทางการเงินรวม
- ลดความเสี่ยงจากการ void โดยไม่ได้รับอนุญาต

## Related

- Sprint 4: `/docs/04-features/sprint-4-adjustment/PLAN.md`
- Sprint 5: `/docs/04-features/sprint-5/PLAN.md`
