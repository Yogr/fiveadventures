'use client';

import { useState } from 'react';
import { ITEM_RARITY_COLORS } from '@/lib/constants';
import type { Item, ItemRarity } from '@/lib/types';
import { buyItem } from '@/app/actions/shop';

interface ShopItemProps {
  id: string;
  item: Item;
  price: number;
  onPurchase: () => void;
  playerGold: number;
}

export default function ShopItem({ id, item, price, onPurchase, playerGold }: ShopItemProps) {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const rarityColor = ITEM_RARITY_COLORS[item.rarity as ItemRarity] || 'text-gray-200';
  const canAfford = playerGold >= price;
  
  const handleBuy = async () => {
    if (!canAfford) {
      setError('Not enough gold');
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    setIsPurchasing(true);
    setError(null);
    
    try {
      const result = await buyItem(id);
      
      if (result.success) {
        onPurchase();
      } else {
        setError(result.error || 'Failed to purchase item');
      }
    } catch (err) {
      console.error('Error purchasing item:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsPurchasing(false);
    }
  };
  
  return (
    <div className="bg-gray-700 rounded-md p-3 mb-3 relative">
      <div className="flex justify-between items-start">
        <div>
          <h3 className={`font-medium text-lg ${rarityColor}`}>{item.name}</h3>
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
          <p className="text-yellow-300 font-medium">{price} Gold</p>
          <button
            onClick={handleBuy}
            disabled={isPurchasing || !canAfford}
            className={`mt-2 px-3 py-1 rounded text-sm font-medium ${
              canAfford 
                ? 'bg-green-600 hover:bg-green-500 text-white' 
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isPurchasing ? 'Buying...' : 'Buy'}
          </button>
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
