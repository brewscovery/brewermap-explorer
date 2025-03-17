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
          brewery_type: string | null
          created_at: string
          facebook_url: string | null
          id: string
          instagram_url: string | null
          name: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          about?: string | null
          brewery_type?: string | null
          created_at?: string
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          name: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          about?: string | null
          brewery_type?: string | null
          created_at?: string
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          name?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
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
      venue_hours: {
        Row: {
          created_at: string | null
          day_of_week: number
          id: string
          is_closed: boolean | null
          kitchen_close_time: string | null
          kitchen_open_time: string | null
          updated_at: string | null
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
          website_url: string | null
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
          website_url?: string | null
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
          website_url?: string | null
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
        Args: {
          lat1: number
          lon1: number
          lat2: number
          lon2: number
        }
        Returns: number
      }
      update_brewery_about: {
        Args: {
          brewery_id: string
          new_about: string
        }
        Returns: undefined
      }
    }
    Enums: {
      user_type: "business" | "regular"
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
