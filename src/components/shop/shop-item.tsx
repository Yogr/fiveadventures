'use client';

import { useState } from 'react';
import { ITEM_RARITY_COLORS } from '@/lib/constants';
import type { Item, ItemRarity } from '@/lib/types';
import { buyItem } from '@/app/actions/shop';
import Image from 'next/image';
import ItemDetailModal from './item-detail-modal';

interface ShopItemProps {
  id: string;
  item: Item;
  price: number;
  onPurchase: () => void;
  playerGold: number;
}

export default function ShopItem({ id, item, price, onPurchase, playerGold }: ShopItemProps) {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  const rarityColor = ITEM_RARITY_COLORS[item.rarity as ItemRarity] || 'text-gray-200';
  const canAfford = playerGold >= price;
  
  const handleBuy = async () => {
    if (!canAfford) {
      setError('Not enough gold');
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    setIsPurchasing(true);
    setError(null);
    
    try {
      const result = await buyItem(id);
      
      if (result.success) {
        onPurchase();
      } else {
        setError(result.error || 'Failed to purchase item');
      }
    } catch (err) {
      console.error('Error purchasing item:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsPurchasing(false);
    }
  };
  
  return (
    <div 
      className="relative rounded hover:bg-opacity-20 hover:bg-gray-700 transition-colors cursor-pointer"
      onClick={() => setShowDetailModal(true)}
    >
      {/* Item image and rarity border */}
      <div className={`aspect-square rounded flex items-center justify-center bg-gray-700 border ${rarityColor.replace('text-', 'border-')}`}>
        {item.image_url ? (
          <Image
            src={`/image/${item.type.toLowerCase()}/${item.image_url}.png`}
            alt={item.name}
            width={48}
            height={48}
            className="object-contain"
          />
        ) : (
          <div className="w-12 h-12 flex items-center justify-center bg-gray-600 rounded">
            <span className="text-gray-400 text-xs">No img</span>
          </div>
        )}
      </div>
      
      {/* Ultra compact item name and price with buy button */}
      <div className="text-center items-center">
        <h3 className={`font-medium truncate ${rarityColor} text-xs leading-tight`}>{item.name}</h3>
          <div className="flex items-center width-full justify-center">
            <span className="text-yellow-300 font-medium text-sm">{price}</span>
            <div className="w-3 h-3 ml-1 relative">
              <Image
                src="/image/ui/coin.png"
                alt="Gold"
                width={12}
                height={12}
              />
            </div>
          </div>
      </div>
      
      {/* Item detail modal */}
      <ItemDetailModal
        item={item}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        actionButton={
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <span className="text-yellow-300 font-medium">{price}</span>
              <div className="w-4 h-4 ml-1 relative">
                <Image
                  src="/image/ui/coin.png"
                  alt="Gold"
                  width={16}
                  height={16}
                />
              </div>
            </div>
            <button
              onClick={handleBuy}
              disabled={isPurchasing || !canAfford}
              className={`px-4 py-2 rounded text-sm font-medium ${
                canAfford 
                  ? 'bg-green-600 hover:bg-green-500 text-white' 
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isPurchasing ? 'Buying...' : 'Buy'}
            </button>
          </div>
        }
      />
      
      {/* Error message */}
      {error && (
        <div className="absolute inset-x-0 bottom-0 bg-red-600 text-white text-center text-sm py-1 rounded-b-md">
          {error}
        </div>
      )}
    </div>
  );
}
