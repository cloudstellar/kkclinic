# Handoff Prompt for AI Agent

**Current State:** Sprint 3A+ In Progress  
**Last Updated:** 20 มกราคม 2569  
**Version:** `feature/sprint-3a` @ `3b914bf`

---

## ⚠️ CRITICAL: TN Standardization

**Patient Identifier = TN only**
- ❌ ไม่ใช้ HN ในที่ใดเลย
- DB column ยังเป็น `hn` ได้ชั่วคราว
- UI / URL / sort / search / print = **TN**

---

## 📊 Sprint Status

| Sprint | Status |
|--------|--------|
| Sprint 3A | ✅ Done |
| **Sprint 3A+** | 🔄 In Progress |
| Sprint 3B | 🔲 Pending |

---

## 🎯 Sprint 3A+ Progress

### ✅ Part 1: Bug Fixes (DONE)

Commit `3b914bf`:
- `lib/patient-utils.ts` - `getDisplayName()`
- `lib/date-utils.ts` - BE auto-detect

### 🔄 Part 2: UX Improvements (PENDING)

**PR-UX-01:**
- [ ] Real-time filter (debounce 300ms, `?q=`)
- [ ] Sortable tables (`?sort=&order=`)

**PR-UX-02:**
- [ ] Foreign name in dropdowns
- [ ] Nav highlight (`?from=billing`)
- [ ] **TN Standardization (HN → TN)**

---

## 📋 Next Session

```
1. อ่าน HANDOFF_PROMPT.md
2. เริ่ม PR-UX-01: Filter + Sort
3. ใช้ TN แทน HN ทุกจุด
4. Server map: tn → hn temporarily
```

---

## ⚡ Decision Lock

| Decision | Choice |
|----------|--------|
| Patient ID | **TN only** |
| Filter | debounce 300ms + URL |
| Sort | server-side via URL |
| Nav fix | Approach B (query param) |
