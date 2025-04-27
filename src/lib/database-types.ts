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
          music_enabled: boolean
          sound_enabled: boolean
        }
        Insert: {
          id: string
          email: string
          auth_provider: string
          created_at?: string
          last_login?: string
          music_enabled?: boolean
          sound_enabled?: boolean
        }
        Update: {
          id?: string
          email?: string
          auth_provider?: string
          created_at?: string
          last_login?: string
          music_enabled?: boolean
          sound_enabled?: boolean
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
          wisdom: number
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
          wisdom?: number
          max_hitpoints?: number
          current_hitpoints?: number
          max_energy?: number
          current_energy?: number
          daily_adventure_count?: number
          last_played_day?: number
          status?: string
          current_adventure_state?: string
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
          wisdom?: number
          max_hitpoints?: number
          current_hitpoints?: number
          max_energy?: number
          current_energy?: number
          daily_adventure_count?: number
          last_played_day?: number
          status?: string
          current_adventure_state?: string
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
          item_id: number
          quantity: number
          acquired_at: string
        }
        Insert: {
          id?: string
          character_id: string
          item_id: number
          quantity?: number
          acquired_at?: string
        }
        Update: {
          id?: string
          character_id?: string
          item_id?: number
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
          weapon_id: number | null
          helmet_id: number | null
          armor_id: number | null
          trinket_id: number | null
          updated_at: string
        }
        Insert: {
          id?: string
          character_id: string
          weapon_id?: number | null
          helmet_id?: number | null
          armor_id?: number | null
          trinket_id?: number | null
          updated_at?: string
        }
        Update: {
          id?: string
          character_id?: string
          weapon_id?: number | null
          helmet_id?: number | null
          armor_id?: number | null
          trinket_id?: number | null
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
          id: number
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
          id?: number
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
          id?: number
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
          item_id: number
          day: number
          price: number
          created_at: string
        }
        Insert: {
          id?: string
          item_id: number
          day: number
          price: number
          created_at?: string
        }
        Update: {
          id?: string
          item_id?: number
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
      skills: {
        Row: {
          id: number
          name: string
          description: string
          class: string
          energy_cost: number
          cooldown: number
          effects: Json | null
          image_url: string | null
          created_at: string
          attribute: string | null
          power: number | null
        }
        Insert: {
          id?: number
          name: string
          description: string
          class: string
          energy_cost: number
          cooldown?: number
          effects?: Json | null
          image_url?: string | null
          created_at?: string
          attribute?: string | null
          power?: number | null
        }
        Update: {
          id?: number
          name?: string
          description?: string
          class?: string
          energy_cost?: number
          cooldown?: number
          effects?: Json | null
          image_url?: string | null
          created_at?: string
          attribute?: string | null
          power?: number | null
        }
        Relationships: []
      }
      character_skills: {
        Row: {
          id: string
          character_id: string
          skill_id: number
          level: number
          acquired_at: string
        }
        Insert: {
          id?: string
          character_id: string
          skill_id: number
          level?: number
          acquired_at?: string
        }
        Update: {
          id?: string
          character_id?: string
          skill_id?: number
          level?: number
          acquired_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "character_skills_character_id_fkey"
            columns: ["character_id"]
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_skills_skill_id_fkey"
            columns: ["skill_id"]
            referencedRelation: "skills"
            referencedColumns: ["id"]
          }
        ]
      }
      monsters: {
        Row: {
          id: number
          name: string
          description: string
          hitpoints: number
          attack: number
          defense: number
          experience_reward: number
          gold_reward: number
          difficulty: number
          attack_type: string
          abilities: Json | null
          image_url: string | null
          scale?: number | null
          is_elite?: boolean
          base_monster_id?: number | null
          reward_table?: number
          is_boss?: boolean
          rare_item_chance?: number
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          description: string
          hitpoints: number
          attack: number
          defense: number
          experience_reward: number
          gold_reward: number
          difficulty: number
          attack_type: string
          abilities?: Json | null
          image_url?: string | null
          is_elite?: boolean
          base_monster_id?: number | null
          reward_table?: number
          is_boss?: boolean
          rare_item_chance?: number
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string
          hitpoints?: number
          attack?: number
          defense?: number
          experience_reward?: number
          gold_reward?: number
          difficulty?: number
          attack_type?: string
          abilities?: Json | null
          image_url?: string | null
          is_elite?: boolean
          base_monster_id?: number | null
          reward_table?: number
          is_boss?: boolean
          rare_item_chance?: number
          created_at?: string
        }
        Relationships: []
      }
      reward_tables: {
        Row: {
          id: number
          name: string
          description: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          description: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string
          created_at?: string
        }
        Relationships: []
      }
      reward_items: {
        Row: {
          id: number
          reward_table_id: number
          item_id: number
          chance: number
          created_at: string
        }
        Insert: {
          id?: number
          reward_table_id: number
          item_id: number
          chance: number
          created_at?: string
        }
        Update: {
          id?: number
          reward_table_id?: number
          item_id?: number
          chance?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_items_reward_table_id_fkey"
            columns: ["reward_table_id"]
            referencedRelation: "reward_tables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_items_item_id_fkey"
            columns: ["item_id"]
            referencedRelation: "items"
            referencedColumns: ["id"]
          }
        ]
      }
      areas: {
        Row: {
          id: number
          name: string
          description: string
          image: string
          level_requirement: number
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          description: string
          image: string
          level_requirement?: number
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string
          image?: string
          level_requirement?: number
          created_at?: string
        }
        Relationships: []
      }
      character_selected_area: {
        Row: {
          id: string
          character_id: string
          area_id: number
          day: number
          selected_at: string
        }
        Insert: {
          id?: string
          character_id: string
          area_id: number
          day: number
          selected_at?: string
        }
        Update: {
          id?: string
          character_id?: string
          area_id?: number
          day?: number
          selected_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "character_selected_area_character_id_fkey"
            columns: ["character_id"]
            referencedRelation: "characters"
            referencedColumns: ["id"]
          }
        ]
      }
      adventures: {
        Row: {
          id: number
          title: string
          description: string
          min_experience: number
          min_gold: number
          is_violent: boolean
          has_combat: boolean
          area_ids: number[] | null
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: number
          title: string
          description: string
          min_experience: number
          min_gold: number
          is_violent: boolean
          has_combat?: boolean
          area_ids?: number[] | null
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          title?: string
          description?: string
          min_experience?: number
          min_gold?: number
          is_violent?: boolean
          has_combat?: boolean
          area_ids?: number[] | null
          image_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      adventure_decisions: {
        Row: {
          id: number
          adventure_id: number
          description: string
          requirements: Json | null
          created_at: string
          type: string | null
          icon: string | null
          stat_check: string | null
          base_success_rate: number | null
          mastery: Json | null
        }
        Insert: {
          id?: number
          adventure_id: number
          description: string
          requirements?: Json | null
          created_at?: string
          type?: string | null
          icon?: string | null
          stat_check?: string | null
          base_success_rate?: number | null
          mastery?: Json | null
        }
        Update: {
          id?: number
          adventure_id?: number
          description?: string
          requirements?: Json | null
          created_at?: string
          type?: string | null
          icon?: string | null
          stat_check?: string | null
          base_success_rate?: number | null
          mastery?: Json | null
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
          id: number
          decision_id: number
          description: string
          experience_bonus: number
          gold_bonus: number
          reward_table_id: number | null
          hitpoints_change: number
          energy_change: number
          stat_requirements: Json | null
          success_rate_formula: Json | null
          has_combat: boolean
          monster_ids: number[] | null
          created_at: string
          is_success: boolean
        }
        Insert: {
          id?: number
          decision_id: number
          description: string
          experience_bonus: number
          gold_bonus: number
          reward_table_id?: number | null
          hitpoints_change: number
          energy_change: number
          stat_requirements?: Json | null
          success_rate_formula?: Json | null
          has_combat?: boolean
          monster_ids?: number[] | null
          created_at?: string
          is_success?: boolean
        }
        Update: {
          id?: number
          decision_id?: number
          description?: string
          experience_bonus?: number
          gold_bonus?: number
          reward_table_id?: number | null
          hitpoints_change?: number
          energy_change?: number
          stat_requirements?: Json | null
          success_rate_formula?: Json | null
          has_combat?: boolean
          monster_ids?: number[] | null
          created_at?: string
          is_success?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "adventure_outcomes_decision_id_fkey"
            columns: ["decision_id"]
            referencedRelation: "adventure_decisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adventure_outcomes_reward_table_id_fkey"
            columns: ["reward_table_id"]
            referencedRelation: "reward_tables"
            referencedColumns: ["id"]
          }
        ]
      }
      character_adventures: {
        Row: {
          id: string
          character_id: string
          adventure_id: number
          decision_id: number | null
          outcome_id: number | null
          day: number
          adventure_number: number
          experience_gained: number
          gold_gained: number
          item_gained_id: number | null
          completed_at: string
        }
        Insert: {
          id?: string
          character_id: string
          adventure_id: number
          decision_id?: number | null
          outcome_id?: number | null
          day: number
          adventure_number: number
          experience_gained: number
          gold_gained: number
          item_gained_id?: number | null
          completed_at?: string
        }
        Update: {
          id?: string
          character_id?: string
          adventure_id?: number
          decision_id?: number | null
          outcome_id?: number | null
          day?: number
          adventure_number?: number
          experience_gained?: number
          gold_gained?: number
          item_gained_id?: number | null
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
      combat: {
        Row: {
          id: string
          character_id: string
          adventure_id: number
          outcome_id: number
          monster_id: number
          is_completed: boolean
          is_victory: boolean | null
          turns: number
          character_damage_dealt: number
          monster_damage_dealt: number
          player_effects: Json | null
          enemy_effects: Json | null
          current_turn: number
          combat_log: Json | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          character_id: string
          adventure_id: number
          outcome_id: number
          monster_id: number
          is_completed?: boolean
          is_victory?: boolean | null
          turns?: number
          character_damage_dealt?: number
          monster_damage_dealt?: number
          player_effects?: Json | null
          enemy_effects?: Json | null
          current_turn?: number
          combat_log?: Json | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          character_id?: string
          adventure_id?: number
          outcome_id?: number
          monster_id?: number
          is_completed?: boolean
          is_victory?: boolean | null
          turns?: number
          character_damage_dealt?: number
          monster_damage_dealt?: number
          player_effects?: Json | null
          enemy_effects?: Json | null
          current_turn?: number
          created_at?: string
          completed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "combat_character_id_fkey"
            columns: ["character_id"]
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "combat_adventure_id_fkey"
            columns: ["adventure_id"]
            referencedRelation: "adventures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "combat_outcome_id_fkey"
            columns: ["outcome_id"]
            referencedRelation: "adventure_outcomes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "combat_monster_id_fkey"
            columns: ["monster_id"]
            referencedRelation: "monsters"
            referencedColumns: ["id"]
          }
        ]
      }
      combat_turns: {
        Row: {
          id: string
          combat_id: string
          turn_number: number
          actor: string
          action: string
          skill_id: number | null
          damage_dealt: number | null
          healing_done: number | null
          effects: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          combat_id: string
          turn_number: number
          actor: string
          action: string
          skill_id?: number | null
          damage_dealt?: number | null
          healing_done?: number | null
          effects?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          combat_id?: string
          turn_number?: number
          actor?: string
          action?: string
          skill_id?: number | null
          damage_dealt?: number | null
          healing_done?: number | null
          effects?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "combat_turns_combat_id_fkey"
            columns: ["combat_id"]
            referencedRelation: "combat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "combat_turns_skill_id_fkey"
            columns: ["skill_id"]
            referencedRelation: "skills"
            referencedColumns: ["id"]
          }
        ]
      }
      world_boss: {
        Row: {
          id: number
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
          id?: number
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
          id?: number
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
          boss_id: number
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
          boss_id: number
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
          boss_id?: number
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
          boss_id: number
          week: number
          reward_tier: string
          item_id: number | null
          is_claimed: boolean
          created_at: string
          claimed_at: string | null
        }
        Insert: {
          id?: string
          character_id: string
          boss_id: number
          week: number
          reward_tier: string
          item_id?: number | null
          is_claimed?: boolean
          created_at?: string
          claimed_at?: string | null
        }
        Update: {
          id?: string
          character_id?: string
          boss_id?: number
          week?: number
          reward_tier?: string
          item_id?: number | null
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
