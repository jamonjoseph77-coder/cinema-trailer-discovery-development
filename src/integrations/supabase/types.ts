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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      discover_clips: {
        Row: {
          created_at: string
          description: string
          duration_seconds: number | null
          headline: string
          id: string
          is_published: boolean
          kind: string
          poster_url: string
          publisher_name: string
          sort_order: number
          title_id: string | null
          updated_at: string
          video_url: string
        }
        Insert: {
          created_at?: string
          description?: string
          duration_seconds?: number | null
          headline: string
          id?: string
          is_published?: boolean
          kind: string
          poster_url?: string
          publisher_name?: string
          sort_order?: number
          title_id?: string | null
          updated_at?: string
          video_url: string
        }
        Update: {
          created_at?: string
          description?: string
          duration_seconds?: number | null
          headline?: string
          id?: string
          is_published?: boolean
          kind?: string
          poster_url?: string
          publisher_name?: string
          sort_order?: number
          title_id?: string | null
          updated_at?: string
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "discover_clips_title_id_fkey"
            columns: ["title_id"]
            isOneToOne: false
            referencedRelation: "titles"
            referencedColumns: ["id"]
          },
        ]
      }
      episodes: {
        Row: {
          created_at: string
          duration_minutes: number | null
          id: string
          number: number
          playback_url: string
          season_id: string
          synopsis: string
          thumbnail_url: string
          title: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number | null
          id?: string
          number: number
          playback_url?: string
          season_id: string
          synopsis?: string
          thumbnail_url?: string
          title?: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number | null
          id?: string
          number?: number
          playback_url?: string
          season_id?: string
          synopsis?: string
          thumbnail_url?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "episodes_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      favourites: {
        Row: {
          created_at: string
          title_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          title_id: string
          user_id?: string
        }
        Update: {
          created_at?: string
          title_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favourites_title_id_fkey"
            columns: ["title_id"]
            isOneToOne: false
            referencedRelation: "titles"
            referencedColumns: ["id"]
          },
        ]
      }
      friendships: {
        Row: {
          addressee_id: string
          created_at: string
          id: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          addressee_id: string
          created_at?: string
          id?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Update: {
          addressee_id?: string
          created_at?: string
          id?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          bio: string
          created_at: string
          display_name: string
          is_discoverable: boolean
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          bio?: string
          created_at?: string
          display_name: string
          is_discoverable?: boolean
          updated_at?: string
          user_id?: string
          username: string
        }
        Update: {
          bio?: string
          created_at?: string
          display_name?: string
          is_discoverable?: boolean
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      publisher_follows: {
        Row: {
          created_at: string
          publisher_name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          publisher_name: string
          user_id?: string
        }
        Update: {
          created_at?: string
          publisher_name?: string
          user_id?: string
        }
        Relationships: []
      }
      seasons: {
        Row: {
          created_at: string
          id: string
          name: string
          number: number
          title_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string
          number: number
          title_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          number?: number
          title_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seasons_title_id_fkey"
            columns: ["title_id"]
            isOneToOne: false
            referencedRelation: "titles"
            referencedColumns: ["id"]
          },
        ]
      }
      titles: {
        Row: {
          availability: string
          backdrop_url: string
          created_at: string
          duration_minutes: number | null
          genre: string
          id: string
          is_featured: boolean
          is_published: boolean
          playback_url: string
          poster_url: string
          publisher: string
          release_date: string | null
          release_year: number | null
          subtitle_url: string
          synopsis: string
          title: string
          trailer_url: string
          type: string
          updated_at: string
        }
        Insert: {
          availability?: string
          backdrop_url?: string
          created_at?: string
          duration_minutes?: number | null
          genre?: string
          id?: string
          is_featured?: boolean
          is_published?: boolean
          playback_url?: string
          poster_url?: string
          publisher?: string
          release_date?: string | null
          release_year?: number | null
          subtitle_url?: string
          synopsis?: string
          title: string
          trailer_url?: string
          type: string
          updated_at?: string
        }
        Update: {
          availability?: string
          backdrop_url?: string
          created_at?: string
          duration_minutes?: number | null
          genre?: string
          id?: string
          is_featured?: boolean
          is_published?: boolean
          playback_url?: string
          poster_url?: string
          publisher?: string
          release_date?: string | null
          release_year?: number | null
          subtitle_url?: string
          synopsis?: string
          title?: string
          trailer_url?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      watch_parties: {
        Row: {
          created_at: string
          host_id: string
          id: string
          invite_code: string
          name: string
          scheduled_at: string | null
          status: string
          title_id: string
          updated_at: string
          visibility: string
        }
        Insert: {
          created_at?: string
          host_id?: string
          id?: string
          invite_code?: string
          name: string
          scheduled_at?: string | null
          status?: string
          title_id: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          created_at?: string
          host_id?: string
          id?: string
          invite_code?: string
          name?: string
          scheduled_at?: string | null
          status?: string
          title_id?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "watch_parties_title_id_fkey"
            columns: ["title_id"]
            isOneToOne: false
            referencedRelation: "titles"
            referencedColumns: ["id"]
          },
        ]
      }
      watch_party_members: {
        Row: {
          joined_at: string
          party_id: string
          role: string
          user_id: string
        }
        Insert: {
          joined_at?: string
          party_id: string
          role?: string
          user_id?: string
        }
        Update: {
          joined_at?: string
          party_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watch_party_members_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "watch_parties"
            referencedColumns: ["id"]
          },
        ]
      }
      watch_party_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          party_id: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          party_id: string
          user_id?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          party_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watch_party_messages_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "watch_parties"
            referencedColumns: ["id"]
          },
        ]
      }
      watch_progress: {
        Row: {
          completed: boolean
          content_id: string
          duration_seconds: number
          position_seconds: number
          title_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          content_id: string
          duration_seconds?: number
          position_seconds?: number
          title_id: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          completed?: boolean
          content_id?: string
          duration_seconds?: number
          position_seconds?: number
          title_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watch_progress_title_id_fkey"
            columns: ["title_id"]
            isOneToOne: false
            referencedRelation: "titles"
            referencedColumns: ["id"]
          },
        ]
      }
      watchlist_items: {
        Row: {
          created_at: string
          title_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          title_id: string
          user_id?: string
        }
        Update: {
          created_at?: string
          title_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watchlist_items_title_id_fkey"
            columns: ["title_id"]
            isOneToOne: false
            referencedRelation: "titles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_first_admin: { Args: never; Returns: boolean }
      is_cinema_admin: { Args: never; Returns: boolean }
      is_party_host: { Args: { p_party_id: string }; Returns: boolean }
      is_party_member: { Args: { p_party_id: string }; Returns: boolean }
      join_watch_party: { Args: { p_invite_code: string }; Returns: string }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
