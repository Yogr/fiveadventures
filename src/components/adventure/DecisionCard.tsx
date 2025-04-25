'use client';

import React from 'react';
import type { AdventureDecision, Character } from '@/lib/types';
import { STAT_ICONS, STAT_COLORS, STAT_NAMES } from '@/lib/stat-icons';

type DecisionCardProps = {
  decision: AdventureDecision;
  character: Character;
  isSelected: boolean;
  onSelect: (decision: AdventureDecision) => void;
};

const DecisionCard: React.FC<DecisionCardProps> = ({ 
  decision, 
  character,
  isSelected, 
  onSelect 
}) => {
  // Parse requirements from JSON
  const requirements = decision.requirements ? (decision.requirements as Record<string, number>) : null;
  
  // Check if it's a combat decision by checking if any outcome has has_combat=true
  const isCombatDecision = decision.outcomes?.some(outcome => outcome.has_combat === true);
  
  // Check if it has stat requirements
  const statRequirement = requirements ? 
    Object.entries(requirements).find(([key]) => 
      ['strength', 'intelligence', 'agility', 'luck', 'wisdom'].includes(key)
    ) : null;
  
  // Determine if character meets requirements
  const meetsRequirements = !statRequirement || 
    ((character[statRequirement[0] as keyof Character] as number) >= (statRequirement[1] as number));
  
  // Don't render if character doesn't meet requirements
  if (!meetsRequirements) {
    return null;
  }
  
  // Get stat icon and color if this is a premium stat-based decision
  const StatIcon = statRequirement ? 
    STAT_ICONS[statRequirement[0] as keyof typeof STAT_ICONS] : undefined;
  
  const statColor = statRequirement ? 
    STAT_COLORS[statRequirement[0] as keyof typeof STAT_COLORS] : '';
  
  // Get combat icon if this is a combat decision
  const CombatIcon = isCombatDecision ? STAT_ICONS.combat : undefined;
  
  return (
    <div 
      className={`relative p-3 md:p-4 border-2 rounded-md cursor-pointer transition-all ${
        isSelected
          ? 'border-amber-500 bg-amber-900 bg-opacity-50'
          : 'border-amber-800 bg-amber-900 bg-opacity-30 hover:border-amber-600'
      } ${statRequirement ? 'border-l-4 ' + statColor : ''}`}
      onClick={() => onSelect(decision)}
    >      
      <p className="text-base text-amber-200 pr-8">{decision.description}</p>
      
      {/* Stat requirement indicator */}
      {StatIcon && statRequirement && (
        <div className={`flex items-center mt-2 ${statColor}`}>
          <StatIcon className="mr-1" />
          <span className="text-sm">
            {STAT_NAMES[statRequirement[0] as keyof typeof STAT_NAMES]} req: {statRequirement[1]}
          </span>
        </div>
      )}
    </div>
  );
};

export default DecisionCard;
