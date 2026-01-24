# Semantic Glossary

> เอกสารนี้กำหนด "คำศัพท์มาตรฐาน" ที่ใช้ในโปรเจค เพื่อป้องกันความสับสน

---

## 📄 Document Types

| Term | Thai | Description |
|------|------|-------------|
| **Receipt** | ใบเสร็จรับเงิน | เอกสารหลังชำระเงิน (transactions) |
| **Adjusted Receipt** | ใบเสร็จฉบับปรับปรุง | Receipt ที่มี adjustment แล้ว |

---

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| `transactions` | Base receipt data (immutable) |
| `transaction_items` | Line items (immutable base) |
| `transaction_adjustments` | Revision records (new) |

---

## 📊 Adjustment Concept

| Term | Description |
|------|-------------|
| **Base items** | รายการ ณ ตอนชำระ (transaction_items) |
| **Adjustment** | การปรับลด (ไม่แก้ทับ original) |
| **Effective items** | Base items − sum(adjustments) |

---

## 🏷️ UI Labels

| Context | Label |
|---------|-------|
| ปุ่มชำระ | "ชำระเงิน" |
| หัวใบเสร็จ | "ใบเสร็จรับเงิน" |
| ใบเสร็จที่ปรับแล้ว | "ใบเสร็จฉบับปรับปรุง #N" |
| ปุ่มปรับ | "ปรับปรุงรายการ" |

---

## ⚠️ Naming Rules

| ✅ ถูก | ❌ ผิด |
|--------|--------|
| `adjustReceipt()` | `editReceipt()` |
| `transaction_adjustments` | `receipt_edits` |
| "ปรับปรุงรายการ" | "แก้ไข" |

---

## 🔗 Related

- [ADR-0002: Pre-Payment Adjustment](../02-architecture/ADR/0002-reserved-stock-workflow.md)
