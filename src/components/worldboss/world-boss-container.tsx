'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { WorldBoss, CharacterBossProgress, Character, Item } from '@/lib/types';
import WorldBossScene from './WorldBossScene';
import WorldBossAttackPanel from './world-boss-attack-panel';
import WorldBossPotentialRewards from './world-boss-potential-rewards';
import { canAttackWorldBossToday } from '@/app/actions/worldboss';

interface WorldBossContainerProps {
  initialBoss: WorldBoss;
  initialProgress: CharacterBossProgress;
  character: Character;
  claimedRewards: Item[];
  legendaryItems: Item[];
  challengerItems: Item[];
  basicItems: Item[];
}

export default function WorldBossContainer({
  initialBoss,
  initialProgress,
  character,
  claimedRewards,
  legendaryItems,
  challengerItems,
  basicItems
}: WorldBossContainerProps) {
  const [boss, setBoss] = useState<WorldBoss>(initialBoss);
  const [progress, setProgress] = useState<CharacterBossProgress>(initialProgress);
  const [canAttackToday, setCanAttackToday] = useState(false);
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
    setBoss(prevBoss => {
      if (!prevBoss.status) return prevBoss;
      
      return {
        ...prevBoss,
        status: {
          ...prevBoss.status,
          current_hitpoints: Math.max(0, (prevBoss.status.current_hitpoints || 0) - damage),
          attack_count: (prevBoss.status.attack_count || 0) + 1,
          total_damage_received: (prevBoss.status.total_damage_received || 0) + damage,
          defeated_at: bossDefeated ? new Date().toISOString() : prevBoss.status.defeated_at
        }
      };
    });
    
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
  
  
  return (
    <div>
      {/* Display the WorldBossScene with character and boss */}
      <WorldBossScene 
        character={character}
        boss={boss}
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
        canAttack={(canAttackToday && 
          !((boss.status?.current_hitpoints || 0) <= 0 || 
            (boss.status?.total_damage_received || 0) >= (boss.status?.total_hitpoints || 0)) && 
          character.status !== 'unlinked')}
        onAttackComplete={handleAttackComplete}
      />
      
      {/* Display claimed rewards notification if any */}
      {claimedRewards.length > 0 && (
        <div className="bg-gradient-to-b from-yellow-950 to-black p-4 rounded-lg mt-4 border border-amber-900">
          <h4 className="text-amber-200 font-bold mb-3 text-center">Rewards Claimed</h4>
          <div className="text-amber-100">
            <p>You've received {claimedRewards.length} item{claimedRewards.length !== 1 ? 's' : ''} from previous World Boss battles:</p>
            <ul className="list-disc pl-5 mt-2">
              {claimedRewards.map((item, index) => (
                <li key={index} className="text-amber-300">{item.name} ({item.rarity})</li>
              ))}
            </ul>
            <p className="mt-2 text-sm text-amber-400">These items have been added to your inventory.</p>
          </div>
        </div>
      )}
      
      {/* Display potential rewards information */}
      <WorldBossPotentialRewards 
        boss={boss}
        legendaryItems={legendaryItems}
        challengerItems={challengerItems}
        basicItems={basicItems}
      />
      
      {error && (
        <div className="mt-4 p-2 bg-red-800 bg-opacity-60 text-red-100 text-center rounded-md">
          {error}
        </div>
      )}
    </div>
  );
}
