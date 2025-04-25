import { 
  GiBiceps,
  GiRunningNinja,
  GiClover,
  GiBrain,
  GiShield,
  GiBookCover,
  GiSwordsEmblem
} from 'react-icons/gi';

export const STAT_ICONS = {
  strength: GiBiceps, 
  intelligence: GiBrain,
  agility: GiRunningNinja,
  luck: GiClover,
  wisdom: GiBookCover,
  combat: GiSwordsEmblem,
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
