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
      breweries: {
        Row: {
          about: string | null
          country: string | null
          created_at: string
          facebook_url: string | null
          id: string
          instagram_url: string | null
          is_independent: boolean | null
          is_verified: boolean | null
          logo_url: string | null
          name: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          about?: string | null
          country?: string | null
          created_at?: string
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          is_independent?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          name: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          about?: string | null
          country?: string | null
          created_at?: string
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          is_independent?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          name?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      brewery_claims: {
        Row: {
          admin_notes: string | null
          brewery_id: string
          claim_type: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          decision_at: string | null
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          brewery_id: string
          claim_type?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          decision_at?: string | null
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          brewery_id?: string
          claim_type?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          decision_at?: string | null
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brewery_claims_brewery_id_fkey"
            columns: ["brewery_id"]
            isOneToOne: false
            referencedRelation: "breweries"
            referencedColumns: ["id"]
          },
        ]
      }
      brewery_owners: {
        Row: {
          brewery_id: string | null
          created_at: string
          id: string
          user_id: string | null
        }
        Insert: {
          brewery_id?: string | null
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Update: {
          brewery_id?: string | null
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brewery_owners_brewery_id_fkey"
            columns: ["brewery_id"]
            isOneToOne: false
            referencedRelation: "breweries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brewery_owners_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      checkins: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number | null
          updated_at: string
          user_id: string | null
          venue_id: string
          visited_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number | null
          updated_at?: string
          user_id?: string | null
          venue_id: string
          visited_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number | null
          updated_at?: string
          user_id?: string | null
          venue_id?: string
          visited_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkins_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      debug_trigger_log: {
        Row: {
          fired_at: string | null
          id: number
          new_data: Json | null
          old_data: Json | null
          operation: string | null
          table_name: string | null
          trigger_name: string | null
        }
        Insert: {
          fired_at?: string | null
          id?: number
          new_data?: Json | null
          old_data?: Json | null
          operation?: string | null
          table_name?: string | null
          trigger_name?: string | null
        }
        Update: {
          fired_at?: string | null
          id?: number
          new_data?: Json | null
          old_data?: Json | null
          operation?: string | null
          table_name?: string | null
          trigger_name?: string | null
        }
        Relationships: []
      }
      event_interests: {
        Row: {
          created_at: string
          event_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_event"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "venue_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          claim_updates: boolean
          created_at: string
          daily_special_updates: boolean
          event_updates: boolean
          happy_hour_updates: boolean
          id: string
          updated_at: string
          user_id: string
          venue_updates: boolean
        }
        Insert: {
          claim_updates?: boolean
          created_at?: string
          daily_special_updates?: boolean
          event_updates?: boolean
          happy_hour_updates?: boolean
          id?: string
          updated_at?: string
          user_id: string
          venue_updates?: boolean
        }
        Update: {
          claim_updates?: boolean
          created_at?: string
          daily_special_updates?: boolean
          event_updates?: boolean
          happy_hour_updates?: boolean
          id?: string
          updated_at?: string
          user_id?: string
          venue_updates?: boolean
        }
        Relationships: []
      }
      notifications: {
        Row: {
          content: string
          created_at: string
          id: string
          read_at: string | null
          related_entity_id: string | null
          related_entity_type: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read_at?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read_at?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: []
      }
      todo_list_venues: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          is_completed: boolean
          todo_list_id: string
          updated_at: string
          venue_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          todo_list_id: string
          updated_at?: string
          venue_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          todo_list_id?: string
          updated_at?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_todo_list"
            columns: ["todo_list_id"]
            isOneToOne: false
            referencedRelation: "todo_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_venue"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      todo_lists: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      venue_daily_specials: {
        Row: {
          created_at: string
          day_of_week: number
          description: string | null
          end_time: string | null
          id: string
          is_active: boolean
          start_time: string | null
          updated_at: string
          updated_by: string | null
          venue_id: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          description?: string | null
          end_time?: string | null
          id?: string
          is_active?: boolean
          start_time?: string | null
          updated_at?: string
          updated_by?: string | null
          venue_id: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          description?: string | null
          end_time?: string | null
          id?: string
          is_active?: boolean
          start_time?: string | null
          updated_at?: string
          updated_by?: string | null
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venue_daily_specials_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      venue_events: {
        Row: {
          created_at: string
          description: string | null
          end_time: string
          id: string
          is_published: boolean
          max_attendees: number | null
          start_time: string
          ticket_price: number | null
          ticket_url: string | null
          title: string
          updated_at: string
          venue_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_time: string
          id?: string
          is_published?: boolean
          max_attendees?: number | null
          start_time: string
          ticket_price?: number | null
          ticket_url?: string | null
          title: string
          updated_at?: string
          venue_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_time?: string
          id?: string
          is_published?: boolean
          max_attendees?: number | null
          start_time?: string
          ticket_price?: number | null
          ticket_url?: string | null
          title?: string
          updated_at?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_venue"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      venue_favorites: {
        Row: {
          created_at: string
          id: string
          user_id: string
          venue_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          venue_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venue_favorites_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      venue_happy_hours: {
        Row: {
          created_at: string
          day_of_week: number
          description: string | null
          end_time: string | null
          id: string
          is_active: boolean
          start_time: string | null
          updated_at: string
          updated_by: string | null
          venue_id: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          description?: string | null
          end_time?: string | null
          id?: string
          is_active?: boolean
          start_time?: string | null
          updated_at?: string
          updated_by?: string | null
          venue_id: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          description?: string | null
          end_time?: string | null
          id?: string
          is_active?: boolean
          start_time?: string | null
          updated_at?: string
          updated_by?: string | null
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venue_happy_hours_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      venue_hours: {
        Row: {
          created_at: string | null
          day_of_week: number
          id: string
          is_closed: boolean | null
          kitchen_close_time: string | null
          kitchen_open_time: string | null
          updated_at: string | null
          updated_by: string | null
          venue_close_time: string | null
          venue_id: string
          venue_open_time: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          id?: string
          is_closed?: boolean | null
          kitchen_close_time?: string | null
          kitchen_open_time?: string | null
          updated_at?: string | null
          updated_by?: string | null
          venue_close_time?: string | null
          venue_id: string
          venue_open_time?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          id?: string
          is_closed?: boolean | null
          kitchen_close_time?: string | null
          kitchen_open_time?: string | null
          updated_at?: string | null
          updated_by?: string | null
          venue_close_time?: string | null
          venue_id?: string
          venue_open_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "venue_hours_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      venue_qr_codes: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          token: string
          venue_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          token: string
          venue_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          token?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venue_qr_codes_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      venues: {
        Row: {
          brewery_id: string
          city: string
          country: string | null
          created_at: string
          id: string
          latitude: string | null
          longitude: string | null
          name: string
          phone: string | null
          postal_code: string | null
          state: string
          street: string | null
          updated_at: string
        }
        Insert: {
          brewery_id: string
          city: string
          country?: string | null
          created_at?: string
          id?: string
          latitude?: string | null
          longitude?: string | null
          name: string
          phone?: string | null
          postal_code?: string | null
          state: string
          street?: string | null
          updated_at?: string
        }
        Update: {
          brewery_id?: string
          city?: string
          country?: string | null
          created_at?: string
          id?: string
          latitude?: string | null
          longitude?: string | null
          name?: string
          phone?: string | null
          postal_code?: string | null
          state?: string
          street?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "venues_brewery_id_fkey"
            columns: ["brewery_id"]
            isOneToOne: false
            referencedRelation: "breweries"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_distance: {
        Args: { lat1: number; lon1: number; lat2: number; lon2: number }
        Returns: number
      }
      calculate_venues_in_radius: {
        Args: { ref_lat: number; ref_lon: number; radius_km: number }
        Returns: {
          brewery_id: string
          city: string
          country: string | null
          created_at: string
          id: string
          latitude: string | null
          longitude: string | null
          name: string
          phone: string | null
          postal_code: string | null
          state: string
          street: string | null
          updated_at: string
        }[]
      }
      get_profile_by_id: {
        Args: { profile_id: string }
        Returns: {
          id: string
          user_type: string
          first_name: string
          last_name: string
        }[]
      }
      get_user_checkin_analytics: {
        Args: { user_id: string }
        Returns: Json
      }
      get_user_profile: {
        Args: { profile_id: string }
        Returns: Json
      }
      get_user_type: {
        Args: { user_id: string }
        Returns: string
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_venue_in_user_brewery: {
        Args: { user_id: string; venue_id: string }
        Returns: boolean
      }
      search_breweries: {
        Args: { search_term: string }
        Returns: {
          id: string
          name: string
          is_verified: boolean
          has_owner: boolean
        }[]
      }
      search_cities_with_venues: {
        Args: { search_term: string }
        Returns: {
          city: string
          state: string
          country: string
          venue_count: number
        }[]
      }
      update_brewery_about: {
        Args: { brewery_id: string; new_about: string }
        Returns: undefined
      }
    }
    Enums: {
      user_type: "business" | "regular" | "admin"
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
    Enums: {
      user_type: ["business", "regular", "admin"],
    },
  },
} as const
