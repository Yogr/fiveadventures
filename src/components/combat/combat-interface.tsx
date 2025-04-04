'use client';

import { useState, useEffect } from 'react';
import { Combat, Monster, Character, Skill } from '@/lib/types';
import { getCombat, startCombatTurn, getCharacterSkills } from '@/app/actions/combat';
import LoadingSpinner from '@/components/ui/loading-spinner';

interface CombatInterfaceProps {
  combatId: string;
  character: Character;
  onCombatEnd: (isVictory: boolean) => void;
}

export default function CombatInterface({ combatId, character, onCombatEnd }: CombatInterfaceProps) {
  const [loading, setLoading] = useState(true);
  const [combat, setCombat] = useState<Combat | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [combatLog, setCombatLog] = useState<string[]>([]);

  // Load combat data
  useEffect(() => {
    async function loadCombatData() {
      setLoading(true);
      setError(null);
      
      try {
        // Get combat data
        const combatResponse = await getCombat(combatId);
        if (!combatResponse.success || !combatResponse.data) {
          setError('Failed to load combat data');
          setLoading(false);
          return;
        }
        
        setCombat(combatResponse.data);
        
        // Get character skills
        const skillsResponse = await getCharacterSkills(character.id);
        if (skillsResponse.success && skillsResponse.data) {
          setSkills(skillsResponse.data.filter(skill => skill.learned));
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading combat data:', err);
        setError('An unexpected error occurred');
        setLoading(false);
      }
    }
    
    loadCombatData();
  }, [combatId, character.id]);

  // Check if combat is completed
  useEffect(() => {
    if (combat?.is_completed && combat.is_victory !== null) {
      onCombatEnd(combat.is_victory);
    }
  }, [combat, onCombatEnd]);

  // Handle attack action
  const handleAttack = async () => {
    if (!combat || actionInProgress) return;
    
    setActionInProgress(true);
    
    try {
      const result = await startCombatTurn(combatId, 'attack');
      
      if (!result.success || !result.data) {
        setError(result.error || 'Failed to perform attack');
        setActionInProgress(false);
        return;
      }
      
      setCombat(result.data);
      addToCombatLog(`You attacked the ${combat.monster.name} for ${result.data.character_damage_dealt - combat.character_damage_dealt} damage!`);
      
      if (result.data.monster_damage_dealt > combat.monster_damage_dealt) {
        addToCombatLog(`The ${combat.monster.name} attacked you for ${result.data.monster_damage_dealt - combat.monster_damage_dealt} damage!`);
      }
      
      if (result.data.is_completed) {
        if (result.data.is_victory) {
          addToCombatLog(`You defeated the ${combat.monster.name}!`);
        } else {
          addToCombatLog(`You were defeated by the ${combat.monster.name}!`);
        }
      }
      
      setActionInProgress(false);
    } catch (err) {
      console.error('Error performing attack:', err);
      setError('An unexpected error occurred');
      setActionInProgress(false);
    }
  };

  // Handle skill action
  const handleUseSkill = async () => {
    if (!combat || !selectedSkill || actionInProgress) return;
    
    setActionInProgress(true);
    
    try {
      const result = await startCombatTurn(combatId, 'skill', selectedSkill.id);
      
      if (!result.success || !result.data) {
        setError(result.error || 'Failed to use skill');
        setActionInProgress(false);
        return;
      }
      
      setCombat(result.data);
      addToCombatLog(`You used ${selectedSkill.name}!`);
      
      if (result.data.character_damage_dealt > combat.character_damage_dealt) {
        addToCombatLog(`You dealt ${result.data.character_damage_dealt - combat.character_damage_dealt} damage to the ${combat.monster.name}!`);
      }
      
      if (result.data.monster_damage_dealt > combat.monster_damage_dealt) {
        addToCombatLog(`The ${combat.monster.name} attacked you for ${result.data.monster_damage_dealt - combat.monster_damage_dealt} damage!`);
      }
      
      if (result.data.is_completed) {
        if (result.data.is_victory) {
          addToCombatLog(`You defeated the ${combat.monster.name}!`);
        } else {
          addToCombatLog(`You were defeated by the ${combat.monster.name}!`);
        }
      }
      
      setSelectedSkill(null);
      setActionInProgress(false);
    } catch (err) {
      console.error('Error using skill:', err);
      setError('An unexpected error occurred');
      setActionInProgress(false);
    }
  };

  // Handle run action
  const handleRun = async () => {
    if (!combat || actionInProgress) return;
    
    setActionInProgress(true);
    
    try {
      const result = await startCombatTurn(combatId, 'run');
      
      if (!result.success || !result.data) {
        setError(result.error || 'Failed to run from combat');
        setActionInProgress(false);
        return;
      }
      
      setCombat(result.data);
      
      if (result.data.is_completed) {
        addToCombatLog('You successfully ran away from combat!');
      } else {
        addToCombatLog('You failed to run away!');
        
        if (result.data.monster_damage_dealt > combat.monster_damage_dealt) {
          addToCombatLog(`The ${combat.monster.name} attacked you for ${result.data.monster_damage_dealt - combat.monster_damage_dealt} damage!`);
        }
      }
      
      setActionInProgress(false);
    } catch (err) {
      console.error('Error running from combat:', err);
      setError('An unexpected error occurred');
      setActionInProgress(false);
    }
  };

  // Add message to combat log
  const addToCombatLog = (message: string) => {
    setCombatLog(prevLog => [...prevLog, message]);
  };

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  if (error) {
    return (
      <div className="bg-red-900 border border-red-500 p-4 rounded-md text-center">
        <p className="text-xl mb-4">{error}</p>
        <button 
          onClick={() => setError(null)} 
          className="pixel-button"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!combat) {
    return (
      <div className="text-center">
        <p className="text-xl mb-4">Combat not found</p>
      </div>
    );
  }

  // Calculate health percentages
  const characterHealthPercent = Math.max(0, Math.min(100, (character.current_hitpoints / character.max_hitpoints) * 100));
  const monsterHealthPercent = Math.max(0, Math.min(100, ((combat.monster.hitpoints - combat.character_damage_dealt) / combat.monster.hitpoints) * 100));
  
  return (
    <div className="pixel-border bg-gray-900 bg-opacity-80 p-6 animate-fadeIn">
      <h2 className="text-3xl mb-4 text-red-400 text-center">Combat!</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Character */}
        <div className="bg-gray-800 p-4 rounded-md">
          <h3 className="text-xl mb-2">{character.name}</h3>
          
          <div className="mb-2">
            <div className="flex justify-between mb-1">
              <span>HP: {character.current_hitpoints}/{character.max_hitpoints}</span>
              <span>{Math.round(characterHealthPercent)}%</span>
            </div>
            <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-600" 
                style={{ width: `${characterHealthPercent}%` }}
              ></div>
            </div>
          </div>
          
          <div className="mb-2">
            <div className="flex justify-between mb-1">
              <span>Energy: {character.current_energy}/{character.max_energy}</span>
              <span>{Math.round((character.current_energy / character.max_energy) * 100)}%</span>
            </div>
            <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600" 
                style={{ width: `${(character.current_energy / character.max_energy) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Monster */}
        <div className="bg-gray-800 p-4 rounded-md">
          <h3 className="text-xl mb-2">{combat.monster.name}</h3>
          
          <div className="mb-2">
            <div className="flex justify-between mb-1">
              <span>HP: {Math.max(0, combat.monster.hitpoints - combat.character_damage_dealt)}/{combat.monster.hitpoints}</span>
              <span>{Math.round(monsterHealthPercent)}%</span>
            </div>
            <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-600" 
                style={{ width: `${monsterHealthPercent}%` }}
              ></div>
            </div>
          </div>
          
          <p className="text-sm mt-2">{combat.monster.description}</p>
        </div>
      </div>
      
      {/* Combat Log */}
      <div className="bg-gray-800 p-4 rounded-md mb-6 h-40 overflow-y-auto">
        {combatLog.length === 0 ? (
          <p className="text-gray-400">Combat has begun! Choose your action...</p>
        ) : (
          combatLog.map((message, index) => (
            <p key={index} className="mb-1">{message}</p>
          ))
        )}
      </div>
      
      {/* Actions */}
      {!combat.is_completed && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <button 
            onClick={handleAttack}
            disabled={actionInProgress}
            className="pixel-button bg-red-600 hover:bg-red-500 active:bg-red-700 disabled:opacity-50"
          >
            Attack
          </button>
          
          <button 
            onClick={handleUseSkill}
            disabled={actionInProgress || skills.length === 0 || !selectedSkill}
            className="pixel-button bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50"
          >
            Use Skill
          </button>
          
          <button 
            onClick={handleRun}
            disabled={actionInProgress}
            className="pixel-button bg-yellow-600 hover:bg-yellow-500 active:bg-yellow-700 disabled:opacity-50"
          >
            Run
          </button>
        </div>
      )}
      
      {/* Skills */}
      {!combat.is_completed && skills.length > 0 && (
        <div className="bg-gray-800 p-4 rounded-md">
          <h3 className="text-xl mb-2">Skills</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {skills.map((skill) => (
              <div 
                key={skill.id}
                className={`p-2 border rounded-md cursor-pointer ${
                  selectedSkill?.id === skill.id
                    ? 'border-blue-500 bg-blue-900 bg-opacity-30'
                    : 'border-gray-600 hover:border-gray-400'
                }`}
                onClick={() => setSelectedSkill(skill)}
              >
                <div className="flex justify-between">
                  <span>{skill.name}</span>
                  <span className="text-blue-400">{skill.energy_cost} Energy</span>
                </div>
                <p className="text-sm text-gray-300">{skill.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Combat Completed */}
      {combat.is_completed && (
        <div className="text-center">
          <h3 className="text-2xl mb-4">
            {combat.is_victory 
              ? 'Victory!' 
              : 'Defeat!'}
          </h3>
          
          <button 
            onClick={() => onCombatEnd(combat.is_victory || false)}
            className="pixel-button text-xl"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}
