'use client';

import { useState, useEffect } from 'react';
import ListComponent from '../components/ListComponent';
import SaveButton from '../components/SaveButton';
import { getShopItems, getItems, getAreas } from '@/app/actions/data-editor';

// Define the ShopItem type based on database schema
type ShopItem = {
  id: number;
  item_id: number;
  item_name?: string; // For display purposes
  price: number;
  currency: string;
  quantity: number | null;
  restock_time: number | null;
  category: string;
  level_required: number | null;
  area_id: number | null;
  area_name?: string | null; // For display purposes
};

export default function ShopItemsComponent({ isAdmin }: { isAdmin: boolean }) {
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [gameItems, setGameItems] = useState<{ id: number; name: string }[]>([]); // All available items
  const [areas, setAreas] = useState<{ id: number; name: string }[]>([]); // All available areas
  
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // Load shop items from database
        const shopResponse = await getShopItems();
        if (shopResponse.success && shopResponse.data) {
          setShopItems(shopResponse.data);
        } else {
          console.error('Failed to load shop items:', shopResponse.error);
        }
        
        // Load items for dropdown
        const itemsResponse = await getItems();
        if (itemsResponse.success && itemsResponse.data) {
          setGameItems(itemsResponse.data.map(item => ({
            id: item.id,
            name: item.name
          })));
        } else {
          console.error('Failed to load items:', itemsResponse.error);
        }
        
        // Load areas for dropdown
        const areasResponse = await getAreas();
        if (areasResponse.success && areasResponse.data) {
          setAreas(areasResponse.data.map(area => ({
            id: area.id,
            name: area.name
          })));
        } else {
          console.error('Failed to load areas:', areasResponse.error);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, []);
  
  const handleSave = async () => {
    if (!selectedItem) return;
    
    // Need to implement a saveShopItem function in data-editor.ts
    alert('Saving shop item to database is not implemented yet.');
  };
  
  const handleAdd = () => {
    // Add new shop item
    if (gameItems.length === 0) return;
    
    // Make sure we have at least one item
    const firstItem = gameItems[0]; // Extract to variable for type safety
    const newItem: ShopItem = {
      id: Date.now(), // Temporary ID
      item_id: firstItem?.id || 0, // Use optional chaining and fallback
      item_name: firstItem?.name || "Unknown Item",
      price: 50,
      currency: 'gold',
      quantity: 1,
      restock_time: 3600,
      category: 'Misc',
      level_required: null,
      area_id: null
    };
    
    setShopItems([...shopItems, newItem]);
    setSelectedItem(newItem);
  };
  
  const handleDelete = (id: string | number) => {
    // Need to implement a deleteShopItem function in data-editor.ts
    // For now, just update the UI
    setShopItems(shopItems.filter(item => item.id !== id));
    if (selectedItem && selectedItem.id === id) {
      setSelectedItem(null);
    }
  };
  
  const handleItemChange = (field: keyof ShopItem, value: any) => {
    if (!selectedItem) return;
    
    const selectedId = selectedItem.id; // Store the ID in a variable
    let updatedItem = { ...selectedItem, [field]: value };
    
    // If item_id changed, update the item_name too
    if (field === 'item_id') {
      const gameItem = gameItems.find(item => item.id === value);
      if (gameItem) {
        updatedItem.item_name = gameItem.name;
      }
    }
    
    // If area_id changed, update the area_name too
    if (field === 'area_id') {
      if (value === null) {
        updatedItem.area_name = null;
      } else {
        const area = areas.find(area => area.id === value);
        if (area) {
          updatedItem.area_name = area.name;
        }
      }
    }
    
    setSelectedItem(updatedItem);
    
    // Also update the item in the main list
    setShopItems(shopItems.map(item => 
      item.id === selectedId ? updatedItem : item
    ));
  };
  
  if (isLoading) {
    return <div className="text-amber-100">Loading shop items from database...</div>;
  }
  
  // Map shop items to match the Item interface expected by ListComponent
  const shopItemsList = shopItems.map(item => ({
    id: item.id,
    name: item.item_name || `Item #${item.item_id}`,
    shopItem: item // Store the original shop item object
  }));
  
  return (
    <div className="flex">
      <ListComponent
        items={shopItemsList}
        onSelect={(item) => setSelectedItem(item.shopItem as ShopItem)}
        onAdd={isAdmin ? handleAdd : undefined}
        onDelete={isAdmin ? handleDelete : undefined}
        selectedId={selectedItem?.id}
        isReadOnly={!isAdmin}
      />
      
      <div className="flex-1 p-4 text-amber-100">
        {selectedItem ? (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">{selectedItem.item_name || `Shop Item #${selectedItem.id}`}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Game Item</label>
                <select
                  value={selectedItem.item_id}
                  onChange={(e) => handleItemChange('item_id', parseInt(e.target.value))}
                  className="admin-input w-full"
                  disabled={!isAdmin}
                >
                  {gameItems.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price</label>
                  <input
                    type="number"
                    min="0"
                    value={selectedItem.price}
                    onChange={(e) => handleItemChange('price', parseInt(e.target.value) || 0)}
                    className="admin-input"
                    disabled={!isAdmin}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Currency</label>
                  <select
                    value={selectedItem.currency}
                    onChange={(e) => handleItemChange('currency', e.target.value)}
                    className="admin-input"
                    disabled={!isAdmin}
                  >
                    <option value="gold">Gold</option>
                    <option value="gems">Gems</option>
                    <option value="tokens">Tokens</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity (-1 for unlimited)</label>
                  <input
                    type="number"
                    min="-1"
                    value={selectedItem.quantity === null ? -1 : selectedItem.quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      handleItemChange('quantity', val === -1 ? null : val);
                    }}
                    className="admin-input"
                    disabled={!isAdmin}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Restock Time (seconds, -1 for never)</label>
                  <input
                    type="number"
                    min="-1"
                    value={selectedItem.restock_time === null ? -1 : selectedItem.restock_time}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      handleItemChange('restock_time', val === -1 ? null : val);
                    }}
                    className="admin-input"
                    disabled={!isAdmin}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={selectedItem.category}
                    onChange={(e) => handleItemChange('category', e.target.value)}
                    className="admin-input"
                    disabled={!isAdmin}
                  >
                    <option value="Weapons">Weapons</option>
                    <option value="Armor">Armor</option>
                    <option value="Consumables">Consumables</option>
                    <option value="Trinkets">Trinkets</option>
                    <option value="Misc">Misc</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Level Required (0 for none)</label>
                  <input
                    type="number"
                    min="0"
                    value={selectedItem.level_required === null ? 0 : selectedItem.level_required}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      handleItemChange('level_required', val === 0 ? null : val);
                    }}
                    className="admin-input"
                    disabled={!isAdmin}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Area (Optional)</label>
                <select
                  value={selectedItem.area_id === null ? "" : selectedItem.area_id}
                  onChange={(e) => {
                    const val = e.target.value === "" ? null : parseInt(e.target.value);
                    handleItemChange('area_id', val);
                  }}
                  className="admin-input w-full"
                  disabled={!isAdmin}
                >
                  <option value="">No specific area</option>
                  {areas.map((area) => (
                    <option key={area.id} value={area.id}>{area.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {isAdmin && (
              <div className="mt-6">
                <SaveButton onClick={handleSave} />
              </div>
            )}
            
            {!isAdmin && (
              <div className="mt-6 text-red-500">
                You need admin privileges to save changes.
              </div>
            )}
          </div>
        ) : (
          <div className="text-amber-300">Select a shop item from the list {isAdmin ? 'or add a new one' : ''}</div>
        )}
      </div>
    </div>
  );
}
