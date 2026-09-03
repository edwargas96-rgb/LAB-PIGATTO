export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      clinics: {
        Row: {
          ativo: boolean
          created_at: string
          documento: string | null
          email: string | null
          endereco: string | null
          id: string
          nome: string
          responsavel: string | null
          telefone: string | null
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          documento?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome: string
          responsavel?: string | null
          telefone?: string | null
        }
        Update: {
          ativo?: boolean
          created_at?: string
          documento?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          responsavel?: string | null
          telefone?: string | null
        }
        Relationships: []
      }
      documentario_acessos: {
        Row: {
          cakto_transaction_id: string | null
          created_at: string
          email: string
          produto: string | null
          status: string
          updated_at: string
        }
        Insert: {
          cakto_transaction_id?: string | null
          created_at?: string
          email: string
          produto?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          cakto_transaction_id?: string | null
          created_at?: string
          email?: string
          produto?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      foto_pedidos: {
        Row: {
          cenario: string | null
          clima: string | null
          combo: boolean
          created_at: string
          ebook: boolean
          enquadramento: string | null
          figura: string | null
          formato: string | null
          id: string
          indicado_por: string | null
          nome: string | null
          whatsapp: string | null
        }
        Insert: {
          cenario?: string | null
          clima?: string | null
          combo?: boolean
          created_at?: string
          ebook?: boolean
          enquadramento?: string | null
          figura?: string | null
          formato?: string | null
          id?: string
          indicado_por?: string | null
          nome?: string | null
          whatsapp?: string | null
        }
        Update: {
          cenario?: string | null
          clima?: string | null
          combo?: boolean
          created_at?: string
          ebook?: boolean
          enquadramento?: string | null
          figura?: string | null
          formato?: string | null
          id?: string
          indicado_por?: string | null
          nome?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      implant_systems: {
        Row: {
          ativo: boolean
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean
          id?: string
          nome?: string
        }
        Relationships: []
      }
      item_types: {
        Row: {
          ativo: boolean
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean
          id?: string
          nome?: string
        }
        Relationships: []
      }
      lab_settings: {
        Row: {
          id: boolean
          plano: Database["public"]["Enums"]["lab_plano"]
          updated_at: string
        }
        Insert: {
          id?: boolean
          plano?: Database["public"]["Enums"]["lab_plano"]
          updated_at?: string
        }
        Update: {
          id?: boolean
          plano?: Database["public"]["Enums"]["lab_plano"]
          updated_at?: string
        }
        Relationships: []
      }
      materials: {
        Row: {
          ativo: boolean
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean
          id?: string
          nome?: string
        }
        Relationships: []
      }
      order_events: {
        Row: {
          autor: string | null
          comentario: string | null
          created_at: string
          id: string
          order_id: string
          status: Database["public"]["Enums"]["order_status"] | null
        }
        Insert: {
          autor?: string | null
          comentario?: string | null
          created_at?: string
          id?: string
          order_id: string
          status?: Database["public"]["Enums"]["order_status"] | null
        }
        Update: {
          autor?: string | null
          comentario?: string | null
          created_at?: string
          id?: string
          order_id?: string
          status?: Database["public"]["Enums"]["order_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "order_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_files: {
        Row: {
          created_at: string
          id: string
          nome_arquivo: string
          order_id: string
          storage_path: string
          storage_provider: string
          tamanho: number | null
          tipo: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome_arquivo: string
          order_id: string
          storage_path: string
          storage_provider?: string
          tamanho?: number | null
          tipo: string
        }
        Update: {
          created_at?: string
          id?: string
          nome_arquivo?: string
          order_id?: string
          storage_path?: string
          storage_provider?: string
          tamanho?: number | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_files_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_steps: {
        Row: {
          concluida: boolean
          created_at: string
          id: string
          nome: string
          ordem: number
          order_id: string
        }
        Insert: {
          concluida?: boolean
          created_at?: string
          id?: string
          nome: string
          ordem?: number
          order_id: string
        }
        Update: {
          concluida?: boolean
          created_at?: string
          id?: string
          nome?: string
          ordem?: number
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_steps_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          clinic_id: string
          convenio: string | null
          cor: string | null
          created_at: string
          created_by: string
          data_entrega: string
          deleted_at: string | null
          dentista: string | null
          elementos: number[]
          entregue_em: string | null
          id: string
          implante: string | null
          item: string | null
          lab_status: Database["public"]["Enums"]["lab_os_status"]
          laboratorio_destino: string | null
          material: string | null
          numero: string
          observacoes: string | null
          paciente: string
          resposta_laboratorio: string | null
          scanbody: string | null
          sob_implante: boolean
          status: Database["public"]["Enums"]["order_status"]
          tecnico_id: string | null
          urgencia: string | null
          valor: number | null
        }
        Insert: {
          clinic_id: string
          convenio?: string | null
          cor?: string | null
          created_at?: string
          created_by: string
          data_entrega: string
          deleted_at?: string | null
          dentista?: string | null
          elementos?: number[]
          entregue_em?: string | null
          id?: string
          implante?: string | null
          item?: string | null
          lab_status?: Database["public"]["Enums"]["lab_os_status"]
          laboratorio_destino?: string | null
          material?: string | null
          numero?: string
          observacoes?: string | null
          paciente: string
          resposta_laboratorio?: string | null
          scanbody?: string | null
          sob_implante?: boolean
          status?: Database["public"]["Enums"]["order_status"]
          tecnico_id?: string | null
          urgencia?: string | null
          valor?: number | null
        }
        Update: {
          clinic_id?: string
          convenio?: string | null
          cor?: string | null
          created_at?: string
          created_by?: string
          data_entrega?: string
          deleted_at?: string | null
          dentista?: string | null
          elementos?: number[]
          entregue_em?: string | null
          id?: string
          implante?: string | null
          item?: string | null
          lab_status?: Database["public"]["Enums"]["lab_os_status"]
          laboratorio_destino?: string | null
          material?: string | null
          numero?: string
          observacoes?: string | null
          paciente?: string
          resposta_laboratorio?: string | null
          scanbody?: string | null
          sob_implante?: boolean
          status?: Database["public"]["Enums"]["order_status"]
          tecnico_id?: string | null
          urgencia?: string | null
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_tecnico_id_fkey"
            columns: ["tecnico_id"]
            isOneToOne: false
            referencedRelation: "tecnicos"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          clinic_id: string | null
          created_at: string
          id: string
          nome_completo: string
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string
          id: string
          nome_completo?: string
        }
        Update: {
          clinic_id?: string | null
          created_at?: string
          id?: string
          nome_completo?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      scanbodies: {
        Row: {
          ativo: boolean
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean
          id?: string
          nome?: string
        }
        Relationships: []
      }
      servicos: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          nome: string
          valor: number
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome: string
          valor?: number
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome?: string
          valor?: number
        }
        Relationships: []
      }
      tecnicos: {
        Row: {
          ativo: boolean
          created_at: string
          especialidade: string | null
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          especialidade?: string | null
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          especialidade?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      tooth_shades: {
        Row: {
          ativo: boolean
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean
          id?: string
          nome?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_order: { Args: { _order_id: string }; Returns: boolean }
      gen_order_numero: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_lab: { Args: never; Returns: boolean }
      my_clinic_id: { Args: never; Returns: string }
    }
    Enums: {
      app_role: "clinica" | "laboratorio"
      lab_os_status:
        | "Pendente"
        | "Aceita"
        | "Em Produção"
        | "Concluída"
        | "Entregue"
        | "Recusada"
        | "Recebida"
      lab_plano: "essencial" | "profissional"
      order_status:
        | "Recebida"
        | "Em análise"
        | "Em produção"
        | "Em prova"
        | "Pronta"
        | "Enviada/Entregue"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["clinica", "laboratorio"],
      lab_os_status: [
        "Pendente",
        "Aceita",
        "Em Produção",
        "Concluída",
        "Entregue",
        "Recusada",
        "Recebida",
      ],
      lab_plano: ["essencial", "profissional"],
      order_status: [
        "Recebida",
        "Em análise",
        "Em produção",
        "Em prova",
        "Pronta",
        "Enviada/Entregue",
      ],
    },
  },
} as const
