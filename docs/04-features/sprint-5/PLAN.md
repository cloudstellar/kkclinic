# Sprint 5: Staff Workflow & Audit Trail

**Status:** Planning (Ready for Implementation)  
**Date:** 2025-01-25  
**Depends on:** Sprint 4 (Adjustment), ADR-0003 (RBAC)

---

## Real World Flow (ที่ระบบทำอยู่แล้ว)

```
1. หมอสร้าง Rx
2. หมอกด "ชำระ" (= สรุปเคส, ไม่ใช่รับเงินจริง)
3. หมอพิมพ์ใบเสร็จ+ฉลาก (ส่งให้ staff)
4. Stock ตัด ณ จุดนี้
5. Staff เก็บเงินจริงจากคนไข้ (นอกระบบ)
6. ถ้าคนไข้คืนยา → Staff adjust → Stock คืน
```

**ระบบทำถูกแล้ว — เปลี่ยนแค่ UI naming ให้ตรง real world**

---

## Goals (Locked)

1. `/frontdesk` = Staff default landing
2. Tab: "รอสรุปเคส" / "สรุปเคสแล้ว" + badge count
3. Staff ไม่เห็น `/billing`
4. Guard 3 ชั้น (route + nav + default landing)
5. Void = Admin/Doctor only (staff เห็นสถานะได้ แต่ทำไม่ได้)
6. หน้า Rx มี "ประวัติ"

---

## Phase 1: Done (Sprint 4.5) ✅

- [x] A1: Adjust → dropdown menu
- [x] B2: Void = Admin/Doctor only (UI + server)

---

## Phase 2: `/frontdesk` Route

### 2.1 Create `/frontdesk`

**File:** `app/(dashboard)/frontdesk/page.tsx`

```
/frontdesk
├── Card 1: ผู้ป่วย
│   ├── ค้นหาผู้ป่วย
│   └── ➕ เพิ่มผู้ป่วยใหม่
│
├── Card 2: งานวันนี้
│   ├── Tab: รอสรุปเคส (N) ← badge count
│   │     (prescriptions ที่ยังไม่มี transaction)
│   │
│   └── Tab: สรุปเคสแล้ว (N) ← Staff ทำงานหลัก
│         (transactions วันนี้, รวม void ด้วย)
│         - รายการปกติ: กด → ไปหน้า receipt → adjust ได้
│         - รายการ void: แสดง badge "ยกเลิก" + ไม่มีปุ่ม action
│
└── ❌ ไม่มียอดสรุป
```

**"วันนี้" Definition:**
- Timezone: `Asia/Bangkok`
- Filter: `created_at >= today 00:00`
- Voided items: แสดงแต่มี badge + disabled actions

**Est:** 2h

### 2.2 Guard 3 ชั้น

| Layer | File | Action |
|-------|------|--------|
| Route | `billing/page.tsx` | `if (staff) redirect('/frontdesk')` |
| Nav | `nav/menu` | ซ่อนเมนู billing |
| Default | Login redirect | Staff → `/frontdesk` |

**Est:** 45m

---

## Phase 3: Rx History (Audit Trail)

**File:** `app/(dashboard)/prescriptions/[id]/page.tsx`

### MVP Approach: Merge Existing Data

ไม่ต้องมี event log table — ใช้ data ที่มีอยู่แล้ว:

```typescript
// Merge 3 sources → sort by timestamp
const events = [
  { type: 'created', at: transaction.created_at, label: 'สรุปเคส' },
  ...adjustments.map(a => ({ 
    type: 'adjusted', 
    at: a.created_at, 
    by: a.created_by,
    label: `ปรับปรุง #${a.adjustment_no}`
  })),
  voided_at && { 
    type: 'voided', 
    at: voided_at, 
    by: voided_by, 
    reason: void_reason,
    label: 'ยกเลิก'
  }
].filter(Boolean).sort((a, b) => a.at - b.at)
```

### UI

```tsx
<Card>
  <CardHeader>📋 ประวัติ</CardHeader>
  <CardContent>
    ✅ สรุปเคส: 25 ม.ค. 68 10:30 | RCP250125-001
    🔧 ปรับปรุง #1: 25 ม.ค. 68 11:00 | Staff | ฿500 → ฿400
    ❌ ยกเลิก: 25 ม.ค. 68 12:00 | Doctor | "ผู้ป่วยไม่รับยา"
  </CardContent>
</Card>
```

**Est:** 1.5h

---

## Deferred to Sprint 6 (UI/UX Polish & Bug Fix)

- `collected_at/by` field (เก็บเงินจริง) — ถ้าต้องการ
- Event log table (optional)
- UI/UX polish based on UAT feedback
- Bug fixes from testing

---

## Implementation Order

| # | Task | Est | Status |
|---|------|-----|--------|
| 1 | Adjust → dropdown | 30m | ✅ |
| 2 | Void guard | 30m | ✅ |
| 3 | Guard 3 ชั้น | 45m | ⬜ |
| 4 | Create `/frontdesk` | 2h | ⬜ |
| 5 | Rx history (MVP) | 1.5h | ⬜ |

**Total:** ~5h

---

## Acceptance Criteria

### RBAC (Guard 3 ชั้น)
- [ ] Staff เข้า `/billing` → redirect `/frontdesk`
- [ ] Staff ไม่เห็นเมนู `/billing`
- [ ] Staff เปิด URL ตรงก็เข้าไม่ได้
- [ ] Staff void ไม่ได้ (UI + server) ✅

### `/frontdesk`
- [ ] Tab "รอสรุปเคส" แสดง Rx ที่ไม่มี transaction
- [ ] Tab "สรุปเคสแล้ว" แสดง transactions วันนี้ (รวม void + badge)
- [ ] Badge count แสดงจำนวนรายการ
- [ ] ค้นหา + เพิ่มผู้ป่วยได้
- [ ] Void items: แสดง badge + disabled actions

### Rx History
- [ ] แสดง timeline จาก 3 sources (created, adjusted, voided)
- [ ] เรียงตาม timestamp
- [ ] ถ้าไม่มีประวัติ → empty state
- [ ] Adjust/Void event ขึ้นทันที

---

## Sprint 5 Complete = Ready for UAT

เมื่อ Sprint 5 เสร็จ:
- ระบบพร้อมทดสอบจริง (UAT)
- Staff ใช้งานได้ครบ workflow
- Audit trail ครบ
