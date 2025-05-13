'use client';

import { useState, useEffect } from 'react';
import { XCircleIcon, PlusIcon } from '@heroicons/react/24/outline';
import { 
  EFFECT_TYPES, 
  addCustomEffectTypes as addCustomEffectTypesToGlobal,
  getEffectTypeByValue
} from '@/lib/effect-types';

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

// Add any unknown effect types to the EFFECT_TYPES array
function addCustomEffectTypes(effects: Effect[]) {
  // Convert to the format expected by the global function
  const effectsAsRecords = effects.map(effect => {
    const record: Record<string, any> = {};
    record[effect.type] = effect.value;
    return record;
  });
  
  // Call the global function to add custom effect types
  addCustomEffectTypesToGlobal(effectsAsRecords);
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
    const effectsArr = objectToEffectsArray(effects);
    
    // Add any custom effect types that might not be in our predefined list
    addCustomEffectTypes(effectsArr);
    
    setEffectsArray(effectsArr);
  }, [effects]);
  
  // Add a new empty effect
  const handleAddEffect = () => {
    // Default to first effect type if available
    const defaultType = EFFECT_TYPES && EFFECT_TYPES[0] ? EFFECT_TYPES[0].value : '';
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
                    {effectTypeInfo?.type === 'checkbox' ? (
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={Boolean(effect.value)}
                          onChange={(e) => handleUpdateEffect(index, 'value', e.target.checked)}
                          className="h-4 w-4 border-amber-300 rounded bg-gray-700 mr-2"
                          disabled={disabled}
                        />
                        <span className="text-sm text-amber-200">
                          {Boolean(effect.value) ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    ) : (
                      <input
                        type={effectTypeInfo?.type || 'number'}
                        value={String(effect.value)}
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
                    )}
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
