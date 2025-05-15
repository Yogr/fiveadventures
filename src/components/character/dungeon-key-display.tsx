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

  // Update when character changes
  useEffect(() => {
    setDungeonKeys(character.dungeon_keys || 0);
  }, [character.dungeon_keys]);

  // We now always show the component, even when there are no keys
  // Default state will show 0 keys

  return (
    <div className="w-full h-4 mr-1 flex items-center justify-between">
      <Image
        src="/image/ui/dungeon_key.png"
        alt="Dungeon Key"
        width={16}
        height={16}
        className="object-contain"
      />
      <span className="font-medium text-amber-300">
        {dungeonKeys || 0}
      </span>
    </div>
  );
}
