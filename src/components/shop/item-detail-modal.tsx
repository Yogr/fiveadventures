'use client';

import { ITEM_RARITY_COLORS } from '@/lib/constants';
import type { Item, ItemRarity } from '@/lib/types';
import Image from 'next/image';

interface ItemDetailModalProps {
  item: Item;
  isOpen: boolean;
  onClose: () => void;
  actionButton?: React.ReactNode; // Buy or Sell button
}

export default function ItemDetailModal({ item, isOpen, onClose, actionButton }: ItemDetailModalProps) {
  if (!isOpen) return null;
  
  const rarityColor = ITEM_RARITY_COLORS[item.rarity as ItemRarity] || 'text-gray-200';
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4 py-6" onClick={onClose}>
      <div className="bg-gray-950 bg-opacity-80 border border-slate-700 rounded-lg shadow-lg max-w-md w-full sm:w-[90%] md:w-[450px] p-4 sm:p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <h4 className={`font-medium text-xl ${rarityColor}`}>{item.name}</h4>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
        
        <div className="flex items-start mb-4">
          {/* Item image */}
          <div className={`mr-4 w-16 h-16 rounded-md flex items-center justify-center bg-gray-900 border-2 ${rarityColor.replace('text-', 'border-')}`}>
            {item.image_url ? (
              <Image
                src={`/image/${item.type.toLowerCase()}/${item.image_url}.png`}
                alt={item.name}
                width={48}
                height={48}
                className="object-contain"
              />
            ) : (
              <div className="w-12 h-12 flex items-center justify-center bg-gray-600 rounded">
                <span className="text-gray-400 text-xs">No img</span>
              </div>
            )}
          </div>
          
          {/* Item info */}
          <div className="flex-1">
            <p className="text-sm text-gray-300 mb-2">{item.type} {item.weapon_type ? `(${item.weapon_type})` : ''}</p>
            
            {/* Item stats */}
            <div className="text-sm">
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
        </div>
        
        {/* Action button (Buy or Sell) */}
        {actionButton && (
          <div className="mt-4 flex justify-end">
            {actionButton}
          </div>
        )}
      </div>
    </div>
  );
}
