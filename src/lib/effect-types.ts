'use client';

/**
 * Interface for effect type definitions
 */
export interface EffectType {
  value: string;        // Unique identifier
  label: string;        // Display name
  type: string;         // Data type (number, boolean, etc.)
  description: string;  // Human-readable description
  category?: string;    // Optional category (damage, buff, debuff, etc.)
  applicableTo?: string[]; // Where can this effect be used (items, skills, both)
}

/**
 * The central effect types definition used throughout the application
 * This is the single source of truth for all effect types
 */
export const EFFECT_TYPES: EffectType[] = [
  { 
    value: 'damage_bonus', 
    label: 'Damage Bonus', 
    type: 'number', 
    description: 'Increases damage by a flat amount',
    category: 'combat',
    applicableTo: ['items', 'skills']
  },
  { 
    value: 'defense_bonus', 
    label: 'Defense Bonus', 
    type: 'number', 
    description: 'Increases defense by a flat amount',
    category: 'combat',
    applicableTo: ['items', 'skills']
  },
  { 
    value: 'strength_bonus', 
    label: 'Strength Bonus', 
    type: 'number', 
    description: 'Increases strength by a flat amount',
    category: 'attribute',
    applicableTo: ['items', 'skills']
  },
  { 
    value: 'intelligence_bonus', 
    label: 'Intelligence Bonus', 
    type: 'number', 
    description: 'Increases intelligence by a flat amount',
    category: 'attribute',
    applicableTo: ['items', 'skills']
  },
  { 
    value: 'agility_bonus', 
    label: 'Agility Bonus', 
    type: 'number', 
    description: 'Increases agility by a flat amount',
    category: 'attribute',
    applicableTo: ['items', 'skills']
  },
  { 
    value: 'luck_bonus', 
    label: 'Luck Bonus', 
    type: 'number', 
    description: 'Increases luck by a flat amount',
    category: 'attribute',
    applicableTo: ['items', 'skills']
  },
  { 
    value: 'wisdom_bonus', 
    label: 'Wisdom Bonus', 
    type: 'number', 
    description: 'Increases wisdom by a flat amount',
    category: 'attribute',
    applicableTo: ['items', 'skills']
  },
  { 
    value: 'hitpoints_bonus', 
    label: 'Hitpoints Bonus', 
    type: 'number', 
    description: 'Increases maximum hitpoints by a flat amount',
    category: 'resource',
    applicableTo: ['items', 'skills']
  },
  { 
    value: 'energy_bonus', 
    label: 'Energy Bonus', 
    type: 'number', 
    description: 'Increases maximum energy by a flat amount',
    category: 'resource',
    applicableTo: ['items', 'skills']
  },
  { 
    value: 'critical_chance', 
    label: 'Critical Chance', 
    type: 'number', 
    description: 'Increases critical hit chance by percentage',
    category: 'combat',
    applicableTo: ['items', 'skills']
  },
  { 
    value: 'damage_multiplier', 
    label: 'Damage Multiplier', 
    type: 'number', 
    description: 'Multiplies damage by this factor',
    category: 'combat',
    applicableTo: ['items', 'skills']
  },
  { 
    value: 'defense_multiplier', 
    label: 'Defense Multiplier', 
    type: 'number', 
    description: 'Multiplies defense by this factor',
    category: 'combat',
    applicableTo: ['items', 'skills']
  },
  { 
    value: 'lifesteal', 
    label: 'Life Steal', 
    type: 'number', 
    description: 'Percentage of damage dealt returned as health',
    category: 'combat',
    applicableTo: ['items', 'skills']
  },
  { 
    value: 'dodge_chance', 
    label: 'Dodge Chance', 
    type: 'number', 
    description: 'Chance to completely avoid an attack',
    category: 'combat',
    applicableTo: ['items', 'skills']
  },
  { 
    value: 'gold_find', 
    label: 'Gold Find', 
    type: 'number', 
    description: 'Increases gold found by percentage',
    category: 'reward',
    applicableTo: ['items']
  },
  { 
    value: 'experience_bonus', 
    label: 'Experience Bonus', 
    type: 'number', 
    description: 'Increases experience gained by percentage',
    category: 'reward',
    applicableTo: ['items']
  },
  { 
    value: 'healing_bonus', 
    label: 'Healing Bonus', 
    type: 'number', 
    description: 'Increases healing received by percentage',
    category: 'healing',
    applicableTo: ['items', 'skills']
  },
  { 
    value: 'damage_reduction', 
    label: 'Damage Reduction', 
    type: 'number', 
    description: 'Reduces damage taken by percentage',
    category: 'combat',
    applicableTo: ['items', 'skills']
  },
  { 
    value: 'bleed_chance', 
    label: 'Bleed Chance', 
    type: 'number', 
    description: 'Chance to cause a bleeding effect',
    category: 'status',
    applicableTo: ['items', 'skills']
  },
  { 
    value: 'bleed_damage', 
    label: 'Bleed Damage', 
    type: 'number', 
    description: 'Damage dealt by bleeding effect per turn',
    category: 'status',
    applicableTo: ['items', 'skills']
  },
  { 
    value: 'poison_chance', 
    label: 'Poison Chance', 
    type: 'number', 
    description: 'Chance to cause a poison effect',
    category: 'status',
    applicableTo: ['items', 'skills']
  },
  { 
    value: 'poison_damage', 
    label: 'Poison Damage', 
    type: 'number', 
    description: 'Damage dealt by poison effect per turn',
    category: 'status',
    applicableTo: ['items', 'skills']
  },
  { 
    value: 'burn_chance', 
    label: 'Burn Chance', 
    type: 'number', 
    description: 'Chance to cause a burning effect',
    category: 'status',
    applicableTo: ['items', 'skills']
  },
  { 
    value: 'burn_damage', 
    label: 'Burn Damage', 
    type: 'number', 
    description: 'Damage dealt by burning effect per turn',
    category: 'status',
    applicableTo: ['items', 'skills']
  },
  { 
    value: 'stun_chance', 
    label: 'Stun Chance', 
    type: 'number', 
    description: 'Chance to stun the target for one turn',
    category: 'status',
    applicableTo: ['items', 'skills']
  },
  { 
    value: 'skill_cooldown_reduction', 
    label: 'Skill Cooldown Reduction', 
    type: 'number', 
    description: 'Reduces skill cooldowns by turns',
    category: 'utility',
    applicableTo: ['items', 'skills']
  },
  // Skill-specific effects
  { 
    value: 'healing', 
    label: 'Healing', 
    type: 'number', 
    description: 'Heals the target for this amount',
    category: 'healing',
    applicableTo: ['skills']
  },
  { 
    value: 'healing_over_time', 
    label: 'Healing Over Time', 
    type: 'number', 
    description: 'Heals the target for this amount each turn',
    category: 'healing',
    applicableTo: ['skills']
  },
  { 
    value: 'damage_over_time', 
    label: 'Damage Over Time', 
    type: 'number', 
    description: 'Deals this amount of damage each turn',
    category: 'status',
    applicableTo: ['skills']
  },
  { 
    value: 'duration', 
    label: 'Duration', 
    type: 'number', 
    description: 'How many turns the effect lasts',
    category: 'utility',
    applicableTo: ['skills']
  },
  { 
    value: 'shield', 
    label: 'Shield', 
    type: 'number', 
    description: 'Absorbs this much damage before breaking',
    category: 'combat',
    applicableTo: ['skills']
  },
  { 
    value: 'stun', 
    label: 'Stun', 
    type: 'checkbox', 
    description: 'Target cannot act while stunned',
    category: 'status',
    applicableTo: ['skills']
  },
  { 
    value: 'immobilize', 
    label: 'Immobilize', 
    type: 'checkbox', 
    description: 'Target cannot move while immobilized',
    category: 'status',
    applicableTo: ['skills']
  },
  { 
    value: 'slow', 
    label: 'Slow', 
    type: 'number', 
    description: 'Reduces target speed by percentage',
    category: 'status',
    applicableTo: ['skills']
  },
  { 
    value: 'strength_boost', 
    label: 'Strength Boost', 
    type: 'number', 
    description: 'Temporarily increases strength',
    category: 'buff',
    applicableTo: ['skills']
  },
  { 
    value: 'intelligence_boost', 
    label: 'Intelligence Boost', 
    type: 'number', 
    description: 'Temporarily increases intelligence',
    category: 'buff',
    applicableTo: ['skills']
  },
  { 
    value: 'agility_boost', 
    label: 'Agility Boost', 
    type: 'number', 
    description: 'Temporarily increases agility',
    category: 'buff',
    applicableTo: ['skills']
  },
  { 
    value: 'luck_boost', 
    label: 'Luck Boost', 
    type: 'number', 
    description: 'Temporarily increases luck',
    category: 'buff',
    applicableTo: ['skills']
  },
  { 
    value: 'wisdom_boost', 
    label: 'Wisdom Boost', 
    type: 'number', 
    description: 'Temporarily increases wisdom',
    category: 'buff',
    applicableTo: ['skills']
  },
  { 
    value: 'defense_boost', 
    label: 'Defense Boost', 
    type: 'number', 
    description: 'Temporarily increases defense',
    category: 'buff',
    applicableTo: ['skills']
  },
  { 
    value: 'defense_reduction', 
    label: 'Defense Reduction', 
    type: 'number', 
    description: 'Temporarily reduces target defense',
    category: 'debuff',
    applicableTo: ['skills']
  },
  { 
    value: 'attack_reduction', 
    label: 'Attack Reduction', 
    type: 'number', 
    description: 'Temporarily reduces target attack',
    category: 'debuff',
    applicableTo: ['skills']
  },
  { 
    value: 'bonus_vs_undead', 
    label: 'Bonus vs Undead', 
    type: 'number', 
    description: 'Additional damage against undead enemies',
    category: 'combat',
    applicableTo: ['items', 'skills']
  },
  { 
    value: 'bonus_vs_demons', 
    label: 'Bonus vs Demons', 
    type: 'number', 
    description: 'Additional damage against demon enemies',
    category: 'combat',
    applicableTo: ['items', 'skills']
  },
  { 
    value: 'bonus_vs_beasts', 
    label: 'Bonus vs Beasts', 
    type: 'number', 
    description: 'Additional damage against beast enemies',
    category: 'combat',
    applicableTo: ['items', 'skills']
  }
];

