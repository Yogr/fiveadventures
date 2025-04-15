'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { Item } from '@/lib/types';

interface ItemViewProps {
  item?: Item | null;
  slotName?: string;
  inventoryId?: string;
  isEquipped?: boolean;
  onClick?: (item: Item | null, event: React.MouseEvent, inventoryId?: string, isEquipped?: boolean) => void;
}

export default function ItemView({ item, slotName, inventoryId, isEquipped = false, onClick }: ItemViewProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  
  const handleClick = (event: React.MouseEvent) => {
    if (onClick && item) {
      onClick(item, event, inventoryId, isEquipped);
    }
  };
  
  // Extract stats from effects if available
  const getStatBoosts = (item: Item) => {
    if (!item.effects) return null;
    
    const effects = item.effects as any;
    return effects.stat_boosts || null;
  };
  
  // Get item description based on type and stats
  const getItemDescription = (item: Item) => {
    let description = `${item.rarity} ${item.type}`;
    
    if (item.base_damage) {
      description += ` • Damage: ${item.base_damage}`;
    }
    
    if (item.base_defense) {
      description += ` • Defense: ${item.base_defense}`;
    }
    
    return description;
  };
  
  // Get rarity color class
  const getRarityColorClass = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'border-gray-400';
      case 'Uncommon': return 'border-green-500';
      case 'Rare': return 'border-blue-500';
      case 'Epic': return 'border-purple-500';
      case 'Legendary': return 'border-yellow-500';
      default: return 'border-amber-700';
    }
  };
  
  // Get rarity glow class
  const getRarityGlowClass = (rarity: string) => {
    switch (rarity) {
      case 'Common': return '';
      case 'Uncommon': return 'shadow-sm shadow-green-500/50';
      case 'Rare': return 'shadow-md shadow-blue-500/50';
      case 'Epic': return 'shadow-lg shadow-purple-500/50';
      case 'Legendary': return 'shadow-xl shadow-yellow-500/50';
      default: return '';
    }
  };
  
  return (
    <div 
      className={`relative w-12 h-12 md:w-14 md:h-14 rounded-md border-2 overflow-hidden cursor-pointer ${
        item ? getRarityColorClass(item.rarity) : 'border-amber-700'
      } ${
        item ? getRarityGlowClass(item.rarity) : ''
      } ${
        item ? 'bg-gradient-to-br from-gray-900 to-gray-700' : 'bg-amber-950'
      }`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={handleClick}
    >
      {item ? (
        <>
          <div className="w-full h-full relative">
            {item.image_url ? (
              
              <Image
                src={`/image/${item.type.toLowerCase()}/${item.image_url}.png`}
                alt={item.name}
                fill
                sizes="(max-width: 768px) 48px, 56px"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-amber-200 text-xs">
                {item.name.charAt(0)}
              </div>
            )}
            
          </div>
          
          {/* Item tooltip */}
          {showTooltip && (
            <div className={`absolute z-10 bottom-full left-0 mb-1 w-48 bg-gradient-to-br from-gray-900 to-gray-800 p-2 rounded-md border-2 ${getRarityColorClass(item.rarity)} text-xs shadow-lg`}>
              <p className={`font-bold ${
                item.rarity === 'Common' ? 'text-gray-300' :
                item.rarity === 'Uncommon' ? 'text-green-400' :
                item.rarity === 'Rare' ? 'text-blue-400' :
                item.rarity === 'Epic' ? 'text-purple-400' :
                'text-yellow-400' // Legendary
              }`}>{item.name}</p>
              <p className="text-amber-300 mt-1">{getItemDescription(item)}</p>
              
              {/* Stats from effects */}
              {item.effects && (
                <div className="mt-1">
                  {getStatBoosts(item) && Object.entries(getStatBoosts(item)).map(([stat, value]) => (
                    <p key={stat} className="text-green-400">
                      {stat.charAt(0).toUpperCase() + stat.slice(1)}: +{String(value)}
                    </p>
                  ))}
                  
                  {/* Show elemental effects if any */}
                  {(item.effects as any).elemental && (
                    <p className="text-blue-400">
                      {(item.effects as any).elemental.type} Damage: +{(item.effects as any).elemental.damage}
                    </p>
                  )}
                  
                  {/* Show special effects if any */}
                  {(item.effects as any).special && (
                    <p className="text-purple-400">
                      {(item.effects as any).special.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-amber-700 text-xs">
          {slotName || 'Empty'}
        </div>
      )}
    </div>
  );
}
