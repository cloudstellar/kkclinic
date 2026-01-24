# Semantic Glossary

> เอกสารนี้กำหนด "คำศัพท์มาตรฐาน" ที่ใช้ในโปรเจค เพื่อป้องกันความสับสน

---

## 📄 Document Types

| Term | Thai | Description | Source Table | Has `receipt_no`? |
|------|------|-------------|--------------|-------------------|
| **PrepaySummary** | ใบสรุปค่าใช้จ่าย | เอกสารก่อนชำระเงิน (ยังปรับได้) | `prescriptions` | ❌ No |
| **Receipt** | ใบเสร็จรับเงิน | เอกสารหลังชำระเงิน (immutable) | `transactions` | ✅ Yes |

---

## 🛣️ Routes

| Route | Document Type | ID Type |
|-------|--------------|---------|
| `/billing/documents/prepay/[id]` | PrepaySummary | `prescription_id` |
| `/billing/documents/receipt/[id]` | Receipt | `transaction_id` |

> [!NOTE]
> Legacy route `/billing/receipt/[id]` ถูกลบแล้ว (ไม่มี production data)

---

## 📊 Status Flow

| Status | ความหมาย | Document ที่แสดง |
|--------|----------|-----------------|
| `pending` | รอ Staff ยืนยัน | PrepaySummary |
| `confirmed` | ยืนยันแล้ว รอชำระเงิน | PrepaySummary |
| `paid` | ชำระเงินแล้ว | Receipt |

---

## 🏷️ Naming Convention

### Code Files
| เดิม | ใหม่ | เหตุผล |
|------|-----|--------|
| `receipt-view.tsx` | `billing-document-view.tsx` | รองรับทั้ง PrepaySummary และ Receipt |

### Database Columns (ไม่เปลี่ยน!)
| Column | Table | ยังคงใช้ |
|--------|-------|---------|
| `receipt_no` | `transactions` | ✅ (มีเฉพาะหลังชำระเงิน) |

> [!CAUTION]
> **ห้ามใช้คำว่า `receipt` ในโค้ดเพื่อหมายถึง PrepaySummary!**
> 
> - ❌ `getReceipt(prescriptionId)` — ผิด!
> - ✅ `getPrepaySummary(prescriptionId)` — ถูก!
> - ✅ `getReceipt(transactionId)` — ถูก!

---

## � UI Label Lock (ห้ามเปลี่ยน!)

| Mode | UI Label | ห้ามใช้ |
|------|----------|--------|
| `prepay` | **ใบสรุปค่าใช้จ่าย** | ❌ ใบเสร็จ, สรุปรายการ, etc. |
| `receipt` | **ใบเสร็จรับเงิน** | ❌ ใบสรุป, ใบแจ้งหนี้, etc. |

---

## 📋 Type Definition (Required)

```typescript
/**
 * BillingDocumentMode - ใช้กำหนด mode ของ billing document
 * 'prepay' = ใบสรุปค่าใช้จ่าย (จาก prescriptions)
 * 'receipt' = ใบเสร็จรับเงิน (จาก transactions)
 */
type BillingDocumentMode = 'prepay' | 'receipt'
```

---

## �🔗 Related

- [ADR-0002: Reserved Stock Workflow](../02-architecture/ADR/0002-reserved-stock-workflow.md)
- [Sprint 4 PLAN.md](../04-features/sprint-4/PLAN.md)
