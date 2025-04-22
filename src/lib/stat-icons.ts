import { 
  GiBiceps, // Strength
  GiMagicSwirl, // Intelligence 
  GiRunningNinja, // Agility
  GiClover, // Luck
  GiBrain, // Wisdom
  GiSwordsPower, // Combat
  GiShield // Safe
} from 'react-icons/gi';

export const STAT_ICONS = {
  strength: GiBiceps, 
  intelligence: GiMagicSwirl,
  agility: GiRunningNinja,
  luck: GiClover,
  wisdom: GiBrain,
  combat: GiSwordsPower,
  safe: GiShield
};

export const STAT_COLORS = {
  strength: 'text-red-400',
  intelligence: 'text-blue-400',
  agility: 'text-yellow-400',
  luck: 'text-green-400',
  wisdom: 'text-purple-400',
  combat: 'text-amber-500',
  safe: 'text-amber-400'
};

export const STAT_NAMES = {
  strength: 'Strength',
  intelligence: 'Intelligence',
  agility: 'Agility',
  luck: 'Luck',
  wisdom: 'Wisdom'
};
