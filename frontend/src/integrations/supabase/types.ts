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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      assessments: {
        Row: {
          answers: Json | null
          assessment_type: string
          completed_at: string | null
          created_at: string
          id: string
          learner_id: string
          nsqf_level_assessed: Database["public"]["Enums"]["nsqf_level"] | null
          questions: Json | null
          results: Json | null
          score: number | null
          status: Database["public"]["Enums"]["assessment_status"] | null
        }
        Insert: {
          answers?: Json | null
          assessment_type: string
          completed_at?: string | null
          created_at?: string
          id?: string
          learner_id: string
          nsqf_level_assessed?: Database["public"]["Enums"]["nsqf_level"] | null
          questions?: Json | null
          results?: Json | null
          score?: number | null
          status?: Database["public"]["Enums"]["assessment_status"] | null
        }
        Update: {
          answers?: Json | null
          assessment_type?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          learner_id?: string
          nsqf_level_assessed?: Database["public"]["Enums"]["nsqf_level"] | null
          questions?: Json | null
          results?: Json | null
          score?: number | null
          status?: Database["public"]["Enums"]["assessment_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "assessments_learner_id_fkey"
            columns: ["learner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string
          id: string
          learner_id: string
          messages: Json | null
          session_data: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          learner_id: string
          messages?: Json | null
          session_data?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          learner_id?: string
          messages?: Json | null
          session_data?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_learner_id_fkey"
            columns: ["learner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      course_skills: {
        Row: {
          course_id: string
          id: string
          skill_id: string
        }
        Insert: {
          course_id: string
          id?: string
          skill_id: string
        }
        Update: {
          course_id?: string
          id?: string
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_skills_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string
          description: string | null
          duration_hours: number | null
          id: string
          is_active: boolean | null
          language: string | null
          nsqf_level: Database["public"]["Enums"]["nsqf_level"] | null
          price: number | null
          provider: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          id?: string
          is_active?: boolean | null
          language?: string | null
          nsqf_level?: Database["public"]["Enums"]["nsqf_level"] | null
          price?: number | null
          provider?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          id?: string
          is_active?: boolean | null
          language?: string | null
          nsqf_level?: Database["public"]["Enums"]["nsqf_level"] | null
          price?: number | null
          provider?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      credentials: {
        Row: {
          course_id: string | null
          credential_name: string
          expires_at: string | null
          id: string
          issued_at: string
          issuer: string | null
          learner_id: string
          qr_code_data: string | null
          verification_token: string | null
        }
        Insert: {
          course_id?: string | null
          credential_name: string
          expires_at?: string | null
          id?: string
          issued_at?: string
          issuer?: string | null
          learner_id: string
          qr_code_data?: string | null
          verification_token?: string | null
        }
        Update: {
          course_id?: string | null
          credential_name?: string
          expires_at?: string | null
          id?: string
          issued_at?: string
          issuer?: string | null
          learner_id?: string
          qr_code_data?: string | null
          verification_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credentials_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credentials_learner_id_fkey"
            columns: ["learner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      learning_pathways: {
        Row: {
          ai_reasoning: string | null
          confidence_score: number | null
          created_at: string
          id: string
          learner_id: string
          pathway_data: Json | null
          status: Database["public"]["Enums"]["pathway_status"] | null
          target_role: string | null
          title: string
          updated_at: string
        }
        Insert: {
          ai_reasoning?: string | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          learner_id: string
          pathway_data?: Json | null
          status?: Database["public"]["Enums"]["pathway_status"] | null
          target_role?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          ai_reasoning?: string | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          learner_id?: string
          pathway_data?: Json | null
          status?: Database["public"]["Enums"]["pathway_status"] | null
          target_role?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_pathways_learner_id_fkey"
            columns: ["learner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      market_insights: {
        Row: {
          demand_score: number | null
          id: string
          job_postings_count: number | null
          last_updated: string
          region: string | null
          salary_range: Json | null
          skill_name: string
          trend_data: Json | null
        }
        Insert: {
          demand_score?: number | null
          id?: string
          job_postings_count?: number | null
          last_updated?: string
          region?: string | null
          salary_range?: Json | null
          skill_name: string
          trend_data?: Json | null
        }
        Update: {
          demand_score?: number | null
          id?: string
          job_postings_count?: number | null
          last_updated?: string
          region?: string | null
          salary_range?: Json | null
          skill_name?: string
          trend_data?: Json | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          aspirations: Json | null
          created_at: string
          current_occupation: string | null
          education_level: string | null
          full_name: string | null
          id: string
          language: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          socio_economic_data: Json | null
          state: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          aspirations?: Json | null
          created_at?: string
          current_occupation?: string | null
          education_level?: string | null
          full_name?: string | null
          id?: string
          language?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          socio_economic_data?: Json | null
          state?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          aspirations?: Json | null
          created_at?: string
          current_occupation?: string | null
          education_level?: string | null
          full_name?: string | null
          id?: string
          language?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          socio_economic_data?: Json | null
          state?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rpl_documents: {
        Row: {
          ai_extracted_skills: Json | null
          created_at: string
          document_name: string
          document_type: string | null
          file_path: string | null
          id: string
          learner_id: string
          nsqf_level_mapped: Database["public"]["Enums"]["nsqf_level"] | null
          verification_status: string | null
        }
        Insert: {
          ai_extracted_skills?: Json | null
          created_at?: string
          document_name: string
          document_type?: string | null
          file_path?: string | null
          id?: string
          learner_id: string
          nsqf_level_mapped?: Database["public"]["Enums"]["nsqf_level"] | null
          verification_status?: string | null
        }
        Update: {
          ai_extracted_skills?: Json | null
          created_at?: string
          document_name?: string
          document_type?: string | null
          file_path?: string | null
          id?: string
          learner_id?: string
          nsqf_level_mapped?: Database["public"]["Enums"]["nsqf_level"] | null
          verification_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rpl_documents_learner_id_fkey"
            columns: ["learner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      skills: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          nsqf_level: Database["public"]["Enums"]["nsqf_level"] | null
          prerequisites: string[] | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          nsqf_level?: Database["public"]["Enums"]["nsqf_level"] | null
          prerequisites?: string[] | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          nsqf_level?: Database["public"]["Enums"]["nsqf_level"] | null
          prerequisites?: string[] | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      assessment_status: "not_started" | "in_progress" | "completed"
      nsqf_level: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10"
      pathway_status: "recommended" | "active" | "completed" | "paused"
      user_role: "learner" | "trainer" | "policymaker"
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
      assessment_status: ["not_started", "in_progress", "completed"],
      nsqf_level: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
      pathway_status: ["recommended", "active", "completed", "paused"],
      user_role: ["learner", "trainer", "policymaker"],
    },
  },
} as const
