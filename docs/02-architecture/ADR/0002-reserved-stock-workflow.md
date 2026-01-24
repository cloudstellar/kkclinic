# ADR-0002: Pre-Payment Adjustment + Transaction Adjustments

**Date**: 2026-01-24 (Updated)  
**Status**: Accepted (Replaces Reserved Stock Workflow)  
**Deciders**: Owner (หมอ), AI Assistant

---

## Context

### ปัญหาเดิม
- Staff อาจต้องลดจำนวนยาหรือติ๊กออก (หมดสต็อก, คนไข้ไม่ต้องการ)
- ไม่มีวิธีแก้ไขหลังชำระเงินแล้ว (ต้อง void ทั้งใบ)

### ทางเลือกที่พิจารณา

| Option | Description | ความซับซ้อน |
|--------|-------------|-------------|
| A. Reserved Stock Model | เพิ่ม status flow + reserved_qty | สูง |
| **B. Pre-Payment Adjustment** | ติ๊กก่อนชำระ + ปรับหลังชำระ | **ต่ำ** ✅ |

### Decision
เลือก **Option B** เพราะ:
- ไม่ต้องเพิ่ม status field ใน prescriptions
- ไม่ต้องเพิ่ม reserved_qty ใน medicines
- ใช้ flow เดิม (หมอกด "ชำระ" → deduct stock ทันที)
- เพิ่ม `transaction_adjustments` table สำหรับปรับหลังชำระ

---

## Solution

### 1. Pre-Payment Tick-Off (ก่อนชำระ)

- Payment Modal: ติ๊ก "ไม่เอา" + ลด qty ได้
- กด "ชำระ" = สร้าง transaction_items ตาม effective items เท่านั้น

### 2. Post-Payment Adjustment (หลังชำระ)

- ปุ่ม "ปรับปรุงรายการ" ใน receipt page
- ลด/ติ๊กออกได้เท่านั้น (ห้ามเพิ่ม)
- สร้าง adjustment record (ไม่แก้ทับ original)
- Restore stock ตาม diff

### 3. Database Schema

```sql
CREATE TABLE transaction_adjustments (
  id UUID PRIMARY KEY,
  transaction_id UUID REFERENCES transactions(id),
  adjustment_no INT NOT NULL,
  items_delta JSONB NOT NULL,
  amount_delta NUMERIC NOT NULL,
  previous_total NUMERIC NOT NULL,
  new_total NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES users(id),
  UNIQUE(transaction_id, adjustment_no)
);
```

### 4. Guardrails

| Rule | Description |
|------|-------------|
| Atomic RPC | Lock + validate + restore + insert ใน transaction เดียว |
| unit_price จาก base | ห้ามใช้ราคาปัจจุบันจาก medicines |
| ห้ามเพิ่ม | new_qty <= effective_qty เสมอ |
| Void disable | voided_at IS NULL ก่อน allow adjustment |
| Diff จาก latest | คำนวณจากสถานะล่าสุด กันคืนซ้ำ |

---

## Consequences

### ข้อดี
- ✅ ไม่รื้อ flow เดิม
- ✅ Audit-friendly (adjustment records)
- ✅ ลดเคสต้อง void ทั้งใบ

### ข้อเสีย
- ❌ ต้องเพิ่ม table ใหม่ 1 อัน
- ❌ ต้องเขียน RPC function

---

## Related
- [Implementation Plan](file:///Users/cloud/.gemini/antigravity/brain/032cda3b-9261-478b-aff7-a895532fd74a/implementation_plan.md)
