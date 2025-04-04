-- Five Adventures Database Schema (Updated)

-- Enable Row Level Security
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS character_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS character_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS character_adventures ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS character_boss_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS boss_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS character_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS character_combat ENABLE ROW LEVEL SECURITY;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  auth_provider TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Characters table
CREATE TABLE IF NOT EXISTS characters (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  class TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  experience INTEGER NOT NULL DEFAULT 0,
  gold INTEGER NOT NULL DEFAULT 100,
  strength INTEGER NOT NULL,
  intelligence INTEGER NOT NULL,
  agility INTEGER NOT NULL,
  luck INTEGER NOT NULL,
  max_hitpoints INTEGER NOT NULL,
  current_hitpoints INTEGER NOT NULL,
  max_energy INTEGER NOT NULL,
  current_energy INTEGER NOT NULL,
  daily_adventure_count INTEGER NOT NULL DEFAULT 0,
  last_played_day INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'unlinked',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Items table (with numeric ID)
CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  rarity TEXT NOT NULL,
  weapon_type TEXT,
  base_damage INTEGER,
  base_defense INTEGER,
  effects JSONB,
  value INTEGER NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Character Inventory table
CREATE TABLE IF NOT EXISTS character_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES characters(id),
  item_id INTEGER NOT NULL REFERENCES items(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Character Equipment table
CREATE TABLE IF NOT EXISTS character_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES characters(id) UNIQUE,
  weapon_id INTEGER REFERENCES items(id),
  helmet_id INTEGER REFERENCES items(id),
  armor_id INTEGER REFERENCES items(id),
  trinket_id INTEGER REFERENCES items(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shop Items table
CREATE TABLE IF NOT EXISTS shop_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id INTEGER NOT NULL REFERENCES items(id),
  day INTEGER NOT NULL,
  price INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skills table (new)
CREATE TABLE IF NOT EXISTS skills (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  class TEXT NOT NULL,
  energy_cost INTEGER NOT NULL,
  cooldown INTEGER NOT NULL DEFAULT 0,
  effects JSONB,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Character Skills table (new)
CREATE TABLE IF NOT EXISTS character_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES characters(id),
  skill_id INTEGER NOT NULL REFERENCES skills(id),
  level INTEGER NOT NULL DEFAULT 1,
  acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(character_id, skill_id)
);

-- Monsters table (new)
CREATE TABLE IF NOT EXISTS monsters (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  hitpoints INTEGER NOT NULL,
  attack INTEGER NOT NULL,
  defense INTEGER NOT NULL,
  experience_reward INTEGER NOT NULL,
  gold_reward INTEGER NOT NULL,
  difficulty INTEGER NOT NULL,
  attack_type TEXT NOT NULL,
  abilities JSONB,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reward Tables (new)
CREATE TABLE IF NOT EXISTS reward_tables (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reward Items (new)
CREATE TABLE IF NOT EXISTS reward_items (
  id SERIAL PRIMARY KEY,
  reward_table_id INTEGER NOT NULL REFERENCES reward_tables(id),
  item_id INTEGER NOT NULL REFERENCES items(id),
  chance INTEGER NOT NULL, -- 0-100
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adventures table (with numeric ID)
CREATE TABLE IF NOT EXISTS adventures (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  min_experience INTEGER NOT NULL DEFAULT 10,
  min_gold INTEGER NOT NULL DEFAULT 5,
  is_violent BOOLEAN NOT NULL DEFAULT true,
  has_combat BOOLEAN NOT NULL DEFAULT false,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adventure Decisions table
CREATE TABLE IF NOT EXISTS adventure_decisions (
  id SERIAL PRIMARY KEY,
  adventure_id INTEGER NOT NULL REFERENCES adventures(id),
  description TEXT NOT NULL,
  requirements JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adventure Outcomes table
CREATE TABLE IF NOT EXISTS adventure_outcomes (
  id SERIAL PRIMARY KEY,
  decision_id INTEGER NOT NULL REFERENCES adventure_decisions(id),
  description TEXT NOT NULL,
  experience_bonus INTEGER NOT NULL DEFAULT 0,
  gold_bonus INTEGER NOT NULL DEFAULT 0,
  reward_table_id INTEGER REFERENCES reward_tables(id),
  hitpoints_change INTEGER NOT NULL DEFAULT 0,
  energy_change INTEGER NOT NULL DEFAULT 0,
  stat_requirements JSONB,
  success_rate_formula JSONB,
  has_combat BOOLEAN NOT NULL DEFAULT false,
  monster_ids INTEGER[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Character Adventures table
CREATE TABLE IF NOT EXISTS character_adventures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES characters(id),
  adventure_id INTEGER NOT NULL REFERENCES adventures(id),
  decision_id INTEGER REFERENCES adventure_decisions(id),
  outcome_id INTEGER REFERENCES adventure_outcomes(id),
  day INTEGER NOT NULL,
  adventure_number INTEGER NOT NULL,
  experience_gained INTEGER NOT NULL,
  gold_gained INTEGER NOT NULL,
  item_gained_id INTEGER REFERENCES items(id),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Combat table (new)
CREATE TABLE IF NOT EXISTS combat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES characters(id),
  adventure_id INTEGER NOT NULL REFERENCES adventures(id),
  outcome_id INTEGER NOT NULL REFERENCES adventure_outcomes(id),
  monster_id INTEGER NOT NULL REFERENCES monsters(id),
  is_completed BOOLEAN NOT NULL DEFAULT false,
  is_victory BOOLEAN,
  turns INTEGER NOT NULL DEFAULT 0,
  character_damage_dealt INTEGER NOT NULL DEFAULT 0,
  monster_damage_dealt INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Combat Turns table (new)
CREATE TABLE IF NOT EXISTS combat_turns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  combat_id UUID NOT NULL REFERENCES combat(id),
  turn_number INTEGER NOT NULL,
  actor TEXT NOT NULL, -- 'character' or 'monster'
  action TEXT NOT NULL, -- 'attack', 'skill', 'run'
  skill_id INTEGER REFERENCES skills(id),
  damage_dealt INTEGER,
  healing_done INTEGER,
  effects JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- World Boss table (with numeric ID)
CREATE TABLE IF NOT EXISTS world_boss (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  week INTEGER NOT NULL,
  total_hitpoints INTEGER NOT NULL,
  current_hitpoints INTEGER NOT NULL,
  player_count INTEGER NOT NULL DEFAULT 0,
  attack_count INTEGER NOT NULL DEFAULT 0,
  total_damage INTEGER NOT NULL DEFAULT 0,
  is_defeated BOOLEAN NOT NULL DEFAULT false,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  defeated_at TIMESTAMP WITH TIME ZONE
);

-- Character Boss Progress table
CREATE TABLE IF NOT EXISTS character_boss_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES characters(id),
  boss_id INTEGER NOT NULL REFERENCES world_boss(id),
  week INTEGER NOT NULL,
  attack_count INTEGER NOT NULL DEFAULT 0,
  total_damage INTEGER NOT NULL DEFAULT 0,
  pending_rewards BOOLEAN NOT NULL DEFAULT false,
  pending_reward_week INTEGER,
  last_attack TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(character_id, boss_id)
);

-- Boss Rewards table
CREATE TABLE IF NOT EXISTS boss_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES characters(id),
  boss_id INTEGER NOT NULL REFERENCES world_boss(id),
  week INTEGER NOT NULL,
  reward_tier TEXT NOT NULL,
  item_id INTEGER REFERENCES items(id),
  is_claimed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  claimed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_characters_user_id ON characters(user_id);
CREATE INDEX IF NOT EXISTS idx_character_inventory_character_id ON character_inventory(character_id);
CREATE INDEX IF NOT EXISTS idx_character_equipment_character_id ON character_equipment(character_id);
CREATE INDEX IF NOT EXISTS idx_shop_items_day ON shop_items(day);
CREATE INDEX IF NOT EXISTS idx_adventure_decisions_adventure_id ON adventure_decisions(adventure_id);
CREATE INDEX IF NOT EXISTS idx_adventure_outcomes_decision_id ON adventure_outcomes(decision_id);
CREATE INDEX IF NOT EXISTS idx_character_adventures_character_id ON character_adventures(character_id);
CREATE INDEX IF NOT EXISTS idx_character_adventures_day ON character_adventures(day);
CREATE INDEX IF NOT EXISTS idx_world_boss_week ON world_boss(week);
CREATE INDEX IF NOT EXISTS idx_character_boss_progress_character_id ON character_boss_progress(character_id);
CREATE INDEX IF NOT EXISTS idx_character_boss_progress_boss_id ON character_boss_progress(boss_id);
CREATE INDEX IF NOT EXISTS idx_boss_rewards_character_id ON boss_rewards(character_id);
CREATE INDEX IF NOT EXISTS idx_boss_rewards_boss_id ON boss_rewards(boss_id);
CREATE INDEX IF NOT EXISTS idx_character_skills_character_id ON character_skills(character_id);
CREATE INDEX IF NOT EXISTS idx_combat_character_id ON combat(character_id);
CREATE INDEX IF NOT EXISTS idx_combat_turns_combat_id ON combat_turns(combat_id);
CREATE INDEX IF NOT EXISTS idx_reward_items_reward_table_id ON reward_items(reward_table_id);

-- Row Level Security Policies

-- Users can only access their own data
CREATE POLICY users_policy ON users
  FOR ALL
  USING (auth.uid() = id);

-- Characters can only be accessed by their owner
CREATE POLICY characters_policy ON characters
  FOR ALL
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Character inventory can only be accessed by the character's owner
CREATE POLICY character_inventory_policy ON character_inventory
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM characters
    WHERE characters.id = character_inventory.character_id
    AND (characters.user_id = auth.uid() OR characters.user_id IS NULL)
  ));

-- Character equipment can only be accessed by the character's owner
CREATE POLICY character_equipment_policy ON character_equipment
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM characters
    WHERE characters.id = character_equipment.character_id
    AND (characters.user_id = auth.uid() OR characters.user_id IS NULL)
  ));

-- Character adventures can only be accessed by the character's owner
CREATE POLICY character_adventures_policy ON character_adventures
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM characters
    WHERE characters.id = character_adventures.character_id
    AND (characters.user_id = auth.uid() OR characters.user_id IS NULL)
  ));

-- Character boss progress can only be accessed by the character's owner
CREATE POLICY character_boss_progress_policy ON character_boss_progress
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM characters
    WHERE characters.id = character_boss_progress.character_id
    AND (characters.user_id = auth.uid() OR characters.user_id IS NULL)
  ));

-- Boss rewards can only be accessed by the character's owner
CREATE POLICY boss_rewards_policy ON boss_rewards
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM characters
    WHERE characters.id = boss_rewards.character_id
    AND (characters.user_id = auth.uid() OR characters.user_id IS NULL)
  ));

