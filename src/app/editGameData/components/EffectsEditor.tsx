'use client';

import { useState, useEffect } from 'react';
import { XCircleIcon, PlusIcon } from '@heroicons/react/24/outline';

// Define the effect types and their descriptions
const EFFECT_TYPES = [
  { value: 'damage_bonus', label: 'Damage Bonus', type: 'number', description: 'Increases damage by a flat amount' },
  { value: 'defense_bonus', label: 'Defense Bonus', type: 'number', description: 'Increases defense by a flat amount' },
  { value: 'strength_bonus', label: 'Strength Bonus', type: 'number', description: 'Increases strength by a flat amount' },
  { value: 'intelligence_bonus', label: 'Intelligence Bonus', type: 'number', description: 'Increases intelligence by a flat amount' },
  { value: 'agility_bonus', label: 'Agility Bonus', type: 'number', description: 'Increases agility by a flat amount' },
  { value: 'luck_bonus', label: 'Luck Bonus', type: 'number', description: 'Increases luck by a flat amount' },
  { value: 'wisdom_bonus', label: 'Wisdom Bonus', type: 'number', description: 'Increases wisdom by a flat amount' },
  { value: 'hitpoints_bonus', label: 'Hitpoints Bonus', type: 'number', description: 'Increases maximum hitpoints by a flat amount' },
  { value: 'energy_bonus', label: 'Energy Bonus', type: 'number', description: 'Increases maximum energy by a flat amount' },
  { value: 'critical_chance', label: 'Critical Chance', type: 'number', description: 'Increases critical hit chance by percentage' },
  { value: 'damage_multiplier', label: 'Damage Multiplier', type: 'number', description: 'Multiplies damage by this factor' },
  { value: 'defense_multiplier', label: 'Defense Multiplier', type: 'number', description: 'Multiplies defense by this factor' },
  { value: 'lifesteal', label: 'Life Steal', type: 'number', description: 'Percentage of damage dealt returned as health' },
  { value: 'dodge_chance', label: 'Dodge Chance', type: 'number', description: 'Chance to completely avoid an attack' },
  { value: 'gold_find', label: 'Gold Find', type: 'number', description: 'Increases gold found by percentage' },
  { value: 'experience_bonus', label: 'Experience Bonus', type: 'number', description: 'Increases experience gained by percentage' },
  { value: 'healing_bonus', label: 'Healing Bonus', type: 'number', description: 'Increases healing received by percentage' },
  { value: 'damage_reduction', label: 'Damage Reduction', type: 'number', description: 'Reduces damage taken by percentage' },
  { value: 'bleed_chance', label: 'Bleed Chance', type: 'number', description: 'Chance to cause a bleeding effect' },
  { value: 'bleed_damage', label: 'Bleed Damage', type: 'number', description: 'Damage dealt by bleeding effect per turn' },
  { value: 'poison_chance', label: 'Poison Chance', type: 'number', description: 'Chance to cause a poison effect' },
  { value: 'poison_damage', label: 'Poison Damage', type: 'number', description: 'Damage dealt by poison effect per turn' },
  { value: 'burn_chance', label: 'Burn Chance', type: 'number', description: 'Chance to cause a burning effect' },
  { value: 'burn_damage', label: 'Burn Damage', type: 'number', description: 'Damage dealt by burning effect per turn' },
  { value: 'stun_chance', label: 'Stun Chance', type: 'number', description: 'Chance to stun the target for one turn' },
  { value: 'skill_cooldown_reduction', label: 'Skill Cooldown Reduction', type: 'number', description: 'Reduces skill cooldowns by turns' },
];

// Type for a single effect
type Effect = {
  type: string;
  value: number | string | boolean;
};

// Convert the effects object to an array of effects
function objectToEffectsArray(effectsObj: any): Effect[] {
  if (!effectsObj) return [];
  
  return Object.entries(effectsObj).map(([type, value]) => ({
    type,
    value: value as number | string | boolean
  }));
}

// Convert an array of effects back to an object
function effectsArrayToObject(effects: Effect[]): any {
  return effects.reduce((obj, effect) => {
    obj[effect.type] = effect.value;
    return obj;
  }, {} as any);
}

interface EffectsEditorProps {
  effects: any;
  onChange: (effects: any) => void;
  disabled?: boolean;
}

