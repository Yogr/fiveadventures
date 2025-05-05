-- Add stored procedures for leaderboard rankings

-- Level rank overall
CREATE OR REPLACE FUNCTION get_level_rank(p_character_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_rank INTEGER;
BEGIN
  SELECT 
    rank
  INTO
    v_rank
  FROM (
    SELECT 
      id,
      RANK() OVER (ORDER BY level DESC) as rank
    FROM 
      characters
  ) t
  WHERE id = p_character_id;
  
  RETURN v_rank;
END;
$$ LANGUAGE plpgsql;

-- Level rank by class
CREATE OR REPLACE FUNCTION get_level_rank_by_class(p_character_id UUID, p_class TEXT)
RETURNS INTEGER AS $$
DECLARE
  v_rank INTEGER;
BEGIN
  SELECT 
    rank
  INTO
    v_rank
  FROM (
    SELECT 
      id,
      RANK() OVER (ORDER BY level DESC) as rank
    FROM 
      characters
    WHERE
      class = p_class
  ) t
  WHERE id = p_character_id;
  
  RETURN v_rank;
END;
$$ LANGUAGE plpgsql;

-- Wealth rank
CREATE OR REPLACE FUNCTION get_wealth_rank(p_character_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_rank INTEGER;
BEGIN
  SELECT 
    rank
  INTO
    v_rank
  FROM (
    SELECT 
      id,
      RANK() OVER (ORDER BY gold DESC) as rank
    FROM 
      characters
  ) t
  WHERE id = p_character_id;
  
  RETURN v_rank;
END;
$$ LANGUAGE plpgsql;

-- Power rank overall
CREATE OR REPLACE FUNCTION get_power_rank(p_character_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_rank INTEGER;
BEGIN
  SELECT 
    rank
  INTO
    v_rank
  FROM (
    SELECT 
      character_id,
      RANK() OVER (ORDER BY power_level DESC) as rank
    FROM 
      character_stats
  ) t
  WHERE character_id = p_character_id;
  
  RETURN v_rank;
END;
$$ LANGUAGE plpgsql;

-- Power rank by class
CREATE OR REPLACE FUNCTION get_power_rank_by_class(p_character_id UUID, p_class TEXT)
RETURNS INTEGER AS $$
DECLARE
  v_rank INTEGER;
BEGIN
  SELECT 
    rank
  INTO
    v_rank
  FROM (
    SELECT 
      cs.character_id,
      RANK() OVER (ORDER BY cs.power_level DESC) as rank
    FROM 
      character_stats cs
    INNER JOIN
      characters c ON cs.character_id = c.id
    WHERE
      c.class = p_class
  ) t
  WHERE character_id = p_character_id;
  
  RETURN v_rank;
END;
$$ LANGUAGE plpgsql;

-- Adventures completed rank overall
CREATE OR REPLACE FUNCTION get_adventures_rank(p_character_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_rank INTEGER;
BEGIN
  SELECT 
    rank
  INTO
    v_rank
  FROM (
    SELECT 
      character_id,
      RANK() OVER (ORDER BY total_adventures_completed DESC) as rank
    FROM 
      character_stats
  ) t
  WHERE character_id = p_character_id;
  
  RETURN v_rank;
END;
$$ LANGUAGE plpgsql;

-- Adventures completed rank by class
CREATE OR REPLACE FUNCTION get_adventures_rank_by_class(p_character_id UUID, p_class TEXT)
RETURNS INTEGER AS $$
DECLARE
  v_rank INTEGER;
BEGIN
  SELECT 
    rank
  INTO
    v_rank
  FROM (
    SELECT 
      cs.character_id,
      RANK() OVER (ORDER BY cs.total_adventures_completed DESC) as rank
    FROM 
      character_stats cs
    INNER JOIN
      characters c ON cs.character_id = c.id
    WHERE
      c.class = p_class
  ) t
  WHERE character_id = p_character_id;
  
  RETURN v_rank;
END;
$$ LANGUAGE plpgsql;

-- Bosses slain rank overall
CREATE OR REPLACE FUNCTION get_bosses_slain_rank(p_character_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_rank INTEGER;
BEGIN
  SELECT 
    rank
  INTO
    v_rank
  FROM (
    SELECT 
      character_id,
      RANK() OVER (ORDER BY bosses_slain DESC) as rank
    FROM 
      character_stats
  ) t
  WHERE character_id = p_character_id;
  
  RETURN v_rank;
END;
$$ LANGUAGE plpgsql;

-- Boss damage rank overall
CREATE OR REPLACE FUNCTION get_boss_damage_rank(p_character_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_rank INTEGER;
BEGIN
  SELECT 
    rank
  INTO
    v_rank
  FROM (
    SELECT 
      character_id,
      RANK() OVER (ORDER BY highest_boss_damage DESC) as rank
    FROM 
      character_stats
  ) t
  WHERE character_id = p_character_id;
  
  RETURN v_rank;
END;
$$ LANGUAGE plpgsql;
