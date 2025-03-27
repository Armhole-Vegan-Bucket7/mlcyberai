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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
