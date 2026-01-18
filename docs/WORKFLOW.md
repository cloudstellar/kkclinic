# KKClinic Development Workflow

> Definition of Ready (DoR) และขั้นตอนการพัฒนา

---

## 🎯 Definition of Ready (DoR)

ก่อนเริ่มโค้ดทุกครั้ง งานต้องมีข้อมูลครบถ้วนดังนี้:

### Required Checklist

- [ ] **Sprint/Issue ID** - ระบุ sprint (เช่น Sprint 2B) หรือ issue number
- [ ] **Decision Lock** - สิ่งที่จะทำ/ไม่ทำ ชัดเจน
- [ ] **Acceptance Criteria** - เงื่อนไขที่ต้องผ่านเพื่อถือว่าเสร็จ (testable)
- [ ] **File/Component Plan** - รายการไฟล์ที่จะ เพิ่ม/แก้ไข/ลบ
- [ ] **Risk/Edge Cases** - อย่างน้อย 3 ข้อ
- [ ] **Verification Plan** - ขั้นตอน manual test

---

## 📋 DoR Template

```markdown
## Sprint: [Sprint ID]

### Decision Lock
| Feature | Status |
|---------|--------|
| [Feature A] | ✅ Do |
| [Feature B] | ❌ Don't |

### Acceptance Criteria
1. [ ] เมื่อ [action] แล้ว [expected result]
2. [ ] [testable condition]

### File Plan
- [NEW] `src/components/xxx.tsx` - description
- [MODIFY] `src/app/page.tsx` - description
- [DELETE] `src/old-file.tsx`

### Risk/Edge Cases
1. [Edge case 1]
2. [Edge case 2]
3. [Edge case 3]

### Verification Plan
1. [ ] Test step 1
2. [ ] Test step 2
```

---

## 🔄 Development Flow

```
1. Plan     → อัปเดต ROADMAP.md, สร้าง ADR (ถ้ามี decision ใหม่)
2. DoR      → เติม checklist ให้ครบก่อนเขียนโค้ด
3. Develop  → เขียนโค้ดตาม plan
4. Verify   → Test ตาม verification plan
5. Document → อัปเดต docs, สร้าง walkthrough
6. Commit   → PR พร้อม checklist ครบ
```

---

## 📝 Commit Convention

```
<type>(<scope>): <subject>

Types:
- feat     : feature ใหม่
- fix      : bug fix
- refactor : refactor โค้ด (ไม่เปลี่ยน behavior)
- docs     : documentation
- chore    : maintenance tasks

Examples:
- feat(prescription): add dosage sheet component
- fix(billing): correct void transaction stock reversal
- docs(roadmap): update sprint 2B status
```

---

## 🏷️ Tagging Convention

```
v{major}.{minor}.{patch}-{sprint}-{feature}

Examples:
- v0.5.0-sprint2b-dosagesheet
- v0.4.0-sprint2a
- v1.0.0 (production release)
```

---

## 📚 Related Documents

- [ROADMAP.md](ROADMAP.md) - Sprint overview
- [ADR/](ADR/) - Architecture Decision Records
- [AI_RULES.md](AI_RULES.md) - Antigravity prompt policy
