'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { Item } from '@/lib/types';

interface ItemViewProps {
  item?: Item | null;
  slotName?: string;
  onClick?: (item: Item | null) => void;
}

export default function ItemView({ item, slotName, onClick }: ItemViewProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  
  const handleClick = () => {
    if (onClick && item) {
      onClick(item);
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
  
  return (
    <div 
      className="relative w-12 h-12 md:w-14 md:h-14 bg-amber-900 rounded-md border border-amber-700 overflow-hidden cursor-pointer"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={handleClick}
    >
      {item ? (
        <>
          <div className="w-full h-full relative">
            {item.image_url ? (
              <Image
                src={item.image_url}
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
            
            {/* Rarity indicator */}
            <div className={`absolute bottom-0 left-0 right-0 h-1 ${
              item.rarity === 'Common' ? 'bg-gray-400' :
              item.rarity === 'Uncommon' ? 'bg-green-500' :
              item.rarity === 'Rare' ? 'bg-blue-500' :
              item.rarity === 'Epic' ? 'bg-purple-500' :
              'bg-yellow-500' // Legendary
            }`}></div>
          </div>
          
          {/* Item tooltip */}
          {showTooltip && (
            <div className="absolute z-10 bottom-full left-0 mb-1 w-48 bg-amber-950 p-2 rounded-md border border-amber-700 text-xs">
              <p className="font-bold text-amber-200">{item.name}</p>
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
