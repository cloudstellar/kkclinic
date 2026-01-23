# Handoff Prompt for AI Agent

**Current State:** Sprint 3C — Doctor Fee UI Fixes (WIP)
**Last Updated:** 24 มกราคม 2569 @ 00:10
**Version:** `main`

---

## ⚠️ CRITICAL: Read These First

1. `docs/01-constitution/RULES.md`
2. `docs/01-constitution/TECH_STACK.md`
3. `docs/NEXT_SESSION.md` (Detailed pending tasks)

---

## 🚧 CURRENT TASK: Sprint 3C UI Fixes

User requested fixes for Doctor Fee feature. Some are done, some pending.

### ✅ Completed
- **Prescription Form**: Added DF Note Presets (chips)
- **Receipt View**: Simplified DF layout (Single line + small text)

### 🛑 PENDING (Do these NEXT)
1. **Prescription View**: (`src/app/(dashboard)/prescriptions/[id]/page.tsx`)
   - แสดง Doctor Fee ในหน้าดูรายละเอียด
2. **Dispensing/Payment**: (`src/app/(dashboard)/dispensing/[id]/page.tsx` & `payment-modal.tsx`)
   - แสดง Doctor Fee ก่อนชำระเงิน
3. **Summary Sheet**: (`src/components/prescription/medicine-summary-sheet.tsx`)
   - เอา "check mark" (กล่องสี่เหลี่ยม) ออกจากบรรทัด DF

---

## 🧪 Verification
- สร้างใบสั่งยา (เลือก preset DF Note)
- ดูหน้า View -> ต้องเห็น DF
- หน้า Payment -> ต้องเห็น DF Breakdown
- Print Label -> Summary Sheet บรรทัด DF ต้องไม่มี checkbox

---

## 🛑 REMEMBER: Golden Rule

**NEVER start work without User approval.**
Ask: "ให้เริ่มทำ [Task] เลยไหมครับ?" and wait for confirmation.
