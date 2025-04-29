'use client';

import { useState } from 'react';
import { sellItem } from '@/app/actions/shop';
import Image from 'next/image';
import type { Item } from '@/lib/types';
import ItemDetailModal from './item-detail-modal';

interface SellBarProps {
  inventoryItems: any[];
  gold: number;
  setGold: (gold: number | ((prev: number) => number)) => void;
  isItemEquipped: (itemId: number) => boolean;
  onSellComplete: () => void;
}

export default function SellBar({ 
  inventoryItems, 
  gold, 
  setGold, 
  isItemEquipped,
  onSellComplete 
}: SellBarProps) {
  const [selectedSellItem, setSelectedSellItem] = useState<string | null>(null);
  const [showSellConfirm, setShowSellConfirm] = useState(false);
  const [sellItemDetails, setSellItemDetails] = useState<{id: string, name: string, cost: number, item: Item} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Handle sell item selection
  const handleSelectSellItem = (itemId: string, item: Item) => {
    if (selectedSellItem === itemId) {
      setSelectedSellItem(null);
    } else {
      setSelectedSellItem(itemId);
      // Prepare sell item details for confirmation
      const sellPrice = Math.round(item.value * 0.5);
      setSellItemDetails({
        id: itemId,
        name: item.name,
        cost: sellPrice,
        item: item
      });
      
      // Show item details modal
      setShowDetailModal(true);
    }
  };
  
  // Handle sell confirmation
  const handleConfirmSell = async () => {
    if (!sellItemDetails) return;
    
    try {
      const result = await sellItem(sellItemDetails.id);
      
      if (result.success) {
        // Update gold
        setGold(prev => prev + sellItemDetails.cost);
        onSellComplete();
        setSelectedSellItem(null);
        setSellItemDetails(null);
      } else {
        setError(result.error || 'Failed to sell item');
      }
    } catch (err) {
      console.error('Error selling item:', err);
      setError('An unexpected error occurred');
    } finally {
      setShowSellConfirm(false);
    }
  };
  
  // Handle sell button click
  const handleSellButtonClick = () => {
    if (sellItemDetails) {
      setShowDetailModal(false);
      setShowSellConfirm(true);
    }
  };
  
  return (
    <div className="bg-gradient-to-b from-yellow-950 to-black rounded-md p-3 mt-4 border border-amber-900">
      {/* Error message */}
      {error && (
        <div className="bg-red-600 text-white p-2 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium">Sell Items</h3>
        {selectedSellItem && (
          <button 
            onClick={handleSellButtonClick}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-md text-sm font-medium"
          >
            Sell item
          </button>
        )}
      </div>
      
      {/* Inventory items horizontal scrollbar */}
      <div className="bg-gray-800 bg-opacity-80 p-2 rounded-md overflow-x-auto">
        <div className="flex space-x-3 min-w-max">
          {inventoryItems.length === 0 ? (
            <p className="text-gray-400 py-8 px-4">Your inventory is empty.</p>
          ) : (
            inventoryItems.slice(0, 8).map((invItem) => (
              <div 
                key={invItem.id}
                onClick={() => !isItemEquipped(invItem.item_id) && handleSelectSellItem(invItem.id, invItem.item)}
                className={`
                  relative w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 bg-gray-700 rounded-md p-1
                  ${isItemEquipped(invItem.item_id) ? 'opacity-50 cursor-not-allowed border border-yellow-500' : 'cursor-pointer hover:bg-gray-600 hover:scale-105 transition-transform'}
                  ${selectedSellItem === invItem.id ? 'ring-2 ring-red-500 scale-105' : ''}
                  group
                `}
              >
                {/* Item image */}
                <div className="w-full h-full bg-gray-600 rounded flex items-center justify-center">
                  {invItem.item.image_url ? (
                    <Image
                      src={`/image/${invItem.item.type.toLowerCase()}/${invItem.item.image_url}.png`}
                      alt={invItem.item.name}
                      width={32}
                      height={32}
                    />
                  ) : (
                    <span className="text-xs text-gray-400">No img</span>
                  )}
                </div>
                
                {/* Item name tooltip on hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap">
                  {invItem.item.name}
                </div>
                
                {/* Equipped indicator */}
                {isItemEquipped(invItem.item_id) && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-black">E</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Item detail modal */}
      {sellItemDetails && showDetailModal && (
        <ItemDetailModal
          item={sellItemDetails.item}
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          actionButton={
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <span className="text-yellow-300 font-medium">{sellItemDetails.cost}</span>
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
                onClick={handleSellButtonClick}
                className="px-4 py-2 rounded text-sm font-medium bg-red-600 hover:bg-red-500 text-white"
              >
                Sell
              </button>
            </div>
          }
        />
      )}
      
      {/* Sell confirmation modal */}
      {showSellConfirm && sellItemDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-4 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Confirm Sale</h3>
            <p className="mb-6">
              Sell {sellItemDetails.name} for <span className="text-yellow-300 font-medium">{sellItemDetails.cost}</span> <Image src="/image/ui/coin.png" alt="Gold" width={16} height={16} className="inline ml-1" />?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleConfirmSell}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded"
              >
                Sell
              </button>
              <button
                onClick={() => setShowSellConfirm(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