export default function EffectsEditor({ effects, onChange, disabled = false }: EffectsEditorProps) {
  const [effectsArray, setEffectsArray] = useState<Effect[]>([]);
  
  // Initialize effects array from effects object
  useEffect(() => {
    setEffectsArray(objectToEffectsArray(effects));
  }, [effects]);
  
  // Add a new empty effect
  const handleAddEffect = () => {
    // Default to first effect type if available
    const defaultType = EFFECT_TYPES && EFFECT_TYPES.length > 0 ? EFFECT_TYPES[0].value : '';
    const defaultValue = 0;
    
    setEffectsArray([...effectsArray, { type: defaultType, value: defaultValue }]);
    
    // Update parent component with the new effects object
    const newEffectsObj = effectsArrayToObject([...effectsArray, { type: defaultType, value: defaultValue }]);
    onChange(newEffectsObj);
  };
  
  // Remove an effect by index
  const handleRemoveEffect = (index: number) => {
    const newEffectsArray = [...effectsArray];
    newEffectsArray.splice(index, 1);
    setEffectsArray(newEffectsArray);
    
    // Update parent component with the new effects object
    const newEffectsObj = effectsArrayToObject(newEffectsArray);
    onChange(newEffectsObj);
  };
  
  // Update an effect
  const handleUpdateEffect = (index: number, field: 'type' | 'value', newValue: any) => {
    const newEffectsArray = [...effectsArray];
    
    // If changing the type, we need to make sure there aren't duplicates
    if (field === 'type') {
      // Check if this type already exists in another effect
      const typeExists = newEffectsArray.some((effect, i) => i !== index && effect.type === newValue);
      
      if (typeExists) {
        alert(`Effect type "${newValue}" already exists. Each effect type can only be added once.`);
        return;
      }
    }
    
    // Make sure we have a valid item at this index
    if (!newEffectsArray[index]) {
      return;
    }
    
    // Update with proper typing
    if (field === 'type') {
      newEffectsArray[index] = {
        ...newEffectsArray[index],
        type: newValue as string
      };
    } else {
      newEffectsArray[index] = {
        ...newEffectsArray[index],
        value: newValue as number | string | boolean
      };
    }
    
    setEffectsArray(newEffectsArray);
    
    // Update parent component with the new effects object
    const newEffectsObj = effectsArrayToObject(newEffectsArray);
    onChange(newEffectsObj);
  };
  
  const getEffectTypeInfo = (type: string) => {
    return EFFECT_TYPES.find(effectType => effectType.value === type);
  };
  
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-amber-200">Effects</h3>
        {!disabled && (
          <button
            onClick={handleAddEffect}
            className="flex items-center px-2 py-1 bg-amber-600 text-amber-100 rounded hover:bg-amber-700 text-sm"
          >
            <PlusIcon className="h-3 w-3 mr-1" />
            Add Effect
          </button>
        )}
      </div>
      
      {effectsArray.length === 0 ? (
        <div className="text-sm text-amber-400 italic">No effects added</div>
      ) : (
        <div className="space-y-3">
          {effectsArray.map((effect, index) => {
            const effectTypeInfo = getEffectTypeInfo(effect.type);
            
            return (
              <div key={index} className="flex items-start space-x-2 p-2 border border-amber-700/50 rounded-md bg-amber-900/30">
                <div className="flex-grow space-y-2">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-amber-300">Effect Type</label>
                    <select
                      value={effect.type}
                      onChange={(e) => handleUpdateEffect(index, 'type', e.target.value)}
                      className="admin-input w-full text-sm"
                      disabled={disabled}
                    >
                      {EFFECT_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium mb-1 text-amber-300">Value</label>
                    <input
                      type={effectTypeInfo?.type || 'number'}
                      value={typeof effect.value === 'boolean' ? (effect.value ? 'true' : 'false') : effect.value}
                      onChange={(e) => {
                        // Convert to number if it's a number type
                        const value = effectTypeInfo?.type === 'number' 
                          ? (parseFloat(e.target.value) || 0) 
                          : e.target.value;
                        
                        handleUpdateEffect(index, 'value', value);
                      }}
                      className="admin-input w-full text-sm"
                      disabled={disabled}
                    />
                  </div>
                  
                  {effectTypeInfo && (
                    <div className="text-xs text-amber-400 italic mt-1">
                      {effectTypeInfo.description}
                    </div>
                  )}
                </div>
                
                {!disabled && (
                  <button
                    onClick={() => handleRemoveEffect(index)}
                    className="text-red-500 hover:text-red-400 mt-1"
                  >
                    <XCircleIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {!disabled && effectsArray.length > 0 && (
        <div className="text-xs text-amber-500 mt-1">
          <div className="font-semibold">Current JSON:</div>
          <pre className="bg-amber-950/50 p-2 rounded mt-1 overflow-x-auto">
            {JSON.stringify(effectsArrayToObject(effectsArray), null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
