# Glossary (พจนานุกรมศัพท์)

## Patient Identifiers
- **TN (Ta Sai Sai Number)**: **Current Primary Identifier**. Format `TN` + 6 digits (e.g., `TN250429`). Manually assigned (not auto-generated). Used for UI, Search, Print, and URL.
- **HN (Hospital Number)**: Legacy identifier. Still exists in DB columns but should **NOT** be used for display or identification in the current workflow.

## Medical & Inventory
- **Prescribe (สั่งยา)**: The act of a doctor selecting medicines for a patient. Creates a `prescription_item`. Status is "Pending".
- **Dispense (จ่ายยา)**: The act of handing medicine to a patient. Status changes to "Completed" and stock is deducted.
- **Medicine Name**: Primary display **MUST** use `medicine.name` (Thai/Brand name). `name_en` is secondary and optional (do not remove column).
- **Dosage Instruction**:
    - **Original**: The shorthand input by doctor (e.g., "1 tab bid").
    - **Snapshot**: The expanded, patient-friendly text (e.g., "รับประทานครั้งละ 1 เม็ด...").
    - **Instruction Snapshot**: Frozen at dispense time and must not change retrospectively.
    - **Instruction Language**: The language of the snapshot (TH/EN).
- **DF (Doctor Fee)**: ค่าธรรมเนียมแพทย์. Stored per-prescription (not per-item). Added in Sprint 3C.

## System Status
- **DoD (Definition of Done)**: The checklist used to verify a task before marking it complete.
- **Decision Lock**: A documented agreement that cannot be changed without a formal Change Request.
