'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Character, Item } from '@/lib/types';
import { ITEM_RARITY_COLORS } from '@/lib/constants';
import { equipItem, unequipItem } from '@/app/actions/inventory';

interface ItemDetailModalProps {
  item: Item | null;
  isOpen: boolean;
  onClose: () => void;
  position?: { x: number; y: number };
  character?: Character | null;
  inventoryItemId?: string;
  isEquipped?: boolean;
  isInventoryScreen?: boolean;
}

export default function ItemDetailModal({ 
  item, 
  isOpen, 
  onClose, 
  position,
  character,
  inventoryItemId,
  isEquipped = false,
  isInventoryScreen = false
}: ItemDetailModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscapeKey);
    return () => window.removeEventListener('keydown', handleEscapeKey);
  }, [isOpen, onClose]);
  
  // Close modal when clicking outside
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  if (!isOpen || !item) return null;
  
  // Get the appropriate color class based on item rarity
  const rarityColorClass = ITEM_RARITY_COLORS[item.rarity as keyof typeof ITEM_RARITY_COLORS] || 'text-gray-200';
  
  // Format item type and subtype
  const getItemSubType = () => {
    if (item.type === 'Weapon' && item.weapon_type) {
      return `${item.weapon_type} ${item.type}`;
    }
    return item.type;
  };
  
  // Get stat boosts from effects
  const getStatBoosts = () => {
    if (!item.effects) return null;
    
    const effects = item.effects as any;
    return effects.stat_boosts || null;
  };
  
  // Get elemental effects
  const getElementalEffects = () => {
    if (!item.effects) return null;
    
    const effects = item.effects as any;
    return effects.elemental || null;
  };
  
  // Get critical hit effects
  const getCriticalHitEffects = () => {
    if (!item.effects) return null;
    
    const effects = item.effects as any;
    return effects.critical_hit || null;
  };
  
  // Get special effects
  const getSpecialEffects = () => {
    if (!item.effects) return null;
    
    const effects = item.effects as any;
    return effects.special || null;
  };
  
  // Get boss damage multiplier
  const getBossDamageMultiplier = () => {
    if (!item.effects) return null;
    
    const effects = item.effects as any;
    return effects.boss_damage_multiplier || null;
  };
  
  // Get currently equipped item of the same type
  const getEquippedItemOfSameType = () => {
    if (!character || !character.equipment) return null;
    
    switch (item.type) {
      case 'Weapon':
        return character.equipment.weapon;
      case 'Helmet':
        return character.equipment.helmet;
      case 'Armor':
        return character.equipment.armor;
      case 'Trinket':
        return character.equipment.trinket;
      default:
        return null;
    }
  };
  
  // Handle equip item
  const handleEquip = async () => {
    if (!inventoryItemId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await equipItem(inventoryItemId);
      
      if (result.success) {
        onClose();
        router.refresh();
      } else {
        setError(result.error || 'Failed to equip item');
      }
    } catch (err) {
      console.error('Error equipping item:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle unequip item
  const handleUnequip = async () => {
    if (!item.type) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await unequipItem(item.type);
      
      if (result.success) {
        onClose();
        router.refresh();
      } else {
        setError(result.error || 'Failed to unequip item');
      }
    } catch (err) {
      console.error('Error unequipping item:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  const statBoosts = getStatBoosts();
  const elementalEffects = getElementalEffects();
  const criticalHitEffects = getCriticalHitEffects();
  const specialEffects = getSpecialEffects();
  const bossDamageMultiplier = getBossDamageMultiplier();
  const equippedItem = getEquippedItemOfSameType();
  
  // Calculate position for tooltip
  const getTooltipStyle = () => {
    if (!position) return {};
    
    return {
      position: 'fixed' as const,
      top: `${position.y}px`,
      left: `${position.x}px`,
      transform: 'translate(-10%, -110%)',
      maxHeight: '80vh',
      zIndex: 100,
    };
  };
  
  return (
    <div 
      className={position ? '' : 'fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4'}
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        style={position ? getTooltipStyle() : {}}
        className="relative bg-gray-900 border border-gray-700 rounded-md shadow-lg w-72 animate-fadeIn"
      >
        {/* Item Name Header */}
        <div className={`px-4 py-2 border-b border-gray-700 ${rarityColorClass} font-semibold pr-8`}>
          {item.name}
        </div>
        
        {/* Item Details */}
        <div className="p-3 text-sm">
          {/* Item Type */}
          <div className="text-gray-400 italic mb-2">
            {getItemSubType()}
          </div>
          
          {/* Base Stats */}
          {item.base_damage && (
            <div className="text-white mb-1">
              {item.base_damage} Damage
            </div>
          )}
          
          {item.base_defense && (
            <div className="text-white mb-1">
              {item.base_defense} Defense
            </div>
          )}
          
          {/* Stat Boosts */}
          {statBoosts && (
            <div className="mt-2">
              {Object.entries(statBoosts).map(([stat, value]) => (
                <div key={stat} className="text-green-400">
                  +{String(value)} {stat.charAt(0).toUpperCase() + stat.slice(1)}
                </div>
              ))}
            </div>
          )}
          
          {/* Elemental Effects */}
          {elementalEffects && (
            <div className="mt-2 text-blue-400">
              +{elementalEffects.damage} {elementalEffects.type} Damage
            </div>
          )}
          
          {/* Critical Hit Effects */}
          {criticalHitEffects && (
            <div className="mt-2 text-yellow-400">
              {criticalHitEffects.chance}% chance to critical hit for {criticalHitEffects.multiplier}x damage
            </div>
          )}
          
          {/* Boss Damage Multiplier */}
          {bossDamageMultiplier && (
            <div className="mt-2 text-red-400">
              Deals {bossDamageMultiplier}x damage to bosses
            </div>
          )}
          
          {/* Special Effects */}
          {specialEffects && (
            <div className="mt-2 text-purple-400">
              {specialEffects.description}
            </div>
          )}
          
          {/* Item Value */}
          <div className="mt-3 text-yellow-300 flex items-center">
            <span className="mr-1">Value:</span>
            <span>{item.value} gold</span>
          </div>
          
          {/* Comparison with equipped item */}
          {!isEquipped && equippedItem && isInventoryScreen && (
            <div className="mt-3 border-t border-gray-700 pt-2">
              <div className="text-gray-300 font-semibold mb-1">Currently Equipped:</div>
              <div className={ITEM_RARITY_COLORS[equippedItem.rarity as keyof typeof ITEM_RARITY_COLORS] || 'text-gray-200'}>
                {equippedItem.name}
              </div>
              <div className="text-gray-400 text-xs italic">
                {equippedItem.base_damage ? `${equippedItem.base_damage} Damage` : ''}
                {equippedItem.base_defense ? `${equippedItem.base_defense} Defense` : ''}
              </div>
            </div>
          )}
          
          {/* Error message */}
          {error && (
            <div className="mt-2 text-red-500 text-xs">
              {error}
            </div>
          )}
          
          {/* Action Buttons */}
          {isInventoryScreen && (
            <div className="mt-3 flex justify-center space-x-2 border-t border-gray-700 pt-2">
              {isEquipped ? (
                <button
                  onClick={handleUnequip}
                  disabled={loading}
                  className={`px-3 py-1 rounded text-xs ${
                    loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-red-800 hover:bg-red-700'
                  }`}
                >
                  {loading ? 'Processing...' : 'Unequip'}
                </button>
              ) : (
                <button
                  onClick={handleEquip}
                  disabled={loading}
                  className={`px-3 py-1 rounded text-xs ${
                    loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-800 hover:bg-green-700'
                  }`}
                >
                  {loading ? 'Processing...' : 'Equip'}
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-1 right-1 text-gray-400 hover:text-white"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
