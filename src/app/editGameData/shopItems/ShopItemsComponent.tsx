'use client';

import { useState, useEffect } from 'react';
import ListComponent from '../components/ListComponent';
import SaveButton from '../components/SaveButton';

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
    // Placeholder for fetching shop items data
    // This would be replaced with actual API call in future steps
    setIsLoading(false);
    
    // Fake game items data for dropdown
    setGameItems([
      { id: 1, name: 'Iron Sword' },
      { id: 2, name: 'Leather Armor' },
      { id: 3, name: 'Health Potion' },
      { id: 4, name: 'Fire Amulet' },
      { id: 5, name: 'Magic Staff' }
    ]);
    
    // Fake areas data for dropdown
    setAreas([
      { id: 1, name: 'Enchanted Forest' },
      { id: 2, name: 'Caverns' },
      { id: 3, name: 'Volcanic Wastes' }
    ]);
    
    setShopItems([
      {
        id: 1,
        item_id: 1,
        item_name: 'Iron Sword',
        price: 100,
        currency: 'gold',
        quantity: 5,
        restock_time: 3600,
        category: 'Weapons',
        level_required: 1,
        area_id: 1,
        area_name: 'Enchanted Forest'
      },
      {
        id: 2,
        item_id: 2,
        item_name: 'Leather Armor',
        price: 80,
        currency: 'gold',
        quantity: 3,
        restock_time: 3600,
        category: 'Armor',
        level_required: 1,
        area_id: 1,
        area_name: 'Enchanted Forest'
      },
      {
        id: 3,
        item_id: 3,
        item_name: 'Health Potion',
        price: 25,
        currency: 'gold',
        quantity: 10,
        restock_time: 1800,
        category: 'Consumables',
        level_required: null,
        area_id: null,
        area_name: null
      }
    ]);
  }, []);
  
  const handleSave = async () => {
    // Save changes - would be implemented in future steps
    console.log('Saving changes to shop item:', selectedItem);
    alert('Changes saved successfully!');
  };
  
  const handleAdd = () => {
    // Add new shop item
    if (!gameItems.length) return;
    
    const newItem: ShopItem = {
      id: Date.now(), // Temporary ID
      item_id: gameItems[0].id,
      item_name: gameItems[0].name,
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
    // Delete shop item
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
    return <div>Loading...</div>;
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
        onAdd={handleAdd}
        onDelete={handleDelete}
        selectedId={selectedItem?.id}
        isReadOnly={!isAdmin}
      />
      
      <div className="flex-1 p-4">
        {selectedItem ? (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">{selectedItem.item_name || `Shop Item #${selectedItem.id}`}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Game Item</label>
                <select
                  value={selectedItem.item_id}
                  onChange={(e) => handleItemChange('item_id', parseInt(e.target.value))}
                  className="w-full p-2 border rounded"
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
                    className="w-full p-2 border rounded"
                    disabled={!isAdmin}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Currency</label>
                  <select
                    value={selectedItem.currency}
                    onChange={(e) => handleItemChange('currency', e.target.value)}
                    className="w-full p-2 border rounded"
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
                    className="w-full p-2 border rounded"
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
                    className="w-full p-2 border rounded"
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
                    className="w-full p-2 border rounded"
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
                    className="w-full p-2 border rounded"
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
                  className="w-full p-2 border rounded"
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
          <div className="text-gray-500">Select a shop item from the list {isAdmin ? 'or add a new one' : ''}</div>
        )}
      </div>
    </div>
  );
}
