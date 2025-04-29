'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { WorldBoss, CharacterBossProgress, Character, BossReward } from '@/lib/types';
import WorldBossScene from './WorldBossScene';
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
  const [combatLog, setCombatLog] = useState<string[]>([]);
  
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
    // Add attack message to combat log
    const attackMessage = `${character.name} dealt ${damage.toLocaleString()} damage to ${boss.name}!`;
    setCombatLog(prev => [...prev.slice(-2), attackMessage]); // Keep only the last 3 messages maximum
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
      {/* Display the WorldBossScene with character and boss */}
      <WorldBossScene 
        character={character}
        boss={boss}
        combatLog={combatLog}
        areaImage="abyssal-realm"
      />
      
      {/* Warning for unlinked characters */}
      {character.status === 'unlinked' && (
        <div className="mb-4 mt-4 bg-amber-100 border-l-4 border-amber-500 text-amber-900 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">
                World Boss battles require a linked account!
              </p>
              <p className="mt-1 text-sm">
                Create an account or sign in to save your character and compete against the World Boss.
              </p>
              <p className="mt-2">
                <Link href="/login" className="inline-flex items-center px-3 py-1 border border-amber-600 text-sm leading-5 font-medium rounded-md text-amber-800 bg-amber-200 hover:bg-amber-300 focus:outline-none focus:border-amber-700 focus:shadow-outline-amber active:bg-amber-300 transition ease-in-out duration-150">
                  Sign In Now
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}

      <WorldBossAttackPanel
        characterId={character.id}
        progress={progress}
        canAttack={(canAttackToday && !boss.is_defeated && character.status !== 'unlinked')}
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
