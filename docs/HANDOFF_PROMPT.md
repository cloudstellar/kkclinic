# Handoff Prompt for AI Agent

**Current State:** Sprint 3A Core Implementation Complete  
**Last Updated:** 20 มกราคม 2569  
**Version:** `v0.5.4-sprint3a-core`

---

## ⚠️ Before You Start — REQUIRED READING

1. [docs/AI_RULES.md](AI_RULES.md) — กฎการทำงานกับ AI
2. [docs/ROADMAP.md](ROADMAP.md) — Sprint overview
3. [docs/CHANGE_REQUEST_SPRINT3.md](CHANGE_REQUEST_SPRINT3.md) — **Sprint 3 details (APPROVED)**
4. [.agent/skills/medical-ux/SKILL.md](../.agent/skills/medical-ux/SKILL.md) — **Engineering + UX Standards**

---

## 📊 Current Sprint Status

| Sprint | Status | Description |
|--------|--------|-------------|
| Sprint 1 | ✅ Done | Core foundation |
| Sprint 2A | ✅ Done | Billing, label printing, void |
| Sprint 2B | ✅ Done | DosageSheet UX refactor |
| Sprint 2C | ✅ Done | Workflow documentation |
| **Sprint 3A** | ✅ **Core Done** | TN, Patient Registry, Label |
| Sprint 3B | 🔲 Pending | Reserved Stock, EOD, AutoCalc |

---

## 🎯 Sprint 3A — Implementation Plan (APPROVED)

### Decision Lock

| Feature | Status |
|---------|--------|
| TN format validation | ✅ UI + Server |
| TN DB constraint | ⏳ Deferred (after cleanup) |
| Patient: nationality, postal_code, emergency | ✅ Do |
| Prescription: df, dosage_raw, instruction_language | ✅ Do |
| Label: 10×7.5 cm | ✅ Do |
| Reserved Stock / EOD / AutoCalc | ❌ Sprint 3B only |

### Execution Order

1. Apply DB migration (Supabase Dashboard)
2. Update `src/types/patients.ts`, `prescriptions.ts`
3. Update `patient-form.tsx` + server validation
4. Update `medicine-form.tsx`
5. Update label CSS (10×7.5 cm)
6. Update `DATABASE_SCHEMA.md`
7. Test + verify

---

## 📋 Next Session Quick Start

```markdown
1. อ่าน docs/CHANGE_REQUEST_SPRINT3.md
2. อ่าน .agent/skills/medical-ux/SKILL.md
3. ดู implementation plan ที่ approved
4. เริ่ม Apply DB migration
5. ดำเนินการตาม Execution Order
```

---

## ✅ What Works Now

| Feature | Status |
|---------|--------|
| Patient CRUD + drug allergies | ✅ |
| Medicine/Inventory CRUD | ✅ |
| Prescription with DosageSheet | ✅ |
| Payment modal + cash calc | ✅ |
| Receipt generation | ✅ |
| Label printing (A6, 4 per row) | ✅ |
| Void transactions | ✅ |
| Daily billing summary | ✅ |

---

## 📁 Key Files for Sprint 3A

```
docs/
├── CHANGE_REQUEST_SPRINT3.md   # ⭐ Sprint 3 requirements
├── DATABASE_SCHEMA.md          # Update after migration

src/
├── app/(dashboard)/patients/
│   └── actions.ts              # Add server validation
├── components/forms/
│   ├── patient-form.tsx        # Add TN, nationality, emergency
│   └── medicine-form.tsx       # Add name_en
├── types/
│   ├── patients.ts             # Update type + schema
│   └── prescriptions.ts        # Add df, dosage_raw
└── (label CSS)                 # 10×7.5 cm

.agent/skills/medical-ux/
└── SKILL.md                    # Engineering + UX standards
```

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** Supabase (PostgreSQL)
- **UI:** Tailwind CSS, Shadcn UI
- **Auth:** Supabase Auth

---

## 🏷️ Git Tags

| Tag | Description |
|-----|-------------|
| `v0.5.3-sprint3a-ready` | Sprint 3A plan approved, ready to implement |
| `v0.5.2-sprint3-approved` | Sprint 3 CR approved |
| `v0.5.1-workflow-docs` | Workflow documentation |
| `v0.5.0-sprint2b-dosagesheet` | DosageSheet UX refactor |

---

## ⚡ Key Decisions (Locked)

| Decision | Choice |
|----------|--------|
| Sprint 3 approach | **Option B** (แบ่ง 3A + 3B) |
| TN validation | UI + Server (DB constraint deferred) |
| Nationality | thai / other (no fallback, hard stop) |
| Label size | 10×7.5 cm (Thermal) |
| 3A scope | Data prep only, no workflow change |
| 3B scope | Reserved Stock + EOD + AutoCalc |
