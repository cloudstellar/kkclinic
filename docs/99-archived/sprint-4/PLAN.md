# Sprint 4: Naming & Semantics Clean

> Status: 🔲 Planning  
> Target Start: TBD  
> Estimated Time: 1-2 days

---

## 🎯 Goal

**หยุดความงง** — ทำให้ชื่อ/route/ศัพท์ ตรงความหมาย 100%  
เพื่อให้ Sprint 5 implement workflow ได้แบบไม่สับสน

> [!IMPORTANT]
> Sprint 4 นี้ **ไม่แตะ DB schema** เลย  
> Migration จะทำใน Sprint 5 พร้อมกับ workflow

> [!WARNING]
> **Sprint 4 keeps legacy payment behavior:**
> - Clicking the payment button still **deducts stock immediately** (เหมือนเดิม)
> - Semantic changes are **UI-only** (routes, names, labels)
> - **New reserve logic starts in Sprint 5** — ห้ามแก้ stock logic ใน Sprint 4!

---

## 📋 Scope Overview

| Task | Description | Risk |
|------|-------------|------|
| **Routes ใหม่** | 2 routes แยก prepay/receipt | 🟢 Low |
| **Rename component** | `receipt-view` → `billing-document-view` | 🟢 Low |
| **Semantic terms** | Lock คำศัพท์ PrepaySummary / Receipt | 🟢 Low |
| **Glossary** | สร้าง SEMANTIC_GLOSSARY.md | 🟢 Low |
| **Grep check** | กำจัด "receipt" ที่หมายถึง prepay | 🟢 Low |

---

## �️ Routes ใหม่

```
/billing/documents/prepay/[prescription_id]   → PrepaySummary (ใบสรุปค่าใช้จ่าย)
/billing/documents/receipt/[transaction_id]   → Receipt (ใบเสร็จรับเงิน)
```

**Route เก่า:**
```
/billing/receipt/[id]  → ลบทิ้งได้เลย (ไม่มี production data)
```

---

## 🏷️ Component Rename

| เดิม | ใหม่ |
|------|-----|
| `receipt-view.tsx` | `billing-document-view.tsx` |
| Props ที่เกี่ยวข้อง | ปรับให้ใช้ semantic terms |

**Component รองรับ 2 modes:**
```typescript
<BillingDocumentView 
  mode="prepay" 
  prescriptionId={id} 
/>

<BillingDocumentView 
  mode="receipt" 
  transactionId={id} 
/>
```

---

## 📚 Semantic Terms (Lock!)

| Term | Thai | Source Table | Has `receipt_no`? |
|------|------|--------------|-------------------|
| **PrepaySummary** | ใบสรุปค่าใช้จ่าย | `prescriptions` | ❌ |
| **Receipt** | ใบเสร็จรับเงิน | `transactions` | ✅ |

> [!CAUTION]
> **ห้ามใช้คำว่า `receipt` เพื่อหมายถึง PrepaySummary!**
> 
> - ❌ `getReceipt(prescriptionId)` — ผิด!
> - ✅ `getPrepaySummary(prescriptionId)` — ถูก!
> - ✅ `getReceipt(transactionId)` — ถูก!

---

## 🔍 Grep Check

ค้นหาและแก้ไขทุกที่ที่ใช้คำผิด:

```bash
# ค้นหา "receipt" ใน billing domain
grep -r "receipt" src/app/\(dashboard\)/billing/
grep -r "Receipt" src/components/
```

ต้องตรวจสอบว่าทุกที่ที่ใช้ `receipt` หมายถึง transactions จริงๆ

---

## ❌ Out of Scope for Sprint 4

| สิ่งที่ไม่ทำ | ทำเมื่อไหร่ |
|------------|----------|
| **DB Migration** | Sprint 5 |
| Staff Confirmation UI | Sprint 5 |
| Stock Reserve/Deduct | Sprint 5 |
| Status flow | Sprint 5 |
| Reporting | Sprint 5 |
| UX improvements | Sprint 6 |

---

## ✅ Sprint 4 Complete DoD

### Routes
- [ ] `/billing/documents/prepay/[prescription_id]` ทำงานได้
- [ ] `/billing/documents/receipt/[transaction_id]` ทำงานได้
- [ ] Route เก่า `/billing/receipt/[id]` ลบแล้ว

### Semantic Naming
- [ ] `billing-document-view.tsx` created with Semantic Contract comment
- [ ] **Semantic Contract ใน 2 จุด**: (ไม่ใช่แค่ไฟล์เดียว!)
  - [ ] `billing-document-view.tsx` (component)
  - [ ] Route handler ของ `/billing/documents/*`
  ```typescript
  /**
   * SEMANTIC CONTRACT:
   * - mode="prepay" → uses prescription_id, no receipt_no (ใบสรุปค่าใช้จ่าย)
   * - mode="receipt" → uses transaction_id, has receipt_no (ใบเสร็จรับเงิน)
   */
  ```

### Type Definition (กันหลุด)
- [ ] สร้าง type กลาง:
  ```typescript
  type BillingDocumentMode = 'prepay' | 'receipt'
  ```

### Grep Check (ต้องเป็นศูนย์!)
- [ ] Run: `grep -r "receipt" src/app/(dashboard)/billing/`
- [ ] ผลลัพธ์: **เหลือเฉพาะ `receipt` ที่หมายถึง Receipt จริงเท่านั้น**
- [ ] ไม่มี `receipt` ที่หมายถึง prepay summary

### UI Labels
- [ ] prepay UI = "ใบสรุปค่าใช้จ่าย"
- [ ] receipt UI = "ใบเสร็จรับเงิน"

### Final Checks
- [ ] `npm run lint` ผ่าน
- [ ] `npm run typecheck` ผ่าน

---

## 🧪 Sanity Check (เช็คหลัง merge Sprint 4)

| Check | Expected |
|-------|----------|
| เปิด `/billing/documents/prepay/...` | ไม่เจอคำว่า "receipt" ใน UI |
| เปิด `/billing/documents/receipt/...` | เห็น `receipt_no` |
| `grep receipt` ใน repo | เหลือแค่ Receipt จริง |
| `billing-document-view.tsx` | มี comment contract ชัด |

---

## 🔗 Related

- [ADR-0002: Reserved Stock Workflow](../../02-architecture/ADR/0002-reserved-stock-workflow.md)
- [Sprint 5 PLAN.md](../sprint-5/PLAN.md) — DB Migration + Workflow
- [SEMANTIC_GLOSSARY.md](../../05-reference/SEMANTIC_GLOSSARY.md)
