# Handoff Prompt for AI Agent

**Current State:** Production-ready for basic clinic workflow  
**Last Updated:** 19 มกราคม 2569  
**Version:** `v0.5.1-workflow-docs`

---

## ⚠️ Before You Start — REQUIRED READING

1. [docs/AI_RULES.md](AI_RULES.md) — กฎการทำงานกับ AI
2. [docs/ROADMAP.md](ROADMAP.md) — Sprint overview + decision locks
3. [docs/WORKFLOW.md](WORKFLOW.md) — Definition of Ready (DoR)

---

## 📊 Current Sprint Status

| Sprint | Status | Tag |
|--------|--------|-----|
| Sprint 1 | ✅ Done | Core foundation |
| Sprint 2A | ✅ Done | Billing, label printing, void |
| Sprint 2B | ✅ Done | DosageSheet UX refactor |
| Sprint 3 | 🔲 Pending decision | See options below |

---

## ✅ What Works Now

| Feature | Status |
|---------|--------|
| Patient CRUD + search + drug allergies | ✅ |
| Medicine/Inventory CRUD | ✅ |
| Prescription creation with DosageSheet | ✅ |
| Payment modal with cash calculation | ✅ |
| Receipt generation | ✅ |
| Label printing (A6, 4 per row) | ✅ |
| Void transactions with stock reversal | ✅ |
| Daily billing summary | ✅ |
| Frequently used medicines search | ✅ |
| Recent dosage instructions (localStorage) | ✅ |

---

## 🔲 Pending User Decision: Full Clinic Flow

User กำลังพิจารณา flow:
```
ห้องตรวจ → เคาน์เตอร์ชำระเงิน → ห้องยา
```

**Options:**
- **Option A:** ใช้ระบบปัจจุบัน (Prescription → Payment → Dispense)
- **Option B:** เพิ่ม Service Charges (ค่าแพทย์, หัตถการ, Lab)
- **Option C:** Full Flow (Visit + OPD Note + Services + Draft Charges)

รอ user ตัดสินใจก่อนเริ่ม Sprint 3

---

## 📁 Key Directories

```
docs/
├── ROADMAP.md          # Sprint overview
├── WORKFLOW.md         # Definition of Ready
├── AI_RULES.md         # AI prompt policy
├── ADR/                # Architecture Decision Records
│   └── 0001-dosage-sheet-ux.md
├── HANDOFF_PROMPT.md   # This file
├── PRD.md              # Product requirements
├── DATABASE_SCHEMA.md  # DB schema
├── IMPLEMENTATION_PLAN.md
├── KNOWLEDGE_BASE.md
└── SPRINT_2A.md

src/
├── components/
│   ├── prescription/
│   │   ├── dosage-instruction-sheet.tsx  # ⭐ New in 2B
│   │   └── dosage-display.tsx            # ⭐ New in 2B
│   └── payment/
│       └── payment-modal.tsx
├── hooks/
│   └── use-recent-instructions.ts        # ⭐ New in 2B
└── lib/
    └── clinic-config.ts
```

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** Supabase (PostgreSQL)
- **UI:** Tailwind CSS, Shadcn UI
- **Auth:** Supabase Auth

---

## 📋 Quick Start for Next Session

```markdown
1. อ่าน docs/ROADMAP.md
2. อ่าน docs/AI_RULES.md  
3. ถาม user: "ตัดสินใจเรื่อง Full Clinic Flow แล้วหรือยัง?"
4. ถ้า user ตัดสินใจแล้ว → สร้าง implementation plan ตาม Option ที่เลือก
5. ถ้ายังไม่ตัดสินใจ → รอ หรือถามว่ามีงานอื่นที่ต้องทำไหม
```

---

## 🏷️ Git Tags

| Tag | Description |
|-----|-------------|
| `v0.5.1-workflow-docs` | Current - workflow documentation |
| `v0.5.0-sprint2b-dosagesheet` | DosageSheet UX refactor |
| `v0.4.0-sprint2a` | Billing, labels, void |