-- Character skills can only be accessed by the character's owner
CREATE POLICY character_skills_policy ON character_skills
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM characters
    WHERE characters.id = character_skills.character_id
    AND (characters.user_id = auth.uid() OR characters.user_id IS NULL)
  ));

-- Combat can only be accessed by the character's owner
CREATE POLICY combat_policy ON character_combat
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM characters
    WHERE characters.id = character_combat.character_id
    AND (characters.user_id = auth.uid() OR characters.user_id IS NULL)
  ));

-- Insert default skills for each class
INSERT INTO skills (id, name, description, class, energy_cost, cooldown, effects, image_url) VALUES
  (1, 'Rage', 'Enter a rage, increasing your strength and attack power for 3 turns.', 'Warrior', 15, 5, '{"strength_boost": 5, "duration": 3}', 'rage'),
  (2, 'Fireball', 'Launch a ball of fire at your enemy, dealing high damage.', 'Wizard', 20, 2, '{"damage_multiplier": 1.5, "element": "fire"}', 'fireball'),
  (3, 'Pickpocket', 'Attempt to steal gold or an item from your enemy.', 'Thief', 10, 3, '{"gold_chance": 75, "item_chance": 25}', 'pickpocket'),
  (4, 'Trap', 'Set a trap that damages and slows your enemy.', 'Ranger', 15, 4, '{"damage": 10, "slow": 2}', 'trap'),
  (5, 'Heal', 'Restore health to yourself.', 'Cleric', 25, 3, '{"healing": 30}', 'heal');

