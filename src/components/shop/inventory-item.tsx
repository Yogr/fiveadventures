'use client';

import { useState } from 'react';
import { ITEM_RARITY_COLORS } from '@/lib/constants';
import type { Item, ItemRarity } from '@/lib/types';
import { sellItem } from '@/app/actions/shop';

interface InventoryItemProps {
  id: string;
  item: Item;
  isEquipped?: boolean;
  onSell: () => void;
}

export default function InventoryItem({ id, item, isEquipped = false, onSell }: InventoryItemProps) {
  const [isSelling, setIsSelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const rarityColor = ITEM_RARITY_COLORS[item.rarity as ItemRarity] || 'text-gray-200';
  const sellPrice = Math.round(item.value * 0.5);
  
  const handleSell = async () => {
    if (isEquipped) {
      setError('Cannot sell equipped item');
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    setIsSelling(true);
    setError(null);
    
    try {
      const result = await sellItem(id);
      
      if (result.success) {
        onSell();
      } else {
        setError(result.error || 'Failed to sell item');
      }
    } catch (err) {
      console.error('Error selling item:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsSelling(false);
    }
  };
  
  return (
    <div className={`bg-gray-700 rounded-md p-3 mb-3 relative ${isEquipped ? 'border-2 border-yellow-500' : ''}`}>
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center">
            <h3 className={`font-medium text-lg ${rarityColor}`}>{item.name}</h3>
            {isEquipped && (
              <span className="ml-2 bg-yellow-600 text-yellow-100 text-xs px-2 py-0.5 rounded">
                Equipped
              </span>
            )}
          </div>
          
          <p className="text-sm text-gray-300">{item.type} {item.weapon_type ? `(${item.weapon_type})` : ''}</p>
          
          {/* Item stats */}
          <div className="mt-1 text-sm">
            {item.base_damage && (
              <p className="text-red-400">Damage: {item.base_damage}</p>
            )}
            {item.base_defense && (
              <p className="text-blue-400">Defense: {item.base_defense}</p>
            )}
            
            {/* Item effects summary */}
            {item.effects && typeof item.effects === 'object' && !Array.isArray(item.effects) && (
              <div className="mt-1 text-xs text-gray-300">
                {item.effects.stat_boosts && typeof item.effects.stat_boosts === 'object' && 
                  Object.entries(item.effects.stat_boosts as Record<string, number>).map(([stat, value]) => (
                    <p key={stat} className="text-green-400">
                      +{value} {stat.charAt(0).toUpperCase() + stat.slice(1)}
                    </p>
                  ))
                }
                
                {item.effects.elemental && typeof item.effects.elemental === 'object' && (
                  <p className="text-purple-400">
                    +{(item.effects.elemental as any).damage} {(item.effects.elemental as any).type} damage
                  </p>
                )}
                
                {item.effects.critical_hit && typeof item.effects.critical_hit === 'object' && (
                  <p className="text-yellow-400">
                    {(item.effects.critical_hit as any).chance}% chance to deal {(item.effects.critical_hit as any).multiplier}x damage
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-yellow-300 font-medium">{sellPrice} Gold</p>
          {!isEquipped && (
            <button
              onClick={handleSell}
              disabled={isSelling}
              className="mt-2 px-3 py-1 rounded text-sm font-medium bg-red-600 hover:bg-red-500 text-white"
            >
              {isSelling ? 'Selling...' : 'Sell'}
            </button>
          )}
        </div>
      </div>
      
      {error && (
        <div className="absolute bottom-0 left-0 right-0 bg-red-600 text-white text-center text-sm py-1 rounded-b-md">
          {error}
        </div>
      )}
    </div>
  );
}
