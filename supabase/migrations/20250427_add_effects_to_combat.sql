-- Add player_effects, enemy_effects, and current_turn columns to the combat table
ALTER TABLE combat 
ADD COLUMN player_effects JSONB DEFAULT '[]',
ADD COLUMN enemy_effects JSONB DEFAULT '[]',
ADD COLUMN current_turn INTEGER DEFAULT 1,
ADD COLUMN combat_log JSONB DEFAULT '[]';

-- Add note for future reference
COMMENT ON COLUMN combat.player_effects IS 'Active effects applied to the player character';
COMMENT ON COLUMN combat.enemy_effects IS 'Active effects applied to the monster/enemy';
COMMENT ON COLUMN combat.current_turn IS 'Current turn number in the combat';
COMMENT ON COLUMN combat.combat_log IS 'Text log of combat actions and events';
