'use client';

import { useState, useEffect } from 'react';
import { getCombat } from '@/app/actions/combat';
import { getCharacterById } from '@/app/actions/character';
import CombatScene from './CombatScene';
import LoadingSpinner from '@/components/ui/loading-spinner';
import type { Combat, Character } from '@/lib/types';
import type { CombatEffect } from '@/lib/effect-utils';
import { createClient } from '@/lib/supabase/client';

interface CombatWrapperProps {
  combatId: string;
}

export default function CombatWrapper({ combatId }: CombatWrapperProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [combat, setCombat] = useState<Combat | null>(null);
  const [character, setCharacter] = useState<Character | null>(null);
  const [characterEffects, setCharacterEffects] = useState<CombatEffect[]>([]);
  const [monsterEffects, setMonsterEffects] = useState<CombatEffect[]>([]);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [areaImage, setAreaImage] = useState<string>('enchanted-forest');

  useEffect(() => {
    async function loadCombatData() {
      setLoading(true);
      setError(null);
      
      try {
        const supabase = createClient();
        
        // Get the current user's ID
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError('User not authenticated');
          setLoading(false);
          return;
        }
        
        // Get combat data
        const combatResponse = await getCombat(combatId);
        if (!combatResponse.success || !combatResponse.data) {
          setError('Failed to load combat data');
          setLoading(false);
          return;
        }
        
        const loadedCombat = combatResponse.data;
        setCombat(loadedCombat);
        
        // Get character data
        const characterResponse = await getCharacterById(user.id);
        if (!characterResponse.success || !characterResponse.data) {
          setError('Failed to load character data');
          setLoading(false);
          return;
        }
        
        setCharacter(characterResponse.data);
        
        // Extract effects from combat data
        const playerEffects = loadedCombat.player_effects as CombatEffect[] || [];
        const enemyEffects = loadedCombat.enemy_effects as CombatEffect[] || [];
        
        setCharacterEffects(playerEffects);
        setMonsterEffects(enemyEffects);
        
        // Extract combat log
        setCombatLog(loadedCombat.combat_log as string[] || []);
        
        // Get area image - you may need to adjust this depending on how area images are determined
        // For now, defaulting to 'enchanted-forest'
        setAreaImage('enchanted-forest');
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading combat data:', err);
        setError('An unexpected error occurred');
        setLoading(false);
      }
    }
    
    if (combatId) {
      loadCombatData();
    }
  }, [combatId]);

  const handleMonsterInfoClick = () => {
    // You can implement monster info display logic here if needed
    
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !combat || !character) {
    return (
      <div className="p-4 bg-red-900/50 text-red-100 rounded-md">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p>{error || 'Failed to load combat'}</p>
      </div>
    );
  }

  return (
    <CombatScene
      character={character}
      combat={combat}
      characterEffects={characterEffects}
      monsterEffects={monsterEffects}
      combatLog={combatLog}
      areaImage={areaImage}
      onMonsterInfoClick={handleMonsterInfoClick}
    />
  );
}
