export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            medicines: {
                Row: {
                    code: string
                    created_at: string | null
                    description: string | null
                    id: string
                    is_active: boolean | null
                    is_demo: boolean | null
                    min_stock: number | null
                    name: string
                    price: number
                    stock_qty: number
                    unit: string
                    updated_at: string | null
                }
                Insert: {
                    code: string
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    is_active?: boolean | null
                    is_demo?: boolean | null
                    min_stock?: number | null
                    name: string
                    price?: number
                    stock_qty?: number
                    unit?: string
                    updated_at?: string | null
                }
                Update: {
                    code?: string
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    is_active?: boolean | null
                    is_demo?: boolean | null
                    min_stock?: number | null
                    name?: string
                    price?: number
                    stock_qty?: number
                    unit?: string
                    updated_at?: string | null
                }
                Relationships: []
            }
            patients: {
                Row: {
                    address: string | null
                    birth_date: string | null
                    created_at: string | null
                    created_by: string | null
                    drug_allergies: string | null
                    gender: string | null
                    hn: string
                    id: string
                    id_card: string | null
                    is_demo: boolean | null
                    name: string
                    notes: string | null
                    phone: string
                    underlying_conditions: string | null
                    updated_at: string | null
                }
                Insert: {
                    address?: string | null
                    birth_date?: string | null
                    created_at?: string | null
                    created_by?: string | null
                    drug_allergies?: string | null
                    gender?: string | null
                    hn: string
                    id?: string
                    id_card?: string | null
                    is_demo?: boolean | null
                    name: string
                    notes?: string | null
                    phone: string
                    underlying_conditions?: string | null
                    updated_at?: string | null
                }
                Update: {
                    address?: string | null
                    birth_date?: string | null
                    created_at?: string | null
                    created_by?: string | null
                    drug_allergies?: string | null
                    gender?: string | null
                    hn?: string
                    id?: string
                    id_card?: string | null
                    is_demo?: boolean | null
                    name?: string
                    notes?: string | null
                    phone?: string
                    underlying_conditions?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "patients_created_by_fkey"
                        columns: ["created_by"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                ]
            }
            prescription_items: {
                Row: {
                    created_at: string | null
                    dosage_instruction: string | null
                    id: string
                    item_type: string
                    medicine_id: string | null
                    note: string | null
                    prescription_id: string
                    price_override: number | null
                    procedure_name: string | null
                    quantity: number
                    unit_price: number
                }
                Insert: {
                    created_at?: string | null
                    dosage_instruction?: string | null
                    id?: string
                    item_type?: string
                    medicine_id?: string | null
                    note?: string | null
                    prescription_id: string
                    price_override?: number | null
                    procedure_name?: string | null
                    quantity?: number
                    unit_price?: number
                }
                Update: {
                    created_at?: string | null
                    dosage_instruction?: string | null
                    id?: string
                    item_type?: string
                    medicine_id?: string | null
                    note?: string | null
                    prescription_id?: string
                    price_override?: number | null
                    procedure_name?: string | null
                    quantity?: number
                    unit_price?: number
                }
                Relationships: [
                    {
                        foreignKeyName: "prescription_items_medicine_id_fkey"
                        columns: ["medicine_id"]
                        isOneToOne: false
                        referencedRelation: "medicines"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "prescription_items_prescription_id_fkey"
                        columns: ["prescription_id"]
                        isOneToOne: false
                        referencedRelation: "prescriptions"
                        referencedColumns: ["id"]
                    },
                ]
            }
            prescriptions: {
                Row: {
                    cancelled_reason: string | null
                    completed_at: string | null
                    created_at: string | null
                    doctor_id: string
                    id: string
                    note: string | null
                    patient_id: string
                    prescription_no: string
                    status: string
                    total_price: number | null
                    updated_at: string | null
                }
                Insert: {
                    cancelled_reason?: string | null
                    completed_at?: string | null
                    created_at?: string | null
                    doctor_id: string
                    id?: string
                    note?: string | null
                    patient_id: string
                    prescription_no: string
                    status?: string
                    total_price?: number | null
                    updated_at?: string | null
                }
                Update: {
                    cancelled_reason?: string | null
                    completed_at?: string | null
                    created_at?: string | null
                    doctor_id?: string
                    id?: string
                    note?: string | null
                    patient_id?: string
                    prescription_no?: string
                    status?: string
                    total_price?: number | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "prescriptions_doctor_id_fkey"
                        columns: ["doctor_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "prescriptions_patient_id_fkey"
                        columns: ["patient_id"]
                        isOneToOne: false
                        referencedRelation: "patients"
                        referencedColumns: ["id"]
                    },
                ]
            }
            stock_logs: {
                Row: {
                    change_type: string
                    changed_by: string
                    created_at: string | null
                    id: string
                    medicine_id: string
                    notes: string | null
                    quantity_after: number
                    quantity_before: number
                    quantity_change: number
                    reference_id: string | null
                    reference_type: string | null
                }
                Insert: {
                    change_type: string
                    changed_by: string
                    created_at?: string | null
                    id?: string
                    medicine_id: string
                    notes?: string | null
                    quantity_after: number
                    quantity_before: number
                    quantity_change: number
                    reference_id?: string | null
                    reference_type?: string | null
                }
                Update: {
                    change_type?: string
                    changed_by?: string
                    created_at?: string | null
                    id?: string
                    medicine_id?: string
                    notes?: string | null
                    quantity_after?: number
                    quantity_before?: number
                    quantity_change?: number
                    reference_id?: string | null
                    reference_type?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "stock_logs_changed_by_fkey"
                        columns: ["changed_by"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "stock_logs_medicine_id_fkey"
                        columns: ["medicine_id"]
                        isOneToOne: false
                        referencedRelation: "medicines"
                        referencedColumns: ["id"]
                    },
                ]
            }
            transaction_items: {
                Row: {
                    amount: number
                    created_at: string | null
                    id: string
                    item_type: string
                    medicine_id: string | null
                    procedure_name: string | null
                    quantity: number
                    transaction_id: string
                    unit_price: number
                }
                Insert: {
                    amount?: number
                    created_at?: string | null
                    id?: string
                    item_type?: string
                    medicine_id?: string | null
                    procedure_name?: string | null
                    quantity?: number
                    transaction_id: string
                    unit_price?: number
                }
                Update: {
                    amount?: number
                    created_at?: string | null
                    id?: string
                    item_type?: string
                    medicine_id?: string | null
                    procedure_name?: string | null
                    quantity?: number
                    transaction_id?: string
                    unit_price?: number
                }
                Relationships: [
                    {
                        foreignKeyName: "transaction_items_medicine_id_fkey"
                        columns: ["medicine_id"]
                        isOneToOne: false
                        referencedRelation: "medicines"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "transaction_items_transaction_id_fkey"
                        columns: ["transaction_id"]
                        isOneToOne: false
                        referencedRelation: "transactions"
                        referencedColumns: ["id"]
                    },
                ]
            }
            transactions: {
                Row: {
                    created_at: string | null
                    discount: number | null
                    id: string
                    notes: string | null
                    paid_at: string | null
                    patient_id: string
                    payment_method: string | null
                    prescription_id: string | null
                    receipt_no: string
                    request_id: string | null
                    staff_id: string
                    status: string | null
                    subtotal: number
                    total_amount: number
                    vat_amount: number | null
                    vat_included: boolean | null
                    void_reason: string | null
                    voided_at: string | null
                    voided_by: string | null
                }
                Insert: {
                    created_at?: string | null
                    discount?: number | null
                    id?: string
                    notes?: string | null
                    paid_at?: string | null
                    patient_id: string
                    payment_method?: string | null
                    prescription_id?: string | null
                    receipt_no: string
                    request_id?: string | null
                    staff_id: string
                    status?: string | null
                    subtotal?: number
                    total_amount?: number
                    vat_amount?: number | null
                    vat_included?: boolean | null
                    void_reason?: string | null
                    voided_at?: string | null
                    voided_by?: string | null
                }
                Update: {
                    created_at?: string | null
                    discount?: number | null
                    id?: string
                    notes?: string | null
                    paid_at?: string | null
                    patient_id?: string
                    payment_method?: string | null
                    prescription_id?: string | null
                    receipt_no?: string
                    request_id?: string | null
                    staff_id?: string
                    status?: string | null
                    subtotal?: number
                    total_amount?: number
                    vat_amount?: number | null
                    vat_included?: boolean | null
                    void_reason?: string | null
                    voided_at?: string | null
                    voided_by?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "transactions_patient_id_fkey"
                        columns: ["patient_id"]
                        isOneToOne: false
                        referencedRelation: "patients"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "transactions_prescription_id_fkey"
                        columns: ["prescription_id"]
                        isOneToOne: false
                        referencedRelation: "prescriptions"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "transactions_staff_id_fkey"
                        columns: ["staff_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "transactions_voided_by_fkey"
                        columns: ["voided_by"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                ]
            }
            users: {
                Row: {
                    created_at: string | null
                    email: string
                    full_name: string
                    id: string
                    is_active: boolean | null
                    is_demo: boolean | null
                    last_login_at: string | null
                    phone: string | null
                    role: string
                    updated_at: string | null
                }
                Insert: {
                    created_at?: string | null
                    email: string
                    full_name: string
                    id: string
                    is_active?: boolean | null
                    is_demo?: boolean | null
                    last_login_at?: string | null
                    phone?: string | null
                    role: string
                    updated_at?: string | null
                }
                Update: {
                    created_at?: string | null
                    email?: string
                    full_name?: string
                    id?: string
                    is_active?: boolean | null
                    is_demo?: boolean | null
                    last_login_at?: string | null
                    phone?: string | null
                    role?: string
                    updated_at?: string | null
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            generate_hn: {
                Args: Record<PropertyKey, never>
                Returns: string
            }
            generate_medicine_code: {
                Args: Record<PropertyKey, never>
                Returns: string
            }
            generate_prescription_no: {
                Args: Record<PropertyKey, never>
                Returns: string
            }
            generate_receipt_no: {
                Args: Record<PropertyKey, never>
                Returns: string
            }
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

type DefaultSchema = Database[Exclude<keyof Database, "__InternalSupabase">]

export type Tables<
    DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
    ? R
    : never
    : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
    EnumName extends DefaultSchemaEnumNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
    ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
    ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
    public: {
        Enums: {},
    },
} as const