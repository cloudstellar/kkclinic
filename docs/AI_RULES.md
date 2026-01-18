# Antigravity AI Rules

> กฎการทำงานร่วมกับ Antigravity AI สำหรับ KKClinic

---

## 🎯 Core Principle: Plan First

**ทุกครั้งก่อนลงมือโค้ด Antigravity ต้องวางแผนและอัปเดตเอกสารก่อนเสมอ**

---

## 📋 Mandatory Steps (ทำทุกครั้ง)

### 1. Context Summary
- อ่าน `docs/ROADMAP.md` เพื่อเข้าใจสถานะปัจจุบัน
- อ่าน `docs/HANDOFF_PROMPT.md` สำหรับ context ล่าสุด
- ตรวจสอบ ADR ที่เกี่ยวข้องใน `docs/ADR/`

### 2. Definition of Ready (DoR)
ก่อนเขียนโค้ด ต้องมี:
- [ ] Sprint/Issue ID
- [ ] Decision Lock (ทำ/ไม่ทำอะไร)
- [ ] Acceptance Criteria (testable)
- [ ] File/Component plan
- [ ] Risk/Edge cases (อย่างน้อย 3 ข้อ)
- [ ] Verification plan

### 3. Documentation Updates
- อัปเดต `docs/ROADMAP.md` (status, decision lock)
- สร้าง ADR ถ้ามี design decision ใหม่
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

- [ROADMAP.md](ROADMAP.md)
- [WORKFLOW.md](WORKFLOW.md)
- [ADR/](ADR/)
