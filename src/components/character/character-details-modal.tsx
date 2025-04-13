'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { Character, Item } from '@/lib/types';
import ItemView from './item-view';
import ItemDetailModal from '@/components/ui/item-detail-modal';
import { getLevelFromExperience, getRequiredExperience } from '@/lib/utils';
import { 
  getTotalStrength, 
  getTotalIntelligence, 
  getTotalAgility, 
  getTotalLuck,
  getTotalMaxHitpoints,
  getTotalMaxEnergy,
  calculateTotalDamage,
  calculateTotalDefense
} from '@/lib/character-utils';

interface CharacterDetailsModalProps {
  character: Character;
  isOpen: boolean;
  onClose: () => void;
}

export default function CharacterDetailsModal({ 
  character: initialCharacter, 
  isOpen, 
  onClose 
}: CharacterDetailsModalProps) {
  // All useState hooks must be at the top level
  const [character, setCharacter] = useState<Character>(initialCharacter);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  // Track the position of the clicked item for tooltip positioning
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | undefined>(undefined);
  // Track the inventory item ID for equip/unequip functionality
  const [selectedInventoryId, setSelectedInventoryId] = useState<string | undefined>(undefined);
  // Track whether the selected item is equipped
  const [isSelectedItemEquipped, setIsSelectedItemEquipped] = useState(false);
  
  // Update character state when initialCharacter changes
  useEffect(() => {
    setCharacter(initialCharacter);
  }, [initialCharacter]);
  
  if (!isOpen) return null;
  
  const level = getLevelFromExperience(character.experience);
  const nextLevelExp = getRequiredExperience(level + 1);
  const currentLevelExp = getRequiredExperience(level);
  const expProgress = nextLevelExp > currentLevelExp 
    ? ((character.experience - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100
    : 100;
  
  const handleItemClick = (item: Item | null, event: React.MouseEvent, inventoryId?: string, equipped = false) => {
    if (item) {
      // Get the position of the click for tooltip positioning
      setClickPosition({ x: event.clientX, y: event.clientY });
      setSelectedItem(item);
      setSelectedInventoryId(inventoryId);
      setIsSelectedItemEquipped(equipped);
    }
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
                    HP: {character.current_hitpoints}/{getTotalMaxHitpoints(character)}
                    {getTotalMaxHitpoints(character) > character.max_hitpoints && (
                      <span className="text-green-400 text-xs ml-1">
                        (+{getTotalMaxHitpoints(character) - character.max_hitpoints})
                      </span>
                    )}
                  </p>
                  <p className="text-amber-200 text-xs">
                    MP: {character.current_energy}/{getTotalMaxEnergy(character)}
                    {getTotalMaxEnergy(character) > character.max_energy && (
                      <span className="text-green-400 text-xs ml-1">
                        (+{getTotalMaxEnergy(character) - character.max_energy})
                      </span>
                    )}
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
                      <span className="text-red-400">
                        {getTotalStrength(character)}
                        {getTotalStrength(character) > character.strength && (
                          <span className="text-green-400 text-xs ml-1">
                            (+{getTotalStrength(character) - character.strength})
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-amber-900 p-1.5 rounded-md">
                    <div className="flex justify-between">
                      <span className="text-amber-200">INT</span>
                      <span className="text-blue-400">
                        {getTotalIntelligence(character)}
                        {getTotalIntelligence(character) > character.intelligence && (
                          <span className="text-green-400 text-xs ml-1">
                            (+{getTotalIntelligence(character) - character.intelligence})
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-amber-900 p-1.5 rounded-md">
                    <div className="flex justify-between">
                      <span className="text-amber-200">AGI</span>
                      <span className="text-green-400">
                        {getTotalAgility(character)}
                        {getTotalAgility(character) > character.agility && (
                          <span className="text-green-400 text-xs ml-1">
                            (+{getTotalAgility(character) - character.agility})
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-amber-900 p-1.5 rounded-md">
                    <div className="flex justify-between">
                      <span className="text-amber-200">LCK</span>
                      <span className="text-yellow-400">
                        {getTotalLuck(character)}
                        {getTotalLuck(character) > character.luck && (
                          <span className="text-green-400 text-xs ml-1">
                            (+{getTotalLuck(character) - character.luck})
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                  
                  {/* Combat Stats */}
                  <div className="flex justify-between">
                    <span className="text-amber-200">DMG</span>
                    <span className="text-orange-400">
                      {calculateTotalDamage(character)}
                    </span>
                    <span className="text-amber-200">DEF</span>
                    <span className="text-blue-300">
                      {calculateTotalDefense(character)}
                    </span>
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
                    isEquipped={true}
                    onClick={handleItemClick}
                  />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-amber-200 mb-1">Helmet</span>
                  <ItemView 
                    item={character.equipment?.helmet || null} 
                    slotName="Helmet"
                    isEquipped={true}
                    onClick={handleItemClick}
                  />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-amber-200 mb-1">Armor</span>
                  <ItemView 
                    item={character.equipment?.armor || null} 
                    slotName="Armor"
                    isEquipped={true}
                    onClick={handleItemClick}
                  />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-amber-200 mb-1">Trinket</span>
                  <ItemView 
                    item={character.equipment?.trinket || null} 
                    slotName="Trinket"
                    isEquipped={true}
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
                  HP: {character.current_hitpoints}/{getTotalMaxHitpoints(character)}
                  {getTotalMaxHitpoints(character) > character.max_hitpoints && (
                    <span className="text-green-400 text-xs ml-1">
                      (+{getTotalMaxHitpoints(character) - character.max_hitpoints})
                    </span>
                  )}
                </p>
                <p className="text-amber-200 text-sm">
                  MP: {character.current_energy}/{getTotalMaxEnergy(character)}
                  {getTotalMaxEnergy(character) > character.max_energy && (
                    <span className="text-green-400 text-xs ml-1">
                      (+{getTotalMaxEnergy(character) - character.max_energy})
                    </span>
                  )}
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
                    isEquipped={true}
                    onClick={handleItemClick}
                  />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-amber-200 mb-1">Helmet</span>
                  <ItemView 
                    item={character.equipment?.helmet || null} 
                    slotName="Helmet"
                    isEquipped={true}
                    onClick={handleItemClick}
                  />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-amber-200 mb-1">Armor</span>
                  <ItemView 
                    item={character.equipment?.armor || null} 
                    slotName="Armor"
                    isEquipped={true}
                    onClick={handleItemClick}
                  />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-amber-200 mb-1">Trinket</span>
                  <ItemView 
                    item={character.equipment?.trinket || null} 
                    slotName="Trinket"
                    isEquipped={true}
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
                    <span className="text-red-400">
                      {getTotalStrength(character)}
                      {getTotalStrength(character) > character.strength && (
                        <span className="text-green-400 text-xs ml-1">
                          (+{getTotalStrength(character) - character.strength})
                        </span>
                      )}
                    </span>
                  </div>
                </div>
                
                <div className="bg-amber-900 p-2 rounded-md">
                  <div className="flex justify-between">
                    <span className="text-amber-200">INT</span>
                    <span className="text-blue-400">
                      {getTotalIntelligence(character)}
                      {getTotalIntelligence(character) > character.intelligence && (
                        <span className="text-green-400 text-xs ml-1">
                          (+{getTotalIntelligence(character) - character.intelligence})
                        </span>
                      )}
                    </span>
                  </div>
                </div>
                
                <div className="bg-amber-900 p-2 rounded-md">
                  <div className="flex justify-between">
                    <span className="text-amber-200">AGI</span>
                    <span className="text-green-400">
                      {getTotalAgility(character)}
                      {getTotalAgility(character) > character.agility && (
                        <span className="text-green-400 text-xs ml-1">
                          (+{getTotalAgility(character) - character.agility})
                        </span>
                      )}
                    </span>
                  </div>
                </div>
                
                <div className="bg-amber-900 p-2 rounded-md">
                  <div className="flex justify-between">
                    <span className="text-amber-200">LCK</span>
                    <span className="text-yellow-400">
                      {getTotalLuck(character)}
                      {getTotalLuck(character) > character.luck && (
                        <span className="text-green-400 text-xs ml-1">
                          (+{getTotalLuck(character) - character.luck})
                        </span>
                      )}
                    </span>
                  </div>
                </div>
                
                {/* Combat Stats */}
                <div className="bg-amber-900 p-2 rounded-md">
                  <div className="flex justify-between">
                    <span className="text-amber-200">DMG</span>
                    <span className="text-orange-400">
                      {calculateTotalDamage(character)}
                    </span>
                  </div>
                </div>
                
                <div className="bg-amber-900 p-2 rounded-md">
                  <div className="flex justify-between">
                    <span className="text-amber-200">DEF</span>
                    <span className="text-blue-300">
                      {calculateTotalDefense(character)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Inventory section */}
          <div>
            <h4 className="text-base mb-2 text-amber-300 border-b border-amber-800 pb-1">Inventory</h4>
            <div className="grid grid-cols-4 gap-2">
              {character.inventory?.map((invItem, index) => (
                <ItemView 
                  key={index} 
                  item={invItem.item} 
                  inventoryId={invItem.id}
                  onClick={handleItemClick}
                />
              ))}
              {/* Fill remaining slots with empty slots */}
              {Array(Math.max(0, 8 - (character.inventory?.length || 0))).fill(null).map((_, index) => (
                <ItemView 
                  key={`empty-${index}`} 
                  item={null} 
                  onClick={handleItemClick}
                />
              ))}
            </div>
          </div>
          
          {/* No close button at bottom as requested */}
        </div>
      </div>
      
      {/* Item Detail Modal */}
      <ItemDetailModal
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => {
          setSelectedItem(null);
          setClickPosition(undefined);
          setSelectedInventoryId(undefined);
          setIsSelectedItemEquipped(false);
        }}
        position={clickPosition}
        character={character}
        inventoryItemId={selectedInventoryId}
        isEquipped={isSelectedItemEquipped}
        isInventoryScreen={true}
        onCharacterUpdate={(updatedCharacter) => {
          // Update the local character state with the new data
          setCharacter(updatedCharacter);
          // Close the item detail modal
          setSelectedItem(null);
          setClickPosition(undefined);
          setSelectedInventoryId(undefined);
          setIsSelectedItemEquipped(false);
        }}
      />
    </div>
  );
}
