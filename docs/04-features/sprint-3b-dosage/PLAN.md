# Implementation Plan: Sprint 3B – Smart Dosage System

**Goal**: แปลง "ภาษาหมอ (shorthand)" → "ภาษาคนไข้" อย่างปลอดภัย  
**Version**: 1.0 (FINAL – LOCKED)  
**Last Updated**: 22 มกราคม 2569

---

> [!IMPORTANT]
> **Tech Stack Compliance**: This implementation must strictly follow `docs/01-constitution/TECH_STACK.md`.

---

## 🔐 Core Principles (LOCKED)

| Principle | Description |
|-----------|-------------|
| **Doctor Review = Review Snapshot** | หมอตรวจข้อความที่จะพิมพ์จริงบนฉลาก |
| **Preview = ฉลากจริง** | สิ่งที่เห็นใน Preview = สิ่งที่พิมพ์ |
| **Single Language per Snapshot** | Snapshot เก็บภาษาเดียว (`th` หรือ `en`) |
| **Internal = Original Only** | Summary Sheet ใช้ภาษาหมอ |
| **No Guessing** | ระบบแปล ไม่ตัดสินใจแทน |
| **Server Authoritative** | Server เป็นผู้ตัดสิน version/translation |
| **Snapshot Frozen** | ไม่ re-translate เมื่อ dictionary เปลี่ยน |
| **Doctor Override Allowed** | หมอแก้ไข snapshot ได้เอง |

---

## 1. Database Schema Updates (FINAL)

### [MODIFY] `prescription_items` table

| Field | Type | Description |
|-------|------|-------------|
| `dosage_original` | text | Raw shorthand จากหมอ (Source of Truth / Internal) |
| `dosage_instruction` | text | Snapshot ภาษาคน (ใช้พิมพ์ฉลาก) |
| `dosage_language` | text | ภาษาของ snapshot (`'th'` \| `'en'`) |
| `dictionary_version` | text | `NULL` \| `'legacy'` \| `'1.0'` |

### Field Semantics (Strict)

| `dictionary_version` | Meaning |
|----------------------|---------|
| `NULL` | ไม่มีการกรอกวิธีใช้ยา |
| `'legacy'` | ข้อมูลเก่า / manual / ไม่ผ่าน engine |
| `'1.0'` | ผ่าน Smart Dosage Engine v1.0 |

### Save-time Rules (Server – LOCKED)

```
IF dosage_original is blank/empty:
  → ALL fields = NULL

ELSE IF dictionary_version = 'legacy':
  → dosage_original required
  → dosage_instruction, dosage_language optional

ELSE IF dictionary_version = '1.0':
  → ALL fields required (original, instruction, language)
```

### DB CHECK Constraints (FINAL)

```sql
-- Allowlist for dictionary_version (prevents typos)
ALTER TABLE prescription_items
ADD CONSTRAINT chk_dictionary_version_values CHECK (
  dictionary_version IS NULL OR
  dictionary_version IN ('legacy', '1.0')
);

-- Allowlist for dosage_language
ALTER TABLE prescription_items
ADD CONSTRAINT chk_dosage_language_values CHECK (
  dosage_language IS NULL OR
  dosage_language IN ('th', 'en')
);

-- Data integrity constraint
ALTER TABLE prescription_items
ADD CONSTRAINT chk_dosage_integrity CHECK (
  -- Case 1: NULL = No instruction
  (
    dictionary_version IS NULL AND
    dosage_original IS NULL AND
    dosage_instruction IS NULL AND
    dosage_language IS NULL
  )
  OR
  -- Case 2: legacy = migrated/manual (instruction optional)
  (
    dictionary_version = 'legacy' AND
    dosage_original IS NOT NULL
  )
  OR
  -- Case 3: v1.0 = engine-generated (all required)
  (
    dictionary_version = '1.0' AND
    dosage_original IS NOT NULL AND
    dosage_instruction IS NOT NULL AND
    dosage_language IS NOT NULL
  )
);
```

### Migration Strategy (Backfill)

