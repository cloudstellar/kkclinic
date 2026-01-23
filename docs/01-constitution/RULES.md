# Antigravity AI Rules

> กฎการทำงานร่วมกับ Antigravity AI สำหรับ KKClinic

---

## 🎯 Core Principle: Plan First

**ทุกครั้งก่อนลงมือโค้ด Antigravity ต้องวางแผนและอัปเดตเอกสารก่อนเสมอ**

---

## 🛑 0. Golden Rule: User Confirmation (กฎเหล็ก)

**"Never Start Without Approval"**

1.  **Stop**: ก่อนเริ่มงานใหม่, เปลี่ยน Milestone, หรือข้าม Task boundary
2.  **Ask**: ต้องถาม User เสมอว่า "ให้เริ่มทำ [Task X] เลยไหมครับ?"
3.  **Wait**: ห้าม assume หรือ auto-proceed (แม้ว่าแผนจะชัดเจนแล้วก็ตาม) ต้องรอ User พิมพ์ "Start", "Ok", "ลุย" ก่อนเท่านั้น

## 🧱 0.1 Tech Stack Compliance

1.  **Strict Adherence**: All code must comply with `docs/01-constitution/TECH_STACK.md`.
2.  **Precedence**: If a conflict exists between a Feature Spec and the Tech Stack, **TECH_STACK.md takes precedence**.

## 💀 0.2 Lessons Learned Compliance

1.  **Non-Negotiable**: `docs/01-constitution/LESSONS_LEARNED.md` defines non-negotiable constraints derived from past failures.
2.  **Zero Violation**: Violations of these rules are **NOT ALLOWED** under any circumstances.

---

## 📋 Mandatory Steps (ทำทุกครั้ง)

### 1. Context Summary
- อ่าน `docs/05-reference/ROADMAP.md` เพื่อเข้าใจสถานะปัจจุบัน
- อ่าน `docs/HANDOFF_PROMPT.md` สำหรับ context ล่าสุด
- ตรวจสอบ ADR ที่เกี่ยวข้องใน `docs/02-architecture/ADR/`

### 2. Definition of Ready (DoR)
ก่อนเขียนโค้ด ต้องมี:
- [ ] Sprint/Issue ID
- [ ] Decision Lock (ทำ/ไม่ทำอะไร)
- [ ] Acceptance Criteria (testable)
- [ ] File/Component plan
- [ ] Risk/Edge cases (อย่างน้อย 3 ข้อ)
- [ ] Verification plan

### 3. Documentation Updates
- อัปเดต `docs/05-reference/ROADMAP.md` (status, decision lock)
- สร้าง ADR ถ้ามี design decision ใหม่ใน `docs/02-architecture/ADR/`
- อัปเดต `docs/HANDOFF_PROMPT.md` หลังเสร็จงาน

### 4. Commit Properly
- ใช้ conventional commits
- Tag ตาม sprint convention
- Push พร้อม tags

---

## 🔄 Workflow Mode

```
PLANNING → EXECUTION → VERIFICATION
```

### PLANNING Mode
- วิจัย codebase
- ออกแบบ solution
- สร้าง implementation_plan.md
- รอ user approve ก่อนเริ่มโค้ด

### EXECUTION Mode
- เขียนโค้ดตาม plan
- กลับไป PLANNING ถ้าพบ complexity ใหม่

### VERIFICATION Mode
- Test ตาม verification plan
- สร้าง walkthrough.md
- Commit และ tag

---

## 📝 ADR Template

เมื่อมี design decision สำคัญ สร้าง ADR ใน `docs/ADR/`:

```markdown
# ADR-XXXX: [Title]

> **Status:** Proposed | Accepted | Deprecated
> **Date:** YYYY-MM-DD
> **Sprint:** [Sprint ID]

## Context
[ปัญหาหรือความต้องการ]

## Decision
[สิ่งที่ตัดสินใจทำ]

## Options Considered
### Option A (❌ Rejected)
### Option B (✅ Selected)

## Consequences
### Positive
### Negative
### Technical
```

---

## ⚠️ Don'ts

- ❌ อย่าเริ่มโค้ดโดยไม่มี DoR
- ❌ อย่า assume ว่า codebase ไม่เปลี่ยน - ตรวจสอบก่อนเสมอ
- ❌ อย่าข้ามการ test ก่อน commit
- ❌ อย่าลืม tag
- ❌ อย่าสร้าง decision ใหม่โดยไม่บันทึก ADR
- ❌ **Schema Change = Type Check** อย่าแก้ DB schema โดยไม่ grep หา type usage ทั้ง repo (Sprint 3C lesson)

---

## 🚀 Quick Start Prompt

คัดลอก prompt นี้ไปใช้ทุกครั้งเริ่มงานใหม่:

```
ก่อนเริ่มโค้ด:
1. อ่าน docs/ROADMAP.md และ docs/HANDOFF_PROMPT.md
2. สร้าง implementation plan พร้อม DoR checklist
3. รอ approve ก่อนเริ่มโค้ด
4. ถ้ามี design decision ใหม่ → สร้าง ADR
5. หลังเสร็จ → อัปเดตเอกสาร + tag
```

---

## 📚 Related

- [ROADMAP.md](../05-reference/ROADMAP.md)
- [WORKFLOW.md](../02-architecture/WORKFLOW.md)
- [ADR/](../02-architecture/ADR/)
