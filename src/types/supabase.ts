// TypeScript types for Supabase database schema
// Generated based on our migration files

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      cloud_buildings: {
        Row: {
          id: string
          owner_id: string
          local_id: string | null
          name: string
          description: string | null
          created_at: string
          updated_at: string
          synced_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          local_id?: string | null
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
          synced_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          local_id?: string | null
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
          synced_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cloud_buildings_owner_id_fkey"
            columns: ["owner_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      cloud_supply_items: {
        Row: {
          id: string
          building_id: string
          local_id: string | null
          name: string
          description: string | null
          quantity: number
          category: string | null
          storage_room: string | null
          shopping_hint: string | null
          preferred_brands: string[] | null
          notes: string | null
          created_at: string
          updated_at: string
          synced_at: string
        }
        Insert: {
          id?: string
          building_id: string
          local_id?: string | null
          name: string
          description?: string | null
          quantity?: number
          category?: string | null
          storage_room?: string | null
          shopping_hint?: string | null
          preferred_brands?: string[] | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          synced_at?: string
        }
        Update: {
          id?: string
          building_id?: string
          local_id?: string | null
          name?: string
          description?: string | null
          quantity?: number
          category?: string | null
          storage_room?: string | null
          shopping_hint?: string | null
          preferred_brands?: string[] | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          synced_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cloud_supply_items_building_id_fkey"
            columns: ["building_id"]
            referencedRelation: "cloud_buildings"
            referencedColumns: ["id"]
          }
        ]
      }
      cloud_buying_items: {
        Row: {
          id: string
          building_id: string
          supply_item_id: string | null
          local_id: string | null
          name: string
          description: string | null
          quantity: number
          category: string | null
          storage_room: string | null
          shopping_hint: string | null
          preferred_brands: string[] | null
          notes: string | null
          is_bought: boolean
          added_at: string
          bought_at: string | null
          created_at: string
          updated_at: string
          synced_at: string
        }
        Insert: {
          id?: string
          building_id: string
          supply_item_id?: string | null
          local_id?: string | null
          name: string
          description?: string | null
          quantity?: number
          category?: string | null
          storage_room?: string | null
          shopping_hint?: string | null
          preferred_brands?: string[] | null
          notes?: string | null
          is_bought?: boolean
          added_at?: string
          bought_at?: string | null
          created_at?: string
          updated_at?: string
          synced_at?: string
        }
        Update: {
          id?: string
          building_id?: string
          supply_item_id?: string | null
          local_id?: string | null
          name?: string
          description?: string | null
          quantity?: number
          category?: string | null
          storage_room?: string | null
          shopping_hint?: string | null
          preferred_brands?: string[] | null
          notes?: string | null
          is_bought?: boolean
          added_at?: string
          bought_at?: string | null
          created_at?: string
          updated_at?: string
          synced_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cloud_buying_items_building_id_fkey"
            columns: ["building_id"]
            referencedRelation: "cloud_buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cloud_buying_items_supply_item_id_fkey"
            columns: ["supply_item_id"]
            referencedRelation: "cloud_supply_items"
            referencedColumns: ["id"]
          }
        ]
      }
      building_members: {
        Row: {
          id: string
          building_id: string
          user_id: string
          role: "owner" | "member"
          joined_at: string
          invited_by: string | null
        }
        Insert: {
          id?: string
          building_id: string
          user_id: string
          role?: "owner" | "member"
          joined_at?: string
          invited_by?: string | null
        }
        Update: {
          id?: string
          building_id?: string
          user_id?: string
          role?: "owner" | "member"
          joined_at?: string
          invited_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "building_members_building_id_fkey"
            columns: ["building_id"]
            referencedRelation: "cloud_buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "building_members_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "building_members_invited_by_fkey"
            columns: ["invited_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      building_shares: {
        Row: {
          id: string
          building_id: string
          share_code: string
          created_by: string
          created_at: string
          expires_at: string | null
          max_uses: number | null
          used_count: number
          is_active: boolean
        }
        Insert: {
          id?: string
          building_id: string
          share_code?: string
          created_by: string
          created_at?: string
          expires_at?: string | null
          max_uses?: number | null
          used_count?: number
          is_active?: boolean
        }
        Update: {
          id?: string
          building_id?: string
          share_code?: string
          created_by?: string
          created_at?: string
          expires_at?: string | null
          max_uses?: number | null
          used_count?: number
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "building_shares_building_id_fkey"
            columns: ["building_id"]
            referencedRelation: "cloud_buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "building_shares_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          preferred_locale: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          preferred_locale?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          preferred_locale?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      sync_queue: {
        Row: {
          id: string
          user_id: string
          table_name: string
          record_id: string
          operation: "INSERT" | "UPDATE" | "DELETE"
          data: Json | null
          created_at: string
          processed_at: string | null
          error: string | null
        }
        Insert: {
          id?: string
          user_id: string
          table_name: string
          record_id: string
          operation: "INSERT" | "UPDATE" | "DELETE"
          data?: Json | null
          created_at?: string
          processed_at?: string | null
          error?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          table_name?: string
          record_id?: string
          operation?: "INSERT" | "UPDATE" | "DELETE"
          data?: Json | null
          created_at?: string
          processed_at?: string | null
          error?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sync_queue_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_share_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_unique_share_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      validate_and_use_share_code: {
        Args: {
          code: string
          joining_user_id: string
        }
        Returns: string
      }
      transfer_building_ownership: {
        Args: {
          p_building_id: string
          p_current_owner_id: string
          p_new_owner_id: string
          p_current_owner_becomes_member?: boolean
        }
        Returns: boolean
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

// Convenience types for commonly used table types
export type CloudBuilding = Database['public']['Tables']['cloud_buildings']['Row']
export type CloudSupplyItem = Database['public']['Tables']['cloud_supply_items']['Row']
export type CloudBuyingItem = Database['public']['Tables']['cloud_buying_items']['Row']
export type BuildingMember = Database['public']['Tables']['building_members']['Row']
export type BuildingShare = Database['public']['Tables']['building_shares']['Row']
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type SyncQueueItem = Database['public']['Tables']['sync_queue']['Row']

// Insert types for creating new records
export type CreateCloudBuilding = Database['public']['Tables']['cloud_buildings']['Insert']
export type CreateCloudSupplyItem = Database['public']['Tables']['cloud_supply_items']['Insert']
export type CreateCloudBuyingItem = Database['public']['Tables']['cloud_buying_items']['Insert']
export type CreateBuildingMember = Database['public']['Tables']['building_members']['Insert']
export type CreateBuildingShare = Database['public']['Tables']['building_shares']['Insert']
export type CreateUserProfile = Database['public']['Tables']['user_profiles']['Insert']
export type CreateSyncQueueItem = Database['public']['Tables']['sync_queue']['Insert']

// Update types for modifying existing records
export type UpdateCloudBuilding = Database['public']['Tables']['cloud_buildings']['Update']
export type UpdateCloudSupplyItem = Database['public']['Tables']['cloud_supply_items']['Update']
export type UpdateCloudBuyingItem = Database['public']['Tables']['cloud_buying_items']['Update']
export type UpdateBuildingMember = Database['public']['Tables']['building_members']['Update']
export type UpdateBuildingShare = Database['public']['Tables']['building_shares']['Update']
export type UpdateUserProfile = Database['public']['Tables']['user_profiles']['Update']
export type UpdateSyncQueueItem = Database['public']['Tables']['sync_queue']['Update']

// Role types
export type BuildingRole = 'owner' | 'member'
export type SyncOperation = 'INSERT' | 'UPDATE' | 'DELETE'