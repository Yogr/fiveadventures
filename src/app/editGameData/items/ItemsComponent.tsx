'use client';

import { useState, useEffect } from 'react';
import ListComponent from '../components/ListComponent';
import SaveButton from '../components/SaveButton';

// Define the Item type based on database schema
type Item = {
  id: number;
  name: string;
  type: string;
  rarity: string;
  weapon_type: string | null;
  base_damage: number | null;
  base_defense: number | null;
  effects: any;
  value: number;
  image_url: string | null;
};

export default function ItemsComponent({ isAdmin }: { isAdmin: boolean }) {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Placeholder for fetching items data
    // This would be replaced with actual API call in future steps
    setIsLoading(false);
    setItems([
      {
        id: 1,
        name: 'Iron Sword',
        type: 'Weapon',
        rarity: 'Common',
        weapon_type: 'Slashing',
        base_damage: 5,
        base_defense: null,
        effects: {},
        value: 50,
        image_url: '/image/weapon/iron_sword.png'
      },
      {
        id: 2,
        name: 'Leather Armor',
        type: 'Armor',
        rarity: 'Common',
        weapon_type: null,
        base_damage: null,
        base_defense: 3,
        effects: {},
        value: 45,
        image_url: '/image/armor/leather.png'
      },
      {
        id: 3,
        name: 'Fire Amulet',
        type: 'Trinket',
        rarity: 'Rare',
        weapon_type: null,
        base_damage: null,
        base_defense: null,
        effects: { 
          resistance: { fire: 10 },
          spell_boost: { fire: 5 }
        },
        value: 200,
        image_url: '/image/trinket/fire_amulet.png'
      }
    ]);
  }, []);
  
  const handleSave = async () => {
    // Save changes - would be implemented in future steps
    console.log('Saving changes to item:', selectedItem);
    alert('Changes saved successfully!');
  };
  
  const handleAdd = () => {
    // Add new item
    const newItem: Item = {
      id: Date.now(), // Temporary ID
      name: 'New Item',
      type: 'Weapon',
      rarity: 'Common',
      weapon_type: 'Slashing',
      base_damage: 1,
      base_defense: null,
      effects: {},
      value: 10,
      image_url: null
    };
    
    setItems([...items, newItem]);
    setSelectedItem(newItem);
  };
  
  const handleDelete = (id: string | number) => {
    // Delete item
    setItems(items.filter(item => item.id !== id));
    if (selectedItem && selectedItem.id === id) {
      setSelectedItem(null);
    }
  };
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  // Map items to match the Item interface expected by ListComponent
  const itemsList = items.map(item => ({
    id: item.id,
    name: item.name,
    item: item // Store the original item object
  }));
  
  return (
    <div className="flex">
      <ListComponent
        items={itemsList}
        onSelect={(item) => setSelectedItem(item.item as Item)}
        onAdd={handleAdd}
        onDelete={handleDelete}
        selectedId={selectedItem?.id}
        isReadOnly={!isAdmin}
      />
      
      <div className="flex-1 p-4">
        {selectedItem ? (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">{selectedItem.name}</h2>
            
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={selectedItem.name}
                  onChange={(e) => setSelectedItem({
                    ...selectedItem,
                    name: e.target.value
                  })}
                  className="w-full p-2 border rounded"
                  disabled={!isAdmin}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={selectedItem.type}
                    onChange={(e) => setSelectedItem({
                      ...selectedItem,
                      type: e.target.value
                    })}
                    className="w-full p-2 border rounded"
                    disabled={!isAdmin}
                  >
                    <option value="Weapon">Weapon</option>
                    <option value="Helmet">Helmet</option>
                    <option value="Armor">Armor</option>
                    <option value="Trinket">Trinket</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Rarity</label>
                  <select
                    value={selectedItem.rarity}
                    onChange={(e) => setSelectedItem({
                      ...selectedItem,
                      rarity: e.target.value
                    })}
                    className="w-full p-2 border rounded"
                    disabled={!isAdmin}
                  >
                    <option value="Common">Common</option>
                    <option value="Uncommon">Uncommon</option>
                    <option value="Rare">Rare</option>
                    <option value="Epic">Epic</option>
                    <option value="Legendary">Legendary</option>
                  </select>
                </div>
              </div>
              
              {selectedItem.type === 'Weapon' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Weapon Type</label>
                  <select
                    value={selectedItem.weapon_type || ''}
                    onChange={(e) => setSelectedItem({
                      ...selectedItem,
                      weapon_type: e.target.value || null
                    })}
                    className="w-full p-2 border rounded"
                    disabled={!isAdmin}
                  >
                    <option value="Slashing">Slashing</option>
                    <option value="Blunt">Blunt</option>
                    <option value="Piercing">Piercing</option>
                    <option value="Magic">Magic</option>
                  </select>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                {(selectedItem.type === 'Weapon') && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Base Damage</label>
                    <input
                      type="number"
                      value={selectedItem.base_damage || ''}
                      onChange={(e) => setSelectedItem({
                        ...selectedItem,
                        base_damage: e.target.value ? parseInt(e.target.value) : null
                      })}
                      className="w-full p-2 border rounded"
                      disabled={!isAdmin}
                    />
                  </div>
                )}
                
                {(selectedItem.type === 'Armor' || selectedItem.type === 'Helmet') && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Base Defense</label>
                    <input
                      type="number"
                      value={selectedItem.base_defense || ''}
                      onChange={(e) => setSelectedItem({
                        ...selectedItem,
                        base_defense: e.target.value ? parseInt(e.target.value) : null
                      })}
                      className="w-full p-2 border rounded"
                      disabled={!isAdmin}
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium mb-1">Value (Gold)</label>
                  <input
                    type="number"
                    value={selectedItem.value}
                    onChange={(e) => setSelectedItem({
                      ...selectedItem,
                      value: parseInt(e.target.value) || 0
                    })}
                    className="w-full p-2 border rounded"
                    disabled={!isAdmin}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <input
                  type="text"
                  value={selectedItem.image_url || ''}
                  onChange={(e) => setSelectedItem({
                    ...selectedItem,
                    image_url: e.target.value || null
                  })}
                  className="w-full p-2 border rounded"
                  disabled={!isAdmin}
                />
                {selectedItem.image_url && (
                  <div className="mt-2 border p-2 inline-block">
                    <img 
                      src={selectedItem.image_url} 
                      alt={selectedItem.name} 
                      className="h-16 w-16 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/64?text=No+Image';
                      }}
                    />
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Effects (JSON)</label>
                <textarea
                  value={JSON.stringify(selectedItem.effects, null, 2)}
                  onChange={(e) => {
                    try {
                      const effects = JSON.parse(e.target.value);
                      setSelectedItem({
                        ...selectedItem,
                        effects
                      });
                    } catch (error) {
                      // Invalid JSON - don't update
                    }
                  }}
                  className="w-full p-2 border rounded h-48 font-mono text-sm"
                  disabled={!isAdmin}
                />
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
          <div className="text-gray-500">Select an item from the list {isAdmin ? 'or add a new one' : ''}</div>
        )}
      </div>
    </div>
  );
}
