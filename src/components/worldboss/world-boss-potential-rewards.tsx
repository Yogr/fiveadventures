'use client';

import { useState } from 'react';
import type { Item, WorldBoss } from '@/lib/types';
import ItemView from '@/components/character/item-view';
import ItemDetailModal from '@/components/shop/item-detail-modal';

interface WorldBossPotentialRewardsProps {
  boss: WorldBoss;
  legendaryItems: Item[];
  challengerItems: Item[];
  basicItems: Item[];
}

export default function WorldBossPotentialRewards({
  boss,
  legendaryItems,
  challengerItems,
  basicItems
}: WorldBossPotentialRewardsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  
  // Function to get reward tier color
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Legendary':
        return 'text-yellow-400 border-yellow-400';
      case 'Challenger':
        return 'text-purple-400 border-purple-400';
      case 'Basic':
        return 'text-gray-300 border-gray-300';
      default:
        return 'text-gray-300 border-gray-300';
    }
  };
  
  const handleItemClick = (item: Item | null) => {
    if (item) {
      setSelectedItem(item);
      setIsOpen(true);
    }
  };
  
  return (
    <div className="bg-gradient-to-b from-yellow-950 to-black p-4 rounded-lg mt-4 border border-amber-900">
      <h4 className="text-amber-200 font-bold mb-3 text-center">Potential Rewards</h4>
      
      <p className="text-amber-100 mb-4">
        Defeat the World Boss to earn rewards! Your reward tier depends on your performance:
      </p>
      
      <div className="space-y-4 mb-4">
        <div className="bg-amber-900 bg-opacity-50 p-3 rounded-md">
          <div className={`inline-block px-2 py-1 rounded-md text-xs font-bold mb-2 border ${getTierColor('Legendary')}`}>
            Legendary Tier
          </div>
          <p className="text-amber-100 text-sm mb-2">
            Deal above-average damage to the boss to earn the best rewards!
          </p>
          
          {/* Legendary items grid */}
          <div className="flex flex-row space-x-2 overflow-x-auto pb-2">
            {legendaryItems.length > 0 ? (
              legendaryItems.map(item => (
                <div key={item.id} className="flex-shrink-0">
                  <ItemView item={item} onClick={handleItemClick} />
                </div>
              ))
            ) : (
              <p className="text-amber-100 text-sm italic">No legendary rewards available</p>
            )}
          </div>
        </div>
        
        <div className="bg-amber-900 bg-opacity-50 p-3 rounded-md">
          <div className={`inline-block px-2 py-1 rounded-md text-xs font-bold mb-2 border ${getTierColor('Challenger')}`}>
            Challenger Tier
          </div>
          <p className="text-amber-100 text-sm mb-2">
            Deal damage to the boss to earn good rewards.
          </p>
          
          {/* Challenger items grid */}
          <div className="flex flex-row space-x-2 overflow-x-auto pb-2">
            {challengerItems.length > 0 ? (
              challengerItems.map(item => (
                <div key={item.id} className="flex-shrink-0">
                  <ItemView item={item} onClick={handleItemClick} />
                </div>
              ))
            ) : (
              <p className="text-amber-100 text-sm italic">No challenger rewards available</p>
            )}
          </div>
        </div>
        
        <div className="bg-amber-900 bg-opacity-50 p-3 rounded-md">
          <div className={`inline-block px-2 py-1 rounded-md text-xs font-bold mb-2 border ${getTierColor('Basic')}`}>
            Basic Tier
          </div>
          <p className="text-amber-100 text-sm mb-2">
            Participate in the boss fight to earn basic rewards.
          </p>
          
          {/* Basic items grid */}
          <div className="flex flex-row space-x-2 overflow-x-auto pb-2">
            {basicItems.length > 0 ? (
              basicItems.map(item => (
                <div key={item.id} className="flex-shrink-0">
                  <ItemView item={item} onClick={handleItemClick} />
                </div>
              ))
            ) : (
              <p className="text-amber-100 text-sm italic">No basic rewards available</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Item detail modal */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