```sql
-- Step 1: Backfill existing data
UPDATE prescription_items
SET
  dosage_original = NULLIF(TRIM(dosage_instruction), ''),
  dictionary_version = CASE
    WHEN NULLIF(TRIM(dosage_instruction), '') IS NULL THEN NULL
    ELSE 'legacy'
  END,
  dosage_instruction = NULL,
  dosage_language = NULL
WHERE dosage_original IS NULL;

-- Step 2: Add constraints (after backfill)
-- (See above)

-- Step 3: Optional index for reporting
CREATE INDEX idx_prescription_items_dict_version 
ON prescription_items(dictionary_version);
```

### Legacy Fallback Rule (LOCKED)

> เมื่อพิมพ์ฉลากสำหรับ `legacy` data ที่ `dosage_instruction = NULL`:  
> → ใช้ `dosage_original` แทน (แสดงภาษาหมอบนฉลาก)

---

## 2. Engine Implementation (CORE – FINAL)

### [NEW] `src/lib/dosage/types.ts`

```typescript
type Token = {
  value: string
  type: 'quantity' | 'form' | 'site' | 'frequency' | 'condition' | 'duration' | 'punctuation' | 'unknown'
}

type TranslationResult = {
  lines: string[]              // Plain text (no markup)
  unknownTokens: string[]      // Ordered unique
  dictionaryVersion: '1.0'
}
```

**Unknown Token Definition (Deterministic)**:
- ไม่ใช่ number (digits only)
- ไม่ใช่ duration pattern (`x <n> d`)
- ไม่อยู่ใน dictionary (case-insensitive lookup)
- ไม่ใช่ punctuation-only
- **Preserve casing ตาม input** (normalize space เท่านั้น)

**`unknownTokens` Contract**: Ordered unique (คงลำดับ, ไม่ซ้ำ)

### [NEW] `src/lib/dosage/dictionary-v1.ts`

- Frozen constant map v1.0
- Categories: Form, Site, Frequency, Condition, Duration
- `export const DICT_VERSION = '1.0' as const`

### [NEW] `src/lib/dosage/tokenizer.ts`

**Normalization**:
1. Trim input
2. Collapse whitespace → 1 space
3. Replace newlines with spaces

**Token Split**:
1. Split by whitespace
2. Punctuation separation: `bid,` → `["bid", ","]`
3. Numeric separation: `2tab` → `["2", "tab"]`
4. Duration joined: `x7d` → `["x", "7", "d"]`

**Case-Insensitive Lookup**: `ou` matches `OU`

### [NEW] `src/lib/dosage/engine.ts`

```typescript
translate(input: string, lang: 'th' | 'en'): TranslationResult
```

**Output Ordering (Strict)**:
1. Site + Quantity/Form
2. Frequency (+ Condition)
3. Duration

**Unknown Token Append Rule**: ต่อท้าย frequency line (หรือ line สุดท้ายที่มี)

**Fallback**: ถ้า infer ไม่ได้ → คืนบรรทัดเดียว = normalized input

---

## 3. Doctor Override Policy (LOCKED)

### 🔐 กติกาการแก้ไข

| Field | แก้ได้? | หมายเหตุ |
|-------|---------|----------|
| `dosage_original` | ✅ | แก้แล้ว engine จะ translate ใหม่ |
| `dosage_instruction` | ✅ | แก้แล้ว engine **ต้องไม่เขียนทับ** |

### Rules (LOCKED)

1. **หมอแก้ได้เฉพาะ snapshot** — `dosage_original` ไม่ถูกแก้โดยอัตโนมัติ
2. **Override = Final** — เมื่อหมอแก้ snapshot → engine ห้ามเขียนทับ
3. **Re-translate เฉพาะกรณี**:
   - หมอแก้ `dosage_original`
   - หมอเปลี่ยนภาษาฉลาก (`dosage_language`)
4. **Print ใช้ข้อความที่หมอแก้จริง** — ไม่มี auto-correct

### UX Recommendation (Silent Feedback)

