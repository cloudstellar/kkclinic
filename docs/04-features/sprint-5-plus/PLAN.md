# Sprint 5+: Doctor Workspace

**Date**: 25 มกราคม 2569
**Status**: 🚧 Ready for Implementation
**ADR**: [0003-role-based-access-control.md](../../02-architecture/ADR/0003-role-based-access-control.md)

---

## Goal

Transform `/prescriptions` from generic list → **Doctor-first Workspace**

---

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| Default = วันนี้ + ของฉัน | Doctor mental model |
| Search = all-time + all doctors | Medical record audit |
| ซ่อนยอดเงิน | หมอไม่คิดเป็นเงิน |
| Status = clinical terminology | แยกขาดจาก Dispensing |

---

## Implementation Checklist

### 1. Query Logic (`actions.ts`)

```typescript
const isSearchMode = Boolean(options?.search || options?.status)

const todayOnly = isSearchMode
  ? false
  : options?.todayOnly ?? true

const doctorId = isSearchMode
  ? undefined
  : options?.doctorId ?? currentUser.id
```

### 2. UI Changes (`page.tsx`)

| Change | Before | After |
|--------|--------|-------|
| Column ยอดรวม | Visible | Hidden |
| Status | รอจ่ายยา | ยังไม่สรุปเคส |
| Status | จ่ายแล้ว | สรุปเคสแล้ว |
| Placeholder | ค้นหาเลขใบสั่งยา... | ค้นหา RX / ชื่อ (ย้อนหลังได้) |

---

## Verification

- [ ] Default: วันนี้ + ของฉัน only
- [ ] Search: all-time + all doctors
- [ ] No money column
- [ ] Clinical status labels
- [ ] No tabs, no action buttons

---

## Definition of Done (DoD)

Sprint นี้ถือว่า "**เสร็จ**" เมื่อครบทุกข้อด้านล่าง:

### 1) Correctness & Behavior

- [ ] Default load ของ `/prescriptions` แสดง **เฉพาะวันนี้ + ของหมอปัจจุบัน** (`todayOnly=true, doctorId=currentUser`)
- [ ] เมื่อ **มี search หรือ status filter** → ระบบสลับเป็น Search mode (`todayOnly=false, doctorId=undefined`) โดยอัตโนมัติ
- [ ] Search mode สามารถค้นหา **ย้อนหลังได้ทุกวัน** และเห็น **ของทุกหมอ** (แม้ตอนนี้มีหมอคนเดียว)
- [ ] Badge/Stats ที่แสดงคำว่า "วันนี้" ต้องนับจาก today range จริง (timezone ถูกต้อง) และ **สอดคล้องกับ query**

### 2) UI/UX (Doctor-first)

- [ ] ตาราง **ไม่แสดงคอลัมน์ "ยอดรวม"** (หมอไม่เห็นเงินใน index)
- [ ] Label สถานะเปลี่ยนเป็น **ภาษาคลินิก**:
  - "ยังไม่สรุปเคส"
  - "สรุปเคสแล้ว"
- [ ] ช่องค้นหาใช้ placeholder: **"ค้นหา RX / ชื่อ (ย้อนหลังได้)"**
- [ ] หน้านี้ **ไม่มี tabs** และ **ไม่มี action buttons** ที่เป็น staff workflow (เช่น จ่ายเงิน/adjust/จ่ายยา)

### 3) Separation from Dispensing (ไม่ซ้ำบทบาท)

- [ ] `/prescriptions` เป็น **informational workspace** เท่านั้น (view/list/navigation)
- [ ] Workflows แบบ operational (เก็บเงินจริง/ปรับยา/คืน stock) อยู่ใน Dispensing เท่านั้น
- [ ] ไม่มี UI element ที่ทำให้เข้าใจว่าเป็นหน้า "จ่ายยา" (เช่นคำว่า "รอจ่ายยา/จ่ายแล้ว")

### 4) Documentation

- [ ] อัปเดต **ADR-0003** เพิ่ม section "Doctor Workspace vs Staff Dispensing" พร้อมข้อความหลัก:
  > "Prescription Index… awareness vs workflow gate"
- [ ] Sprint doc นี้ (Sprint 5+) ถูก commit เข้า repo ในตำแหน่งเอกสารมาตรฐานของโปรเจกต์

### 5) Quality Gate (กันพัง)

- [ ] ผ่าน `npm run lint` และ `npm run typecheck`
- [ ] มีการทดสอบ manual อย่างน้อย **3 เคส**:
  1. เข้า `/prescriptions` ใหม่ → เห็นเฉพาะวันนี้ + ของฉัน
  2. พิมพ์ค้นหา → เห็นย้อนหลัง + ของทุกหมอ
  3. ล้าง search → กลับไปวันนี้ + ของฉัน
- [ ] ไม่มี regression ในหน้า Dispensing (สองแท็บยังทำงานเหมือนเดิม)

---

## Not in Scope

- Resume Last Case (Sprint 6)
- Keyboard shortcuts (Sprint 6)
- Draft protection hints (Sprint 6)
