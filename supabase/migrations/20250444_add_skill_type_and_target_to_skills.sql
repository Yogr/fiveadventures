-- Add skill_type and target columns to the skills table
ALTER TABLE skills
ADD COLUMN skill_type VARCHAR(50) NULL,
ADD COLUMN target VARCHAR(50) NULL;

-- Add comments for the new columns
COMMENT ON COLUMN skills.skill_type IS 'Type of skill: buff, debuff, damage, heal, action, other';
COMMENT ON COLUMN skills.target IS 'Target of the skill: all, singleEnemy, multiEnemy, self, team';

-- Update existing skills with default values based on their characteristics
-- We'll set defaults based on skills with healing or defensive effects as buffs targeting self
-- and damage/debuff skills targeting enemies
UPDATE skills
SET 
  skill_type = CASE
    WHEN effects->>'healing' IS NOT NULL OR effects->>'healing_over_time' IS NOT NULL THEN 'heal'
    WHEN effects->>'defense_boost' IS NOT NULL OR effects->>'strength_boost' IS NOT NULL OR effects->>'agility_boost' IS NOT NULL OR effects->>'intelligence_boost' IS NOT NULL OR effects->>'luck_boost' IS NOT NULL OR effects->>'wisdom_boost' IS NOT NULL THEN 'buff'
    WHEN effects->>'damage_multiplier' IS NOT NULL OR effects->>'damage_boost' IS NOT NULL THEN 'damage'
    WHEN effects->>'damage_over_time' IS NOT NULL OR effects->>'slow' IS NOT NULL OR effects->>'immobilize' IS NOT NULL OR effects->>'stun' IS NOT NULL OR effects->>'defense_reduction' IS NOT NULL THEN 'debuff'
    ELSE 'other'
  END,
  target = CASE
    WHEN effects->>'healing' IS NOT NULL OR effects->>'healing_over_time' IS NOT NULL OR effects->>'defense_boost' IS NOT NULL OR effects->>'strength_boost' IS NOT NULL OR effects->>'agility_boost' IS NOT NULL OR effects->>'intelligence_boost' IS NOT NULL OR effects->>'luck_boost' IS NOT NULL OR effects->>'wisdom_boost' IS NOT NULL THEN 'self'
    WHEN effects->>'damage_multiplier' IS NOT NULL OR effects->>'damage_boost' IS NOT NULL THEN 'singleEnemy'
    WHEN effects->>'damage_over_time' IS NOT NULL OR effects->>'slow' IS NOT NULL OR effects->>'immobilize' IS NOT NULL OR effects->>'stun' IS NOT NULL OR effects->>'defense_reduction' IS NOT NULL THEN 'singleEnemy'
    ELSE 'singleEnemy'
  END;
