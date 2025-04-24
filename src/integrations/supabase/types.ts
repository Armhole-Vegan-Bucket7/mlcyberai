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
      breach_data: {
        Row: {
          attack_vector: string | null
          breach_time: string | null
          country: string | null
          country_code: string | null
          created_at: string | null
          cve_description: string | null
          cve_id: string | null
          id: string
          industry: string | null
          latitude: number | null
          longitude: number | null
          organization: string
          severity: string | null
          source_country: string | null
          source_ip: string | null
          source_latitude: number | null
          source_longitude: number | null
        }
        Insert: {
          attack_vector?: string | null
          breach_time?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string | null
          cve_description?: string | null
          cve_id?: string | null
          id?: string
          industry?: string | null
          latitude?: number | null
          longitude?: number | null
          organization: string
          severity?: string | null
          source_country?: string | null
          source_ip?: string | null
          source_latitude?: number | null
          source_longitude?: number | null
        }
        Update: {
          attack_vector?: string | null
          breach_time?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string | null
          cve_description?: string | null
          cve_id?: string | null
          id?: string
          industry?: string | null
          latitude?: number | null
          longitude?: number | null
          organization?: string
          severity?: string | null
          source_country?: string | null
          source_ip?: string | null
          source_latitude?: number | null
          source_longitude?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          totp_enabled: boolean | null
          totp_secret: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          totp_enabled?: boolean | null
          totp_secret?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          totp_enabled?: boolean | null
          totp_secret?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      realtime_threats: {
        Row: {
          attack_vector: string | null
          cve_id: string | null
          description: string | null
          id: string
          industry: string | null
          organization: string | null
          region: string | null
          severity: string | null
          source_country: string | null
          source_lat: number | null
          source_lng: number | null
          target_country: string | null
          target_lat: number | null
          target_lng: number | null
          timestamp: string
        }
        Insert: {
          attack_vector?: string | null
          cve_id?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          organization?: string | null
          region?: string | null
          severity?: string | null
          source_country?: string | null
          source_lat?: number | null
          source_lng?: number | null
          target_country?: string | null
          target_lat?: number | null
          target_lng?: number | null
          timestamp: string
        }
        Update: {
          attack_vector?: string | null
          cve_id?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          organization?: string | null
          region?: string | null
          severity?: string | null
          source_country?: string | null
          source_lat?: number | null
          source_lng?: number | null
          target_country?: string | null
          target_lat?: number | null
          target_lng?: number | null
          timestamp?: string
        }
        Relationships: []
      }
    }
    Views: {
      threat_vector_counts: {
        Row: {
          attack_vector: string | null
          count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

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
