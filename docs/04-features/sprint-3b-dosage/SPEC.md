# COMPLETE SPEC: Doctor Instruction → Patient-Friendly Instruction
**Project**: KKClinic – Ophthalmology

> [!IMPORTANT]
> **Tech Stack Compliance**: This feature must be implemented in compliance with `docs/01-constitution/TECH_STACK.md`. If this spec suggests a pattern conflicting with the Tech Stack, the Tech Stack takes precedence.

**Version**: 1.0 (LOCKED)
**Status**: APPROVED
**Scope**: Production-ready (Sprint 3B)

---

## 1. OBJECTIVE

*   **Speed**: ให้แพทย์พิมพ์คำสั่งยาได้เร็ว ด้วยภาษาแพทย์ (Shorthand)
*   **Clarity**: ให้คนไข้เห็นคำแนะนำการใช้ยาเป็น "ภาษาคน" เข้าใจง่าย
*   **Safety**: ลด error จากการสื่อสาร และไม่พึ่ง AI (Deterministic & Auditable)

---

## 2. CORE PRINCIPLES (Rules of Engagement)

1.  **Doctor instruction = Source of Truth**: เก็บสิ่งที่หมอพิมพ์เสมอ ห้ามแก้ไขโดยอัตโนมัติ
2.  **No Guessing**: ระบบทำหน้าที่ "แปล" ไม่ใช่ "ตัดสินใจแทน" สิ่งที่แปลไม่ได้ต้องแสดงตามเดิม
3.  **Visual Confirmation**: แพทย์ต้องเห็น Preview ผลลัพธ์ก่อนบันทึกทุกครั้ง
4.  **Snapshot Policy**: ค่าที่แปลแล้ว (Translated text) จะถูกสร้างและบันทึก ณ เวลาที่ Save (Save-time) และจะ **ไม่ถูก re-translate** เมื่อ Dictionary เปลี่ยนแปลง

> **Note**: Terminology in this spec follows definitions in `docs/05-reference/GLOSSARY.md`.

---

## 3. SCOPE

### 3.1 Included
*   Medical shorthand input processing
*   Rule-based translation engine
*   Ophthalmology-specific dictionary
*   Real-time patient preview
*   Safety warnings (Unknown tokens)
*   Print-ready output (Label & Dosage sheet)

### 3.2 Excluded (Future)
*   AI/NLP interpretation (No LLMs)
*   Auto medical decision / Diagnosis-based suggestion
*   Drug-specific instruction hard-coding (Use generic logic first)

---

## 4. DETAILED SPECIFICATIONS

### 4.1 Doctor Input
*   **Format**: Free text, Case-insensitive, Whitespace tolerant.
*   **Recommended Structure**: `[quantity] [dosage form] [site] [frequency] [condition] [duration]`
*   **Example**: `1 gtt OU qid pc`

### 4.2 Medical Shorthand Dictionary (Initial Set - Top 20)
*See attached Dictionary Master File (to be defined in implementation)*
*   **Forms**: `gtt` (หยด), `tab` (เม็ด), `cap` (แคปซูล), `PO` (รับประทาน)
*   **Sites**: `OU` (ตาทั้งสองข้าง), `OD` (ตาขวา), `OS` (ตาซ้าย)
*   **Frequencies**: `qd`, `bid`, `tid`, `qid`, `q4h`, `HS`
*   **Conditions**: `ac`, `pc`, `prn`, `stat`
*   **Durations**: `x 5 d`, `x 7 d`, `x 14 d`

### 4.3 Translation Engine Logic
1.  **Normalize**: Trim, collapse spaces.
2.  **Tokenize**: Split by whitespace (smart split for numeric+unit).
3.  **Lookup**: Map tokens against frozen dictionary version.
4.  **Fallback**: Unknown tokens allowed -> Keep original text.
5.  **Construct**: Apply sentence templates (e.g., "Quantity + Form" -> "ครั้งละ X Y").

---

## 5. STRICT POLICIES (Added Constraints)

### 5.1 Dictionary Versioning
*   **Policy**: v1.0 dictionary is **frozen** upon release.
*   **Change Management**: Adding new tokens requires a version bump (v1.1).
*   **No Retroactive Changes**: Historical data must **never** be re-translated using new dictionaries (handled by Snapshot Policy).

### 5.2 Translation Snapshot Policy
*   **Rule**: `dosage_instruction` (User-friendly text) is generated **once** at the moment of saving.
*   **Storage**: Stored as an immutable snapshot in the database.
*   **Audit**: `dosage_original` (Doctor's raw input) is stored alongside for audit trails.
*   **Display**: Read-only display uses the snapshot; Editing re-triggers translation from raw input.

### 5.3 Warning Severity Levels
To prevent validation fatigue, warnings are categorized:
1.  **Informational (Yellow)**: Unknown tokens found. System will display them as-is. (Non-blocking)
2.  **Critical (Red)**: Empty output or no actionable instruction detected. (Blocking or Require confirmation)

---

## 6. UX REQUIREMENTS

*   **Layout**: 2-Pane Editor. Top: Doctor Input (Editable). Bottom: Live Preview (Read-only).
*   **Presets**: Token-based buttons (click adds text `bid`, not translation).
*   **Disclaimer**: "Please verify patient instruction before saving."

---

## 7. DATABASE SPEC (Minimum Requirement)

| Table | Column | Type | Note |
| :--- | :--- | :--- | :--- |
| `prescription_items` | `dosage_original` | text | Raw shorthand (Source of Truth) |
| `prescription_items` | `dosage_instruction` | text | Translated Snapshot (Printed) |
| `prescription_items` | `dictionary_version` | text | e.g., "1.0" |

---

**FINAL LOCK STATEMENT**
This specification defines the authoritative behavior of *Doctor Instruction → Patient-Friendly Instruction* for KKClinic Ophthalmology system. Any future change must be versioned explicitly.