- Preview เป็น **editable ตลอดเวลา** (ไม่ต้องกดปุ่ม)
- แสดงข้อความเล็กๆ ใต้ preview บอก state:
  - **Auto**: `ระบบแปลอัตโนมัติ — แก้ไขได้`
  - **Override**: `แพทย์แก้ไขข้อความเอง`
- ❌ ไม่มีปุ่มแก้ไข / ไม่ต้องเด่น
- ✅ Silent feedback ให้หมอรู้ state โดยไม่รบกวน flow

> [!IMPORTANT]
> **Override Reset Rule**: Reset override ต้องเป็น event-based เท่านั้น (เมื่อ user แก้ `draftOriginal` หรือ `lang`) **ห้ามใช้ broad `useEffect`** ที่ผูกกับ `draftOriginal` เพราะจะทำให้ state flip-flop

---

## 4. UI Implementation (FINAL)

### [MODIFY] `src/components/prescription/dosage-instruction-sheet.tsx`

**Split View**:
- **Top**: Textarea = `dosage_original` (editable)
- **Bottom**: Preview = engine result หรือ doctor override (ภาษาเดียว)

**Presets**: Insert shorthand tokens (ไม่ใส่ประโยคเต็ม)

**Debounce**: 300ms debounced translate call

**Warnings/Highlight**:
- ❌ ไม่มี modal/toast
- ✅ Unknown tokens highlight เฉพาะใน Preview (underline/สีอ่อน)
- ✅ Preview ต้อง render เสมอ (ไม่ blank/ไม่ crash)
- ✅ Save ได้ (non-blocking) เว้นแต่ server fail

**Preview Language Policy (LOCKED)**:
- Preview แสดงภาษาเดียว = ภาษาฉลากที่จะพิมพ์
- หากเปลี่ยนภาษา → re-translate → ต้อง Save ใหม่ก่อนพิมพ์

**Token-Aware Highlighting**:
- Reuse tokenizer เดียวกับ engine
- Case-sensitive match ตาม spec

> [!IMPORTANT]
> **Preview Highlight Implementation**: ใช้ **overlay rendering** (highlight layer + transparent textarea) เพราะ `<textarea>` ไม่สามารถ render `<span>` tags ได้

---

## 5. Integration (FINAL)

### [MODIFY] `src/app/(dashboard)/prescriptions/actions.ts`

**Save Fields**:
- `dosage_original`
- `dosage_instruction` (snapshot)
- `dosage_language`
- `dictionary_version`

**Authority**:
- Server translate ต่างจาก client → ใช้ server result
- **ยกเว้น** ถ้า client ส่ง doctor override → ใช้ client result

**Failure Behavior**:
- Garbage input: **ไม่ถือว่า fail** → save snapshot = normalized input
- Translation failure (throw/empty): reject 400, ไม่ write partial
- Transaction: fail 1 รายการ → rollback ทั้ง prescription

---

## 6. Medicine Summary Sheet (FINAL)

### Template: Thermal 10×7.5cm

**Data Source (LOCKED)**:
| Document | Uses |
|----------|------|
| ฉลากยา (Label) | `dosage_instruction` |
| ใบสรุปรายการยา (Summary) | `dosage_original` |

**Pagination Rule (LOCKED)**:
- Max **11 items/page**
- ถ้าเกิน 11 → **ขึ้นหน้าใหม่อัตโนมัติ**
- ❌ ไม่ truncate / ไม่ merge / ไม่ใส่ "และอีก n รายการ"
- ลำดับรายการต้องคงเดิมข้ามหน้า

**Print CSS Font Stack**:
```css
@media print {
  .medicine-summary {
    font-family: 'Noto Sans Thai', sans-serif;
  }
}
```

**UI**: Checkbox "พิมพ์ใบสรุปรายการยา" ใน Label Print View

---

## 7. Verification Plan (FINAL)

### Unit Tests