/**
 * Get effect types applicable to items
 */
export function getItemEffectTypes(): EffectType[] {
  return EFFECT_TYPES.filter(effect => 
    effect.applicableTo?.includes('items') || !effect.applicableTo
  );
}

/**
 * Get effect types applicable to skills
 */
export function getSkillEffectTypes(): EffectType[] {
  return EFFECT_TYPES.filter(effect => 
    effect.applicableTo?.includes('skills') || !effect.applicableTo
  );
}

/**
 * Get effect types by category
 */
export function getEffectTypesByCategory(category: string): EffectType[] {
  return EFFECT_TYPES.filter(effect => effect.category === category);
}

/**
 * Get an effect type by its value
 */
export function getEffectTypeByValue(value: string): EffectType | undefined {
  return EFFECT_TYPES.find(effect => effect.value === value);
}

/**
 * Determine if an effect is a buff or debuff based on its properties
 */
export function determineEffectType(effect: Record<string, any>): 'buff' | 'debuff' | undefined {
  // Define which properties indicate buffs
  const buffProperties = [
    'strength_boost',
    'intelligence_boost',
    'agility_boost',
    'luck_boost',
    'wisdom_boost',
    'healing',
    'shield',
    'defense_boost',
    'gold_chance',
    'exp_boost'
  ];
  
  // Define which properties indicate debuffs
  const debuffProperties = [
    'slow',
    'immobilize',
    'damage_over_time',
    'defense_reduction',
    'attack_reduction',
    'stun'
  ];
  
  // Count how many buff and debuff properties exist in this effect
  const buffCount = buffProperties.filter(prop => effect[prop] !== undefined).length;
  const debuffCount = debuffProperties.filter(prop => effect[prop] !== undefined).length;
  
  // Classify based on which type has more properties
  if (buffCount > 0 && buffCount >= debuffCount) {
    return 'buff';
  } else if (debuffCount > 0) {
    return 'debuff';
  }
  
  // If no recognizable properties, return undefined
  return undefined;
}

/**
 * Add any unknown effect types to the EFFECT_TYPES array
 * This is useful for backward compatibility with existing data
 */
export function addCustomEffectTypes(effects: Record<string, any>[]): void {
  if (!effects || !Array.isArray(effects)) return;
  
  effects.forEach(effect => {
    if (!effect || typeof effect !== 'object') return;
    
    Object.keys(effect).forEach(key => {
      const existingEffectType = EFFECT_TYPES.find(et => et.value === key);
      if (!existingEffectType) {
        // Create a capitalized label from the effect type
        const label = key
          .replace(/_/g, ' ')
          .replace(/\b\w/g, char => char.toUpperCase());
        
        // Determine the type based on the value
        const valueType = typeof effect[key] === 'number' ? 'number' : 
                         typeof effect[key] === 'boolean' ? 'checkbox' : 'text';
        
        // Add the custom effect type
        EFFECT_TYPES.push({
          value: key,
          label,
          type: valueType,
          description: `Custom effect: ${label}`,
          category: 'custom'
        });
      }
    });
  });
}
