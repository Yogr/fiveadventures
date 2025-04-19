'use client';

import { useState } from 'react';
import type { CharacterBossProgress } from '@/lib/types';
import { attackWorldBoss } from '@/app/actions/worldboss';
import { formatNumber } from '@/lib/utils';

interface WorldBossAttackPanelProps {
  characterId: string;
  progress: CharacterBossProgress;
  canAttack: boolean;
  onAttackComplete: (damage: number, canAttackAgain: boolean, bossDefeated: boolean) => void;
}

export default function WorldBossAttackPanel({
  characterId,
  progress,
  canAttack,
  onAttackComplete
}: WorldBossAttackPanelProps) {
  const [isAttacking, setIsAttacking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attackResult, setAttackResult] = useState<{
    damage: number;
    bossDefeated: boolean;
  } | null>(null);
  
  const handleAttack = async () => {
    if (!canAttack || isAttacking) return;
    
    setIsAttacking(true);
    setError(null);
    
    try {
      const response = await attackWorldBoss(characterId);
      
      if (!response.success || !response.data) {
        setError(response.error || 'Failed to attack world boss');
        setIsAttacking(false);
        return;
      }
      
      const result = response.data;
      setAttackResult({
        damage: result.damage,
        bossDefeated: result.bossDefeated
      });
      
      // Notify parent component
      onAttackComplete(result.damage, result.canAttackAgain, result.bossDefeated);
      
      // Reset after a delay
      setTimeout(() => {
        setAttackResult(null);
        setIsAttacking(false);
      }, 3000);
    } catch (err) {
      console.error('Error attacking world boss:', err);
      setError('An unexpected error occurred');
      setIsAttacking(false);
    }
  };
  
  return (
    <div className="bg-amber-950 bg-opacity-50 p-4 rounded-lg mt-4">
      <h4 className="text-amber-200 font-bold mb-3 text-center">Your Progress</h4>
      
      <div className="grid grid-cols-2 gap-2 text-sm mb-4">
        <div className="bg-amber-900 bg-opacity-50 p-2 rounded-md">
          <div className="text-amber-300">Total Attacks</div>
          <div className="text-amber-100 font-medium">{progress.attack_count}</div>
        </div>
        <div className="bg-amber-900 bg-opacity-50 p-2 rounded-md">
          <div className="text-amber-300">Total Damage</div>
          <div className="text-amber-100 font-medium">{formatNumber(progress.total_damage)}</div>
        </div>
      </div>
      
      {attackResult && (
        <div className="mb-4 p-3 bg-amber-800 bg-opacity-60 text-amber-100 text-center rounded-md animate-pulse">
          <div className="font-bold text-lg">{formatNumber(attackResult.damage)} damage!</div>
          {attackResult.bossDefeated && (
            <div className="text-green-300 mt-1">The boss has been defeated!</div>
          )}
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-2 bg-red-800 bg-opacity-60 text-red-100 text-center rounded-md">
          {error}
        </div>
      )}
      
      <button
        onClick={handleAttack}
        disabled={!canAttack || isAttacking}
        className={`w-full py-3 rounded-md font-bold text-center transition-colors ${
          canAttack && !isAttacking
            ? 'bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white'
            : 'bg-amber-900 text-amber-600 cursor-not-allowed'
        }`}
      >
        {isAttacking ? 'Attacking...' : !canAttack ? 'Already Attacked Today' : 'Attack Boss'}
      </button>
    </div>
  );
}