-- Sample monsters
INSERT INTO monsters (id, name, description, hitpoints, attack, defense, experience_reward, gold_reward, difficulty, attack_type, abilities, image_url) VALUES
  (1, 'Forest Wolf', 'A fierce wolf with sharp teeth and keen senses.', 50, 8, 3, 25, 15, 1, 'Physical', '{"bite": {"damage": 10, "chance": 25}}', 'forest_wolf'),
  (2, 'Goblin Scout', 'A small, nimble goblin armed with a crude dagger.', 40, 6, 2, 20, 20, 1, 'Physical', '{"sneak_attack": {"damage": 12, "chance": 20}}', 'goblin_scout'),
  (3, 'Skeleton Warrior', 'An animated skeleton wielding a rusty sword.', 60, 7, 5, 30, 10, 2, 'Physical', '{"bone_shield": {"defense_boost": 3, "chance": 30}}', 'skeleton_warrior'),
  (4, 'Fire Imp', 'A small, mischievous creature made of living flame.', 35, 10, 1, 35, 25, 2, 'Magical', '{"flame_burst": {"damage": 15, "chance": 25}}', 'fire_imp'),
  (5, 'Cave Troll', 'A large, brutish troll with tough, stony skin.', 100, 12, 8, 50, 40, 3, 'Physical', '{"smash": {"damage": 20, "chance": 20}}', 'cave_troll'),
  (6, 'Dark Mage', 'A human mage corrupted by dark magic.', 70, 15, 4, 60, 50, 3, 'Magical', '{"shadow_bolt": {"damage": 18, "chance": 30}}', 'dark_mage'),
  (7, 'Giant Spider', 'A massive spider with venomous fangs.', 80, 9, 6, 40, 30, 2, 'Physical', '{"web": {"immobilize": 1, "chance": 25}, "poison": {"damage_over_time": 3, "duration": 3, "chance": 20}}', 'giant_spider'),
  (8, 'Bandit Leader', 'A skilled and ruthless bandit chief.', 90, 11, 7, 45, 60, 3, 'Physical', '{"precise_strike": {"damage": 16, "ignore_defense": true, "chance": 20}}', 'bandit_leader'),
  (9, 'Stone Golem', 'A massive construct made of animated stone.', 120, 14, 12, 70, 35, 4, 'Physical', '{"earthquake": {"damage": 25, "chance": 15}}', 'stone_golem'),
  (10, 'Ancient Lich', 'An undead sorcerer of immense power.', 100, 18, 6, 80, 70, 4, 'Magical', '{"soul_drain": {"damage": 20, "life_steal": true, "chance": 25}, "frost_nova": {"damage": 15, "slow": 2, "chance": 20}}', 'ancient_lich');

-- Sample reward tables
INSERT INTO reward_tables (id, name, description) VALUES
  (1, 'Common Loot', 'Basic rewards with common items'),
  (2, 'Dungeon Treasures', 'Valuable items found in dungeons and ruins'),
  (3, 'Magical Artifacts', 'Rare magical items with special properties'),
  (4, 'Boss Spoils', 'Exceptional rewards from defeating powerful enemies');

-- Sample reward items (will be populated after items are created)