| Test Case | Input | Expected |
|-----------|-------|----------|
| Happy path | `1 gtt OU bid` | Full sentence |
| Mixed input | `1 gtt OU and sleep` | Unknown preserved |
| Numeric join | `2tab` → `["2","tab"]` | Split correct |
| Case-insensitive | `ou` = `OU` | Same result |
| Whitespace tolerance | `1  gtt   OU` | Normalized |
| Duration joined | `x7d` | Parsed correct |
| Punctuation | `bid,` | `bid` + `,` separated |
| Duplicate unknown | `asdf asdf` | `["asdf"]` unique |
| Only frequency | `bid` | `วันละ 2 ครั้ง` |
| Only site | `OU` | `ตาทั้งสองข้าง` |

### Manual Verification

- [ ] Migration: ข้อมูลเก่าโหลดได้
- [ ] Editor: พิมพ์ shorthand → preview realtime
- [ ] Garbage: preview ไม่ crash
- [ ] Save/Load: reload แล้ว `dosage_original` กลับมาถูก
- [ ] Doctor Override: แก้ snapshot → save → reload → ยังเป็นค่าที่แก้
- [ ] Print Label: ใช้ `dosage_instruction`
- [ ] Summary Sheet: ใช้ `dosage_original`
- [ ] Summary pagination: 11 รายการ/หน้า, รายการที่ 12 ขึ้นหน้าใหม่

---

## 8. Milestones (Test-Driven Breakdown)

| M | Task | Done When... | Artifacts |
|---|------|--------------|-----------|
| **M1** | DB Migration + Types | Migration applied, `npm run typecheck` ผ่าน | Migration SQL, types |
| **M2** | Tokenizer | Test: `"2tab"` → `["2","tab"]` | `tokenizer.ts` + tests |
| **M3** | Dictionary v1.0 | Test: lookup `OU` คืนค่าถูก | `dictionary-v1.ts` + tests |
| **M4** | Engine | Test: `"1 gtt OU bid"` ได้ข้อความถูก | `engine.ts` + tests |
| **M5** | UI 2-Pane Preview | Manual: พิมพ์แล้ว preview อัปเดต | Updated sheet |
| **M6** | Integration + Override | Save → reload → fields ครบ, override works | Updated actions |
| **M7** | Summary Sheet | Print uses original + 11/page + page break | Template |

---

## 9. Final DoD + Acceptance Criteria (FINAL)

### Schema & Integrity
- [ ] มี `dosage_original`, `dosage_instruction`, `dosage_language`, `dictionary_version`
- [ ] CHECK constraints enforce: NULL triple, legacy, or v1.0 complete
- [ ] Existing data migrated: `dictionary_version='legacy'`
- [ ] ถ้า `dictionary_version='1.0'` แล้ว instruction/language เป็น NULL → save fail (400)

### Engine
- [ ] Tokenizer: numeric separation + punctuation separation + duration joined
- [ ] Unknown tokens: deterministic + preserve casing + ordered unique
- [ ] Dictionary v1 frozen
- [ ] Strict line ordering
- [ ] Partial translation works (only-freq, only-site)

### UI
- [ ] 2-pane editor (Editor/Preview)
- [ ] Preview เป็น editable ตลอดเวลา (no mode switch)
- [ ] แสดง silent feedback ใต้ preview บอก state (auto/override)
- [ ] Preview ตามภาษาฉลากที่จะพิมพ์
- [ ] Unknown highlight ใน preview เท่านั้น (token-aware)
- [ ] ไม่มี modal/toast/edit button
- [ ] Preview never blank/crash

### Doctor Override
- [ ] แพทย์สามารถแก้ `dosage_instruction` ได้เอง
- [ ] เมื่อแพทย์แก้ snapshot → engine ต้องไม่เขียนทับ
- [ ] ฉลากพิมพ์ใช้ข้อความที่แพทย์แก้จริงเสมอ

### Printing
- [ ] Label uses `dosage_instruction` (fallback to `dosage_original` for legacy)
- [ ] Summary Sheet uses `dosage_original` เท่านั้น
- [ ] Summary: 11 items/page + automatic page break

---

**This document constitutes the authoritative DoD for Sprint 3B.**
