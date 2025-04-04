'use client';

import { useState, useEffect } from 'react';

interface WorldBoss {
  name: string;
  total_hitpoints: number;
  current_hitpoints: number;
  week: number;
  image_url: string | null;
}

export default function WorldBossButtonCompanion() {
  const [worldBoss, setWorldBoss] = useState<WorldBoss | null>(null);
  const [daysRemaining, setDaysRemaining] = useState<number>(7);
  
  // In a real implementation, this would fetch the current world boss data from the server
  useEffect(() => {
    // Mock data for now
    setWorldBoss({
      name: "Ancient Dragon",
      total_hitpoints: 10000,
      current_hitpoints: 7500,
      week: 1,
      image_url: null
    });
    
    // Calculate days remaining in the week (mock calculation)
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0-6, where 0 is Sunday
    const daysToNextWeek = 7 - dayOfWeek;
    setDaysRemaining(daysToNextWeek);
  }, []);
  
  if (!worldBoss) {
    return null;
  }
  
  const hpPercentage = (worldBoss.current_hitpoints / worldBoss.total_hitpoints) * 100;
  
  return (
    <div className="bg-gray-800 p-1 sm:p-2 rounded-md flex items-center gap-2 ml-1 shadow-lg">
      {/* Boss image placeholder */}
      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-sm sm:text-base">{worldBoss.name.charAt(0)}</span>
      </div>
      
      <div className="flex-grow">
        {/* HP Bar */}
        <div className="w-16 sm:w-24">
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-red-600" 
              style={{ width: `${Math.max(0, Math.min(100, hpPercentage))}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-200 mt-0.5">
            Days: {daysRemaining}
          </div>
        </div>
      </div>
    </div>
  );
}
