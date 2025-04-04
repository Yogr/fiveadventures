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
      users: {
        Row: {
          id: string
          email: string
          auth_provider: string
          created_at: string
          last_login: string
        }
        Insert: {
          id: string
          email: string
          auth_provider: string
          created_at?: string
          last_login?: string
        }
        Update: {
          id?: string
          email?: string
          auth_provider?: string
          created_at?: string
          last_login?: string
        }
        Relationships: []
      }
      characters: {
        Row: {
          id: string
          user_id: string | null
          name: string
          class: string
          level: number
          experience: number
          gold: number
          strength: number
          intelligence: number
          agility: number
          luck: number
          max_hitpoints: number
          current_hitpoints: number
          max_energy: number
          current_energy: number
          daily_adventure_count: number
          last_played_day: number
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          class: string
          level?: number
          experience?: number
          gold?: number
          strength?: number
          intelligence?: number
          agility?: number
          luck?: number
          max_hitpoints?: number
          current_hitpoints?: number
          max_energy?: number
          current_energy?: number
          daily_adventure_count?: number
          last_played_day?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          class?: string
          level?: number
          experience?: number
          gold?: number
          strength?: number
          intelligence?: number
          agility?: number
          luck?: number
          max_hitpoints?: number
          current_hitpoints?: number
          max_energy?: number
          current_energy?: number
          daily_adventure_count?: number
          last_played_day?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "characters_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      character_inventory: {
        Row: {
          id: string
          character_id: string
          item_id: string
          quantity: number
          acquired_at: string
        }
        Insert: {
          id?: string
          character_id: string
          item_id: string
          quantity?: number
          acquired_at?: string
        }
        Update: {
          id?: string
          character_id?: string
          item_id?: string
          quantity?: number
          acquired_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "character_inventory_character_id_fkey"
            columns: ["character_id"]
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_inventory_item_id_fkey"
            columns: ["item_id"]
            referencedRelation: "items"
            referencedColumns: ["id"]
          }
        ]
      }
      character_equipment: {
        Row: {
          id: string
          character_id: string
          weapon_id: string | null
          helmet_id: string | null
          armor_id: string | null
          trinket_id: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          character_id: string
          weapon_id?: string | null
          helmet_id?: string | null
          armor_id?: string | null
          trinket_id?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          character_id?: string
          weapon_id?: string | null
          helmet_id?: string | null
          armor_id?: string | null
          trinket_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "character_equipment_character_id_fkey"
            columns: ["character_id"]
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_equipment_weapon_id_fkey"
            columns: ["weapon_id"]
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_equipment_helmet_id_fkey"
            columns: ["helmet_id"]
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_equipment_armor_id_fkey"
            columns: ["armor_id"]
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_equipment_trinket_id_fkey"
            columns: ["trinket_id"]
            referencedRelation: "items"
            referencedColumns: ["id"]
          }
        ]
      }
      items: {
        Row: {
          id: string
          name: string
          type: string
          rarity: string
          weapon_type: string | null
          base_damage: number | null
          base_defense: number | null
          effects: Json | null
          value: number
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type: string
          rarity: string
          weapon_type?: string | null
          base_damage?: number | null
          base_defense?: number | null
          effects?: Json | null
          value: number
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          rarity?: string
          weapon_type?: string | null
          base_damage?: number | null
          base_defense?: number | null
          effects?: Json | null
          value?: number
          image_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      shop_items: {
        Row: {
          id: string
          item_id: string
          day: number
          price: number
          created_at: string
        }
        Insert: {
          id?: string
          item_id: string
          day: number
          price: number
          created_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          day?: number
          price?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_items_item_id_fkey"
            columns: ["item_id"]
            referencedRelation: "items"
            referencedColumns: ["id"]
          }
        ]
      }
      adventures: {
        Row: {
          id: string
          title: string
          description: string
          min_experience: number
          min_gold: number
          is_violent: boolean
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          min_experience: number
          min_gold: number
          is_violent: boolean
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          min_experience?: number
          min_gold?: number
          is_violent?: boolean
          image_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      adventure_decisions: {
        Row: {
          id: string
          adventure_id: string
          description: string
          requirements: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          adventure_id: string
          description: string
          requirements?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          adventure_id?: string
          description?: string
          requirements?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "adventure_decisions_adventure_id_fkey"
            columns: ["adventure_id"]
            referencedRelation: "adventures"
            referencedColumns: ["id"]
          }
        ]
      }
      adventure_outcomes: {
        Row: {
          id: string
          decision_id: string
          description: string
          experience_bonus: number
          gold_bonus: number
          item_reward_id: string | null
          hitpoints_change: number
          energy_change: number
          stat_requirements: Json | null
          success_rate_formula: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          decision_id: string
          description: string
          experience_bonus: number
          gold_bonus: number
          item_reward_id?: string | null
          hitpoints_change: number
          energy_change: number
          stat_requirements?: Json | null
          success_rate_formula?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          decision_id?: string
          description?: string
          experience_bonus?: number
          gold_bonus?: number
          item_reward_id?: string | null
          hitpoints_change?: number
          energy_change?: number
          stat_requirements?: Json | null
          success_rate_formula?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "adventure_outcomes_decision_id_fkey"
            columns: ["decision_id"]
            referencedRelation: "adventure_decisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adventure_outcomes_item_reward_id_fkey"
            columns: ["item_reward_id"]
            referencedRelation: "items"
            referencedColumns: ["id"]
          }
        ]
      }
      character_adventures: {
        Row: {
          id: string
          character_id: string
          adventure_id: string
          decision_id: string | null
          outcome_id: string | null
          day: number
          adventure_number: number
          experience_gained: number
          gold_gained: number
          item_gained_id: string | null
          completed_at: string
        }
        Insert: {
          id?: string
          character_id: string
          adventure_id: string
          decision_id?: string | null
          outcome_id?: string | null
          day: number
          adventure_number: number
          experience_gained: number
          gold_gained: number
          item_gained_id?: string | null
          completed_at?: string
        }
        Update: {
          id?: string
          character_id?: string
          adventure_id?: string
          decision_id?: string | null
          outcome_id?: string | null
          day?: number
          adventure_number?: number
          experience_gained?: number
          gold_gained?: number
          item_gained_id?: string | null
          completed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "character_adventures_character_id_fkey"
            columns: ["character_id"]
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_adventures_adventure_id_fkey"
            columns: ["adventure_id"]
            referencedRelation: "adventures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_adventures_decision_id_fkey"
            columns: ["decision_id"]
            referencedRelation: "adventure_decisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_adventures_outcome_id_fkey"
            columns: ["outcome_id"]
            referencedRelation: "adventure_outcomes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_adventures_item_gained_id_fkey"
            columns: ["item_gained_id"]
            referencedRelation: "items"
            referencedColumns: ["id"]
          }
        ]
      }
      world_boss: {
        Row: {
          id: string
          name: string
          description: string
          week: number
          total_hitpoints: number
          current_hitpoints: number
          player_count: number
          attack_count: number
          total_damage: number
          is_defeated: boolean
          image_url: string | null
          created_at: string
          defeated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description: string
          week: number
          total_hitpoints: number
          current_hitpoints: number
          player_count?: number
          attack_count?: number
          total_damage?: number
          is_defeated?: boolean
          image_url?: string | null
          created_at?: string
          defeated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string
          week?: number
          total_hitpoints?: number
          current_hitpoints?: number
          player_count?: number
          attack_count?: number
          total_damage?: number
          is_defeated?: boolean
          image_url?: string | null
          created_at?: string
          defeated_at?: string | null
        }
        Relationships: []
      }
      character_boss_progress: {
        Row: {
          id: string
          character_id: string
          boss_id: string
          week: number
          attack_count: number
          total_damage: number
          pending_rewards: boolean
          pending_reward_week: number | null
          last_attack: string
        }
        Insert: {
          id?: string
          character_id: string
          boss_id: string
          week: number
          attack_count?: number
          total_damage?: number
          pending_rewards?: boolean
          pending_reward_week?: number | null
          last_attack?: string
        }
        Update: {
          id?: string
          character_id?: string
          boss_id?: string
          week?: number
          attack_count?: number
          total_damage?: number
          pending_rewards?: boolean
          pending_reward_week?: number | null
          last_attack?: string
        }
        Relationships: [
          {
            foreignKeyName: "character_boss_progress_character_id_fkey"
            columns: ["character_id"]
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_boss_progress_boss_id_fkey"
            columns: ["boss_id"]
            referencedRelation: "world_boss"
            referencedColumns: ["id"]
          }
        ]
      }
      boss_rewards: {
        Row: {
          id: string
          character_id: string
          boss_id: string
          week: number
          reward_tier: string
          item_id: string | null
          is_claimed: boolean
          created_at: string
          claimed_at: string | null
        }
        Insert: {
          id?: string
          character_id: string
          boss_id: string
          week: number
          reward_tier: string
          item_id?: string | null
          is_claimed?: boolean
          created_at?: string
          claimed_at?: string | null
        }
        Update: {
          id?: string
          character_id?: string
          boss_id?: string
          week?: number
          reward_tier?: string
          item_id?: string | null
          is_claimed?: boolean
          created_at?: string
          claimed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "boss_rewards_character_id_fkey"
            columns: ["character_id"]
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boss_rewards_boss_id_fkey"
            columns: ["boss_id"]
            referencedRelation: "world_boss"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boss_rewards_item_id_fkey"
            columns: ["item_id"]
            referencedRelation: "items"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
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
