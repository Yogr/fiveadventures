'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { Character } from '@/lib/types';
import { ROUTES } from '@/lib/constants';

interface DungeonKeyDisplayProps {
  character: Character;
  onClick?: () => void;
}

export default function DungeonKeyDisplay({ character, onClick }: DungeonKeyDisplayProps) {
  const [dungeonKeys, setDungeonKeys] = useState(character.dungeon_keys || 0);
  const [dungeonKeyParts, setDungeonKeyParts] = useState(character.dungeon_key_parts || 0);
  const router = useRouter();

  // Update when character changes
  useEffect(() => {
    setDungeonKeys(character.dungeon_keys || 0);
    setDungeonKeyParts(character.dungeon_key_parts || 0);
  }, [character.dungeon_keys, character.dungeon_key_parts]);

  // We now always show the component, even when there are no keys
  // Default state will show 0 keys
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (dungeonKeys > 0) {
      // Navigate to dungeon page if there are keys
      router.push(ROUTES.DUNGEON);
    }
  };

  return (
    <button 
      onClick={handleClick}
      className={`flex items-center w-full ${dungeonKeys > 0 ? 'cursor-pointer hover:bg-amber-800/80' : 'cursor-default'}`}
      disabled={dungeonKeys === 0}
      title={dungeonKeys > 0 ? "Enter dungeon" : "Collect more key parts to form a dungeon key"}
    >
      <div className="w-4 h-4 mr-1 flex items-center justify-center">
        <Image
          src="/image/ui/dungeon_key.png"
          alt="Dungeon Key"
          width={16}
          height={16}
          className="object-contain"
        />
      </div>
      <span className="font-medium text-amber-300">
        {dungeonKeys || 0}
      </span>
      
      {dungeonKeys > 0 && (
        <span className="text-amber-400/70 ml-1">
          ↗
        </span>
      )}
    </button>
  );
}
