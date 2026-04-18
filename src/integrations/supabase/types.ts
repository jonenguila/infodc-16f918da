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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      comunicacao_cards: {
        Row: {
          abrir_nova_aba: boolean
          cor: string
          created_at: string
          descricao: string
          icone: string
          id: string
          link: string
          ordem: number
          seccao: string
          texto_botao: string
          titulo: string
          updated_at: string
        }
        Insert: {
          abrir_nova_aba?: boolean
          cor?: string
          created_at?: string
          descricao?: string
          icone?: string
          id?: string
          link?: string
          ordem?: number
          seccao: string
          texto_botao?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          abrir_nova_aba?: boolean
          cor?: string
          created_at?: string
          descricao?: string
          icone?: string
          id?: string
          link?: string
          ordem?: number
          seccao?: string
          texto_botao?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          assunto: string
          cc: string[] | null
          created_at: string
          destinatarios: string[]
          erro: string | null
          estado: string
          funcao: string
          id: string
          payload: Json | null
          referencia: string | null
          remetente: string
          resend_id: string | null
        }
        Insert: {
          assunto: string
          cc?: string[] | null
          created_at?: string
          destinatarios?: string[]
          erro?: string | null
          estado?: string
          funcao: string
          id?: string
          payload?: Json | null
          referencia?: string | null
          remetente: string
          resend_id?: string | null
        }
        Update: {
          assunto?: string
          cc?: string[] | null
          created_at?: string
          destinatarios?: string[]
          erro?: string | null
          estado?: string
          funcao?: string
          id?: string
          payload?: Json | null
          referencia?: string | null
          remetente?: string
          resend_id?: string | null
        }
        Relationships: []
      }
      notificacoes: {
        Row: {
          created_at: string
          id: string
          lida: boolean
          mensagem: string
          referencia: string | null
          tipo: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lida?: boolean
          mensagem: string
          referencia?: string | null
          tipo?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lida?: boolean
          mensagem?: string
          referencia?: string | null
          tipo?: string
          user_id?: string
        }
        Relationships: []
      }
      produtos_imagens: {
        Row: {
          id: number
          imagem_url: string
          logo_url: string
          updated_at: string
        }
        Insert: {
          id: number
          imagem_url?: string
          logo_url?: string
          updated_at?: string
        }
        Update: {
          id?: number
          imagem_url?: string
          logo_url?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar: string | null
          cargo: string | null
          created_at: string
          email: string
          id: string
          nome: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar?: string | null
          cargo?: string | null
          created_at?: string
          email: string
          id?: string
          nome: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar?: string | null
          cargo?: string | null
          created_at?: string
          email?: string
          id?: string
          nome?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projetos_imagens: {
        Row: {
          id: number
          imagem_url: string
          updated_at: string
        }
        Insert: {
          id: number
          imagem_url?: string
          updated_at?: string
        }
        Update: {
          id?: number
          imagem_url?: string
          updated_at?: string
        }
        Relationships: []
      }
      servicos_imagens: {
        Row: {
          id: string
          imagem_url: string
          updated_at: string
        }
        Insert: {
          id: string
          imagem_url?: string
          updated_at?: string
        }
        Update: {
          id?: string
          imagem_url?: string
          updated_at?: string
        }
        Relationships: []
      }
      stock_config: {
        Row: {
          key: string
          value: number
        }
        Insert: {
          key: string
          value?: number
        }
        Update: {
          key?: string
          value?: number
        }
        Relationships: []
      }
      stock_documentos_devolucao: {
        Row: {
          created_at: string
          data_entrega: string
          id: string
          nome: string
          nome_evento: string | null
          observacoes: string | null
          produtos: Json
          responsavel: string | null
        }
        Insert: {
          created_at?: string
          data_entrega: string
          id?: string
          nome: string
          nome_evento?: string | null
          observacoes?: string | null
          produtos?: Json
          responsavel?: string | null
        }
        Update: {
          created_at?: string
          data_entrega?: string
          id?: string
          nome?: string
          nome_evento?: string | null
          observacoes?: string | null
          produtos?: Json
          responsavel?: string | null
        }
        Relationships: []
      }
      stock_localizacoes: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          nome: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      stock_movimentos: {
        Row: {
          created_at: string
          data: string
          evento: string | null
          id: string
          produto_id: string | null
          produto_nome: string
          quantidade: number
          responsavel: string | null
          tipo: string
        }
        Insert: {
          created_at?: string
          data: string
          evento?: string | null
          id?: string
          produto_id?: string | null
          produto_nome: string
          quantidade: number
          responsavel?: string | null
          tipo: string
        }
        Update: {
          created_at?: string
          data?: string
          evento?: string | null
          id?: string
          produto_id?: string | null
          produto_nome?: string
          quantidade?: number
          responsavel?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_movimentos_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "stock_produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_pedidos: {
        Row: {
          criado_em: string
          data_evento: string | null
          data_pedido: string
          data_recolha: string | null
          descricao_destino: string | null
          destino: string | null
          email: string
          estado: string
          id: string
          nome_evento: string | null
          nome_requisitante: string
          numero: string
          observacoes: string | null
          origem: string | null
          prioridade: string
          produtos: Json
          responsavel_levantamento: string | null
          tipo_evento: string | null
        }
        Insert: {
          criado_em?: string
          data_evento?: string | null
          data_pedido: string
          data_recolha?: string | null
          descricao_destino?: string | null
          destino?: string | null
          email: string
          estado?: string
          id?: string
          nome_evento?: string | null
          nome_requisitante: string
          numero: string
          observacoes?: string | null
          origem?: string | null
          prioridade?: string
          produtos?: Json
          responsavel_levantamento?: string | null
          tipo_evento?: string | null
        }
        Update: {
          criado_em?: string
          data_evento?: string | null
          data_pedido?: string
          data_recolha?: string | null
          descricao_destino?: string | null
          destino?: string | null
          email?: string
          estado?: string
          id?: string
          nome_evento?: string | null
          nome_requisitante?: string
          numero?: string
          observacoes?: string | null
          origem?: string | null
          prioridade?: string
          produtos?: Json
          responsavel_levantamento?: string | null
          tipo_evento?: string | null
        }
        Relationships: []
      }
      stock_pedidos_levantamento: {
        Row: {
          consumo_real: number
          created_at: string
          data: string
          estado: string
          evento: string | null
          id: string
          produto_id: string | null
          produto_nome: string
          quantidade_devolvida: number
          quantidade_levantada: number
          responsavel: string | null
        }
        Insert: {
          consumo_real?: number
          created_at?: string
          data: string
          estado?: string
          evento?: string | null
          id?: string
          produto_id?: string | null
          produto_nome: string
          quantidade_devolvida?: number
          quantidade_levantada?: number
          responsavel?: string | null
        }
        Update: {
          consumo_real?: number
          created_at?: string
          data?: string
          estado?: string
          evento?: string | null
          id?: string
          produto_id?: string | null
          produto_nome?: string
          quantidade_devolvida?: number
          quantidade_levantada?: number
          responsavel?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_pedidos_levantamento_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "stock_produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_produtos: {
        Row: {
          created_at: string
          id: string
          imagem_url: string | null
          localizacao: string | null
          nome: string
          stock_atual: number
          stock_minimo: number
          tipologia: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          imagem_url?: string | null
          localizacao?: string | null
          nome: string
          stock_atual?: number
          stock_minimo?: number
          tipologia?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          imagem_url?: string | null
          localizacao?: string | null
          nome?: string
          stock_atual?: number
          stock_minimo?: number
          tipologia?: string
          updated_at?: string
        }
        Relationships: []
      }
      stock_tipologias: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          nome: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
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
          role?: Database["public"]["Enums"]["app_role"]
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "gestor" | "utilizador"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: ["admin", "gestor", "utilizador"],
    },
  },
} as const
