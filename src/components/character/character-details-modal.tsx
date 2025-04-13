'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Character, Item } from '@/lib/types';
import ItemView from './item-view';
import { getLevelFromExperience, getRequiredExperience } from '@/lib/utils';

interface CharacterDetailsModalProps {
  character: Character;
  isOpen: boolean;
  onClose: () => void;
}

export default function CharacterDetailsModal({ 
  character, 
  isOpen, 
  onClose 
}: CharacterDetailsModalProps) {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  
  if (!isOpen) return null;
  
  const level = getLevelFromExperience(character.experience);
  const nextLevelExp = getRequiredExperience(level + 1);
  const currentLevelExp = getRequiredExperience(level);
  const expProgress = nextLevelExp > currentLevelExp 
    ? ((character.experience - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100
    : 100;
  
  // Create an array of 8 slots for inventory (filled or empty)
  const inventorySlots = Array(8).fill(null);
  if (character.inventory) {
    character.inventory.forEach((invItem, index) => {
      if (index < 8) {
        inventorySlots[index] = invItem.item;
      }
    });
  }
  
  const handleItemClick = (item: Item | null) => {
    setSelectedItem(item);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-amber-950 rounded-lg max-w-lg w-full animate-fadeIn border-2 border-amber-800 border-t-amber-700 border-l-amber-700">
        {/* Header with close button */}
        <div className="flex justify-between items-center p-3 border-b border-amber-800">
          <h3 className="text-lg font-bold text-amber-200">{character.name}</h3>
          <button 
            onClick={onClose}
            className="text-amber-400 hover:text-amber-200"
          >
            ✕
          </button>
        </div>
        
        <div className="p-3">
          {/* Character info section - mobile layout (stacked) */}
          <div className="flex flex-col md:hidden">
            {/* Character portrait and basic info with attributes on right */}
            <div className="flex mb-4">
              {/* Left side - portrait and basic info */}
              <div className="w-1/2">
                <div className="w-16 h-16 rounded-full overflow-hidden relative border-2 border-amber-700 mx-auto bg-stone-800">
                  <Image
                    src={`/image/characters/${character.class.toLowerCase()}.png`}
                    alt={`${character.class} character portrait`}
                    fill
                    sizes="64px"
                    className="object-cover"
                    priority
                  />
                </div>
                
                <div className="space-y-1 text-center mt-1">
                  <p className="text-amber-300 text-xs">
                    <span className="text-purple-300">Level {level}</span><span className="text-amber-300 text-xs"> {character.class}</span>
                  </p>
                  
                  {/* XP Bar */}
                  <div className="w-full h-1.5 bg-amber-900 rounded-full overflow-hidden mx-auto mt-1">
                    <div 
                      className="h-full bg-green-600 text-xs" 
                      style={{ width: `${Math.max(0, Math.min(100, expProgress))}%` }}
                    ></div>
                  </div>
                  
                  <p className="text-amber-200 text-xs">
                    HP: {character.current_hitpoints}/{character.max_hitpoints}
                  </p>
                  <p className="text-amber-200 text-xs">
                    MP: {character.current_energy}/{character.max_energy}
                  </p>
                  <p className="text-yellow-400 text-xs">
                    Gold: {character.gold}
                  </p>
                </div>
              </div>
              
              {/* Right side - attributes only */}
              <div className="w-1/2 pl-2 flex flex-col justify-center">
                <div className="space-y-1 text-xs">
                  <div className="bg-amber-900 p-1.5 rounded-md">
                    <div className="flex justify-between">
                      <span className="text-amber-200">STR</span>
                      <span className="text-red-400">{character.strength}</span>
                    </div>
                  </div>
                  
                  <div className="bg-amber-900 p-1.5 rounded-md">
                    <div className="flex justify-between">
                      <span className="text-amber-200">INT</span>
                      <span className="text-blue-400">{character.intelligence}</span>
                    </div>
                  </div>
                  
                  <div className="bg-amber-900 p-1.5 rounded-md">
                    <div className="flex justify-between">
                      <span className="text-amber-200">AGI</span>
                      <span className="text-green-400">{character.agility}</span>
                    </div>
                  </div>
                  
                  <div className="bg-amber-900 p-1.5 rounded-md">
                    <div className="flex justify-between">
                      <span className="text-amber-200">LCK</span>
                      <span className="text-yellow-400">{character.luck}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Equipment */}
            <div className="mb-4">
              <h4 className="text-base mb-2 text-amber-300 border-b border-amber-800 pb-1">Equipment</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-amber-200 mb-1">Weapon</span>
                  <ItemView 
                    item={character.equipment?.weapon || null} 
                    slotName="Weapon"
                    onClick={handleItemClick}
                  />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-amber-200 mb-1">Helmet</span>
                  <ItemView 
                    item={character.equipment?.helmet || null} 
                    slotName="Helmet"
                    onClick={handleItemClick}
                  />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-amber-200 mb-1">Armor</span>
                  <ItemView 
                    item={character.equipment?.armor || null} 
                    slotName="Armor"
                    onClick={handleItemClick}
                  />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-amber-200 mb-1">Trinket</span>
                  <ItemView 
                    item={character.equipment?.trinket || null} 
                    slotName="Trinket"
                    onClick={handleItemClick}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Character info section - desktop layout (side by side) */}
          <div className="hidden md:flex md:mb-4">
            {/* Left column - portrait and basic info */}
            <div className="w-1/3 pr-3">
              <div className="w-24 h-24 rounded-full overflow-hidden relative border-2 border-amber-700 mx-auto mb-3 bg-stone-800">
                <Image
                  src={`/image/characters/${character.class.toLowerCase()}.png`}
                  alt={`${character.class} character portrait`}
                  fill
                  sizes="96px"
                  className="object-cover"
                  priority
                />
              </div>
              
              <div className="space-y-1 text-center">
                <p className="text-amber-300">
                  <span className="text-purple-300">Level {level}</span>
                </p>
                <p className="text-amber-300">{character.class}</p>
                
                {/* XP Bar */}
                <div className="w-full h-2 bg-amber-900 rounded-full overflow-hidden mx-auto mt-1">
                  <div 
                    className="h-full bg-green-600" 
                    style={{ width: `${Math.max(0, Math.min(100, expProgress))}%` }}
                  ></div>
                </div>
                <p className="text-amber-200 text-xs">
                  XP: {character.experience}/{nextLevelExp}
                </p>
                
                <p className="text-amber-200 text-sm">
                  HP: {character.current_hitpoints}/{character.max_hitpoints}
                </p>
                <p className="text-amber-200 text-sm">
                  MP: {character.current_energy}/{character.max_energy}
                </p>
                <p className="text-yellow-400 text-sm">
                  Gold: {character.gold}
                </p>
              </div>
            </div>
            
            {/* Middle column - equipment */}
            <div className="w-1/3 px-3 border-l border-r border-amber-800">
              <h4 className="text-base mb-2 text-amber-300 border-b border-amber-800 pb-1 text-center">Equipment</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-amber-200 mb-1">Weapon</span>
                  <ItemView 
                    item={character.equipment?.weapon || null} 
                    slotName="Weapon"
                    onClick={handleItemClick}
                  />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-amber-200 mb-1">Helmet</span>
                  <ItemView 
                    item={character.equipment?.helmet || null} 
                    slotName="Helmet"
                    onClick={handleItemClick}
                  />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-amber-200 mb-1">Armor</span>
                  <ItemView 
                    item={character.equipment?.armor || null} 
                    slotName="Armor"
                    onClick={handleItemClick}
                  />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-amber-200 mb-1">Trinket</span>
                  <ItemView 
                    item={character.equipment?.trinket || null} 
                    slotName="Trinket"
                    onClick={handleItemClick}
                  />
                </div>
              </div>
            </div>
            
            {/* Right column - attributes only */}
            <div className="w-1/3 pl-3 flex flex-col justify-center">
              <div className="space-y-2 text-sm">
                <div className="bg-amber-900 p-2 rounded-md">
                  <div className="flex justify-between">
                    <span className="text-amber-200">STR</span>
                    <span className="text-red-400">{character.strength}</span>
                  </div>
                </div>
                
                <div className="bg-amber-900 p-2 rounded-md">
                  <div className="flex justify-between">
                    <span className="text-amber-200">INT</span>
                    <span className="text-blue-400">{character.intelligence}</span>
                  </div>
                </div>
                
                <div className="bg-amber-900 p-2 rounded-md">
                  <div className="flex justify-between">
                    <span className="text-amber-200">AGI</span>
                    <span className="text-green-400">{character.agility}</span>
                  </div>
                </div>
                
                <div className="bg-amber-900 p-2 rounded-md">
                  <div className="flex justify-between">
                    <span className="text-amber-200">LCK</span>
                    <span className="text-yellow-400">{character.luck}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Inventory section */}
          <div>
            <h4 className="text-base mb-2 text-amber-300 border-b border-amber-800 pb-1">Inventory</h4>
            <div className="grid grid-cols-4 gap-2">
              {inventorySlots.map((item, index) => (
                <ItemView 
                  key={index} 
                  item={item} 
                  onClick={handleItemClick}
                />
              ))}
            </div>
          </div>
          
          {/* No close button at bottom as requested */}
        </div>
      </div>
    </div>
  );
}
