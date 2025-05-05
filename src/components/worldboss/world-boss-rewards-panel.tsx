'use client';

import { useState } from 'react';
import type { BossReward } from '@/lib/types';
import { claimBossReward } from '@/app/actions/worldboss';
import WorldBossRewardModal from './world-boss-reward-modal';
import Image from 'next/image';
import { ImageSource } from '@/lib/image-source';

interface WorldBossRewardsPanelProps {
  pendingRewards: BossReward[];
  onRewardClaimed: () => void;
}

export default function WorldBossRewardsPanel({
  pendingRewards,
  onRewardClaimed
}: WorldBossRewardsPanelProps) {
  const [selectedReward, setSelectedReward] = useState<BossReward | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleClaimReward = async (rewardId: string) => {
    if (isClaiming) return;
    
    setIsClaiming(true);
    setError(null);
    
    try {
      const response = await claimBossReward(rewardId);
      
      if (!response.success) {
        setError(response.error || 'Failed to claim reward');
        setIsClaiming(false);
        return;
      }
      
      // Close modal and notify parent
      setSelectedReward(null);
      onRewardClaimed();
      setIsClaiming(false);
    } catch (err) {
      console.error('Error claiming reward:', err);
      setError('An unexpected error occurred');
      setIsClaiming(false);
    }
  };
  
  if (pendingRewards.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-gradient-to-b from-yellow-950 to-black p-4 rounded-lg mt-4 border border-amber-900">
      <h4 className="text-amber-200 font-bold mb-3 text-center">Pending Rewards</h4>
      
      <div className="grid gap-2 mb-4">
        {pendingRewards.map((reward) => (
          <div 
            key={reward.id}
            className="bg-amber-900 bg-opacity-50 p-3 rounded-md flex items-center justify-between cursor-pointer hover:bg-amber-800 transition-colors"
            onClick={() => setSelectedReward(reward)}
          >
            <div className="flex items-center">
              <div className="bg-amber-800 rounded-md w-10 h-10 flex items-center justify-center mr-3 flex-shrink-0">
                {reward.item?.image_url ? (
                  <Image 
                    src={ImageSource.getItemImagePath(reward.item)} 
                    alt={reward.item.name} 
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                ) : (
                  <span className="text-lg text-amber-200">{reward.item?.name?.charAt(0) || '?'}</span>
                )}
              </div>
              
              <div>
                <div className="text-amber-100 font-medium">
                  Week {reward.week} Reward
                </div>
                <div className="text-xs text-amber-300">
                  Click to view
                </div>
              </div>
            </div>
            
            <div className={`text-xs font-bold px-2 py-1 rounded-md ${
              reward.reward_tier === 'Legendary' ? 'bg-yellow-900 text-yellow-300' :
              reward.reward_tier === 'Epic' ? 'bg-purple-900 text-purple-300' :
              reward.reward_tier === 'Rare' ? 'bg-blue-900 text-blue-300' :
              'bg-gray-800 text-gray-300'
            }`}>
              {reward.reward_tier}
            </div>
          </div>
        ))}
      </div>
      
      {error && (
        <div className="mb-4 p-2 bg-red-800 bg-opacity-60 text-red-100 text-center rounded-md">
          {error}
        </div>
      )}
      
      {selectedReward && (
        <WorldBossRewardModal
          reward={selectedReward}
          isOpen={true}
          onClose={() => setSelectedReward(null)}
          onClaim={handleClaimReward}
          isClaiming={isClaiming}
        />
      )}
    </div>
  );
}
