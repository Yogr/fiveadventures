'use client';

import { useState } from 'react';
import type { BossReward } from '@/lib/types';

interface WorldBossRewardModalProps {
  reward: BossReward;
  isOpen: boolean;
  onClose: () => void;
  onClaim: (rewardId: string) => Promise<void>;
  isClaiming: boolean;
}

export default function WorldBossRewardModal({
  reward,
  isOpen,
  onClose,
  onClaim,
  isClaiming
}: WorldBossRewardModalProps) {
  const [error, setError] = useState<string | null>(null);
  
  if (!isOpen) return null;
  
  const handleClaim = async () => {
    setError(null);
    try {
      await onClaim(reward.id);
    } catch (err) {
      console.error('Error claiming reward:', err);
      setError('An unexpected error occurred');
    }
  };
  
  // Get the appropriate color based on reward tier
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Legendary':
        return 'text-yellow-400 border-yellow-400';
      case 'Epic':
        return 'text-purple-400 border-purple-400';
      case 'Rare':
        return 'text-blue-400 border-blue-400';
      default:
        return 'text-gray-300 border-gray-300';
    }
  };
  
  const tierColor = getTierColor(reward.reward_tier);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="bg-amber-950 border-2 border-amber-800 rounded-lg w-full max-w-md overflow-hidden shadow-xl">
        <div className="p-5">
          <h3 className="text-xl font-bold text-amber-200 mb-2">World Boss Reward</h3>
          <p className="text-amber-300 text-sm mb-4">
            From defeating World Boss in Week {reward.week}
          </p>
          
          {/* Reward item */}
          <div className="bg-amber-900 bg-opacity-40 p-4 rounded-lg mb-4">
            <div className={`inline-block px-2 py-1 rounded-md text-xs font-bold mb-2 border ${tierColor}`}>
              {reward.reward_tier}
            </div>
            
            <div className="flex items-center">
              <div className="bg-amber-800 rounded-md w-16 h-16 flex items-center justify-center mr-4 flex-shrink-0">
                {reward.item?.image_url ? (
                  <img 
                    src={reward.item.image_url} 
                    alt={reward.item.name} 
                    className="w-12 h-12 object-contain"
                  />
                ) : (
                  <span className="text-2xl text-amber-200">{reward.item?.name.charAt(0)}</span>
                )}
              </div>
              
              <div>
                <h4 className="font-bold text-amber-100">{reward.item?.name}</h4>
                <p className="text-sm text-amber-300">{reward.item?.type}</p>
                {reward.item?.type === 'Weapon' && (
                  <p className="text-sm text-amber-400">
                    Damage: {reward.item.base_damage}
                  </p>
                )}
                {(reward.item?.type === 'Armor' || reward.item?.type === 'Helmet') && (
                  <p className="text-sm text-amber-400">
                    Defense: {reward.item.base_defense}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {error && (
            <div className="mb-4 p-2 bg-red-800 bg-opacity-60 text-red-100 text-center rounded-md">
              {error}
            </div>
          )}
          
          <div className="flex justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-amber-800 text-amber-200 rounded-md hover:bg-amber-700"
              disabled={isClaiming}
            >
              Close
            </button>
            
            <button
              onClick={handleClaim}
              disabled={isClaiming}
              className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-500 disabled:bg-amber-900 disabled:text-amber-700"
            >
              {isClaiming ? 'Claiming...' : 'Claim Reward'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
