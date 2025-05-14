'use client';

import { useState, useEffect } from 'react';
import { getShopItems, getInventory } from '@/app/actions/shop';
import type { ShopItemSimple } from '@/app/actions/shop';
import ShopItem from './shop-item';
import SellBar from './sell-bar';
import LoadingSpinner from '@/components/ui/loading-spinner';
import Image from 'next/image';

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
      // Load shop items (using shop ID 1 for General Store by default)
      const shopItems = await getShopItems(1);
      if (shopItems) {
        // Only take the first 6 items
        setShopItems(shopItems.slice(0, 6));
      } else {
        setError('Failed to load shop items');
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
  const handlePurchase = (purchasedItem: any, price: number) => {
    // Update gold locally
    setGold(prevGold => prevGold - price);
    
    // Update inventory locally (add the purchased item)
    loadData();
  };
  
  return (
    <div className="relative text-white flex flex-col">
      {/* Main shop area with background */}
      <div className="relative">
        {/* Shop background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Image
              src="/image/ui/shop_bg.png"
              alt="Shop Background"
              fill={false}
              width={1200}
              height={500}
              style={{
                width: '100%',  
                height: 'auto',
                maxHeight: '100%',
                transform: 'scaleX(1.2)', // Stretch horizontally by 20%
                transformOrigin: 'center'
              }}
              className="opacity-80"
              priority
            />
          </div>
        </div>
        
        {/* Shop content container */}
        <div className="relative z-10 container mx-auto px-2 py-3 flex flex-col">
          {/* Shop header */}
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl md:text-2xl font-bold text-yellow-300">Shop</h2>
            <div className="flex items-center">
              <span className="text-xl font-medium mr-2">{gold}</span>
              <div className="w-6 h-6 relative">
                <Image
                  src="/image/ui/coin.png"
                  alt="Gold"
                  width={24}
                  height={24}
                />
              </div>
            </div>
          </div>
          
          {/* Shop content - items and shopkeeper */}
          {error && (
            <div className="bg-red-600 text-white p-2 rounded-md mb-4">
              {error}
            </div>
          )}
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="flex mb-4">
              {/* Shopkeeper on the left - taking up 1/3 of the width */}
              <div className="w-1/3 flex items-end justify-items-end">
                <div className="h-60 flex items-end">
                  <Image
                    src="/image/ui/shopkeeper.png"
                    alt="Shopkeeper"
                    width={300}
                    height={600}
                    className="object-contain object-bottom scale-y-125"
                  />
                </div>
              </div>
              
              {/* Shop items grid on the right - taking up 2/3 of the width */}
              <div className="w-2/3">
                <div className="grid grid-cols-3 grid-rows-2 gap-1 w-full">
                  {shopItems.length === 0 ? (
                    <p className="text-gray-400 text-center py-4 col-span-3">No items available in the shop today.</p>
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
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Separate sell bar section */}
      <div className="container mx-auto px-2 z-10 mt-2">
        {!isLoading && (
          <SellBar
            inventoryItems={inventoryItems}
            gold={gold}
            setGold={setGold}
            isItemEquipped={isItemEquipped}
            onSellComplete={loadData}
          />
        )}
      </div>
    </div>
  );
}
