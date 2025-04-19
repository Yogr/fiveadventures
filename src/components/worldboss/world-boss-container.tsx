'use client';

import { useState, useEffect } from 'react';
import type { WorldBoss, CharacterBossProgress, Character, BossReward } from '@/lib/types';
import WorldBossStats from './world-boss-stats';
import WorldBossAttackPanel from './world-boss-attack-panel';
import WorldBossRewardsPanel from './world-boss-rewards-panel';
import { canAttackWorldBossToday, getPendingRewards } from '@/app/actions/worldboss';

interface WorldBossContainerProps {
  initialBoss: WorldBoss;
  initialProgress: CharacterBossProgress;
  character: Character;
  pendingRewards: BossReward[];
}

export default function WorldBossContainer({
  initialBoss,
  initialProgress,
  character,
  pendingRewards: initialPendingRewards
}: WorldBossContainerProps) {
  const [boss, setBoss] = useState<WorldBoss>(initialBoss);
  const [progress, setProgress] = useState<CharacterBossProgress>(initialProgress);
  const [canAttackToday, setCanAttackToday] = useState(false);
  const [pendingRewards, setPendingRewards] = useState<BossReward[]>(initialPendingRewards);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check if character can attack today
  useEffect(() => {
    const checkCanAttack = async () => {
      try {
        const response = await canAttackWorldBossToday(character.id);
        
        if (response.success) {
          setCanAttackToday(response.data || false);
        }
      } catch (err) {
        console.error('Error checking if can attack:', err);
      }
    };
    
    checkCanAttack();
  }, [character.id, progress]);
  
  // Handle attack completion
  const handleAttackComplete = (damage: number, canAttackAgain: boolean, bossDefeated: boolean) => {
    // Update boss stats
    setBoss(prevBoss => ({
      ...prevBoss,
      current_hitpoints: Math.max(0, prevBoss.current_hitpoints - damage),
      attack_count: prevBoss.attack_count + 1,
      total_damage: prevBoss.total_damage + damage,
      is_defeated: bossDefeated || prevBoss.is_defeated
    }));
    
    // Update character progress
    setProgress(prevProgress => ({
      ...prevProgress,
      attack_count: prevProgress.attack_count + 1,
      total_damage: prevProgress.total_damage + damage,
      last_attack: new Date().toISOString()
    }));
    
    // Update can attack status
    setCanAttackToday(canAttackAgain);
  };
  
  // Handle reward claimed
  const handleRewardClaimed = async () => {
    setIsLoading(true);
    
    try {
      const response = await getPendingRewards(character.id);
      
      if (response.success) {
        setPendingRewards(response.data || []);
      }
    } catch (err) {
      console.error('Error refreshing rewards:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div>
      <WorldBossStats boss={boss} />
      
      <WorldBossAttackPanel
        characterId={character.id}
        progress={progress}
        canAttack={canAttackToday && !boss.is_defeated}
        onAttackComplete={handleAttackComplete}
      />
      
      <WorldBossRewardsPanel
        pendingRewards={pendingRewards}
        onRewardClaimed={handleRewardClaimed}
      />
      
      {error && (
        <div className="mt-4 p-2 bg-red-800 bg-opacity-60 text-red-100 text-center rounded-md">
          {error}
        </div>
      )}
    </div>
  );
}
