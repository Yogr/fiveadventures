'use client';

import { useState, useEffect } from 'react';
import type { WorldBoss } from '@/lib/types';
import { getCurrentGameDay, formatNumber } from '@/lib/utils';

interface WorldBossStatsProps {
  boss: WorldBoss;
  refreshInterval?: number; // in milliseconds
}

export default function WorldBossStats({
  boss: initialBoss,
  refreshInterval = 10000 // 10 seconds default
}: WorldBossStatsProps) {
  const [boss, setBoss] = useState<WorldBoss>(initialBoss);
  const [daysRemaining, setDaysRemaining] = useState<number>(7);
  
  // Calculate days remaining in the week
  useEffect(() => {
    const currentDay = getCurrentGameDay();
    const dayOfWeek = currentDay % 7; // 0-6, where 0 is the first day of the week
    const daysToNextWeek = dayOfWeek === 0 ? 7 : 7 - dayOfWeek;
    setDaysRemaining(daysToNextWeek);
  }, []);
  
  // Update boss state from props
  useEffect(() => {
    setBoss(initialBoss);
  }, [initialBoss]);
  
  // Calculate HP percentage
  const hpPercentage = (boss.current_hitpoints / boss.total_hitpoints) * 100;
  
  return (
    <div className="bg-amber-950 bg-opacity-50 p-4 rounded-lg">
      <div className="flex flex-col items-center mb-6">
        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-amber-900 rounded-full flex items-center justify-center mb-4 border border-amber-700">
          {boss.image_url ? (
            <img 
              src={boss.image_url} 
              alt={boss.name} 
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-3xl sm:text-4xl text-amber-200">{boss.name.charAt(0)}</span>
          )}
        </div>
        
        <h3 className="text-lg sm:text-xl font-bold mb-2 text-amber-200">{boss.name}</h3>
        
        <div className="text-sm text-amber-300 text-center mb-1">
          <span>Week {boss.week}</span>
          <span className="mx-2">•</span>
          <span>{daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining</span>
        </div>
      </div>
      
      <div className="w-full mb-4">
        <div className="flex justify-between text-sm mb-1 text-amber-200">
          <span>HP</span>
          <span>{formatNumber(boss.current_hitpoints)} / {formatNumber(boss.total_hitpoints)}</span>
        </div>
        <div className="h-4 bg-amber-900 rounded-md overflow-hidden">
          <div 
            className="h-full bg-red-600" 
            style={{ width: `${Math.max(0, Math.min(100, hpPercentage))}%` }}
          ></div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm mb-4">
        <div className="bg-amber-900 bg-opacity-50 p-2 rounded-md">
          <div className="text-amber-300">Players</div>
          <div className="text-amber-100 font-medium">{formatNumber(boss.player_count)}</div>
        </div>
        <div className="bg-amber-900 bg-opacity-50 p-2 rounded-md">
          <div className="text-amber-300">Attacks</div>
          <div className="text-amber-100 font-medium">{formatNumber(boss.attack_count)}</div>
        </div>
        <div className="bg-amber-900 bg-opacity-50 p-2 rounded-md col-span-2">
          <div className="text-amber-300">Total Damage</div>
          <div className="text-amber-100 font-medium">{formatNumber(boss.total_damage)}</div>
        </div>
      </div>
      
      <p className="text-amber-200 text-sm text-center">
        {boss.description}
      </p>
      
      {boss.is_defeated && (
        <div className="mt-4 p-2 bg-green-800 bg-opacity-50 text-green-100 text-center rounded-md">
          This boss has been defeated!
        </div>
      )}
    </div>
  );
}
