'use client';

import { useState, useEffect } from 'react';
import { getShopItems, getInventory } from '@/app/actions/shop';
import type { ShopItemSimple } from '@/app/actions/shop';
import ShopItem from './shop-item';
import InventoryItem from './inventory-item';
import LoadingSpinner from '@/components/ui/loading-spinner';
import type { Item } from '@/lib/types';

interface ShopContainerProps {
  initialGold: number;
  equipment: {
    weapon_id: number | null;
    helmet_id: number | null;
    armor_id: number | null;
    trinket_id: number | null;
  };
}

export default function ShopContainer({ initialGold, equipment }: ShopContainerProps) {
  const [activeTab, setActiveTab] = useState<'shop' | 'inventory'>('shop');
  const [shopItems, setShopItems] = useState<ShopItemSimple[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [gold, setGold] = useState(initialGold);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Check if an item is equipped
  const isItemEquipped = (itemId: number) => {
    return (
      equipment.weapon_id === itemId ||
      equipment.helmet_id === itemId ||
      equipment.armor_id === itemId ||
      equipment.trinket_id === itemId
    );
  };
  
  // Load shop items and inventory
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Load shop items
      const shopResult = await getShopItems();
      if (shopResult.success && shopResult.data) {
        setShopItems(shopResult.data);
      } else {
        setError(shopResult.error || 'Failed to load shop items');
      }
      
      // Load inventory
      const inventoryResult = await getInventory();
      if (inventoryResult.success && inventoryResult.data) {
        setInventoryItems(inventoryResult.data);
      } else {
        setError(inventoryResult.error || 'Failed to load inventory');
      }
    } catch (err) {
      console.error('Error loading shop data:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load data on initial render
  useEffect(() => {
    loadData();
  }, []);
  
  // Handle purchase
  const handlePurchase = () => {
    // Reload data to get updated shop and inventory
    loadData();
  };
  
  // Handle sell
  const handleSell = () => {
    // Reload data to get updated shop and inventory
    loadData();
  };
  
  return (
    <div className="bg-gray-800 p-4 rounded-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl sm:text-2xl font-bold">Shop</h2>
        <div className="text-yellow-300 font-medium">{gold} Gold</div>
      </div>
      
      {/* Tab navigation */}
      <div className="flex border-b border-gray-700 mb-4">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'shop'
              ? 'text-yellow-400 border-b-2 border-yellow-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('shop')}
        >
          Buy
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'inventory'
              ? 'text-yellow-400 border-b-2 border-yellow-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('inventory')}
        >
          Sell
        </button>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-600 text-white p-2 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {/* Shop items */}
          {activeTab === 'shop' && (
            <div>
              <h3 className="text-lg font-medium mb-3">Available Items</h3>
              {shopItems.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No items available in the shop today.</p>
              ) : (
                shopItems.map((shopItem) => (
                  <ShopItem
                    key={shopItem.id}
                    id={shopItem.id}
                    item={shopItem.item}
                    price={shopItem.price}
                    onPurchase={handlePurchase}
                    playerGold={gold}
                  />
                ))
              )}
            </div>
          )}
          
          {/* Inventory items */}
          {activeTab === 'inventory' && (
            <div>
              <h3 className="text-lg font-medium mb-3">Your Items</h3>
              {inventoryItems.length === 0 ? (
                <p className="text-gray-400 text-center py-4">Your inventory is empty.</p>
              ) : (
                inventoryItems.map((invItem) => (
                  <InventoryItem
                    key={invItem.id}
                    id={invItem.id}
                    item={invItem.item}
                    isEquipped={isItemEquipped(invItem.item_id)}
                    onSell={handleSell}
                  />
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
