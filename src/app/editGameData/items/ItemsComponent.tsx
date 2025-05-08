'use client';

import { useState, useEffect, useRef } from 'react';
import ListComponent from '../components/ListComponent';
import SaveButton from '../components/SaveButton';
import EffectsEditor from '../components/EffectsEditor';
import { getItems, saveItem, deleteItem } from '@/app/actions/data-editor';
import { uploadImageToSupabase } from '@/app/actions/image-actions';
import Image from 'next/image';
import { ImageSource } from '@/lib/image-source';

// Define the Item type for the editor
type EditorItem = {
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
  const [items, setItems] = useState<EditorItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<EditorItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !selectedItem) {
      return;
    }
    
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      // If no image_url exists yet, create one based on the item name
      if (!selectedItem.image_url) {
        const newImageName = selectedItem.name.toLowerCase().replace(/\s+/g, '_');
        setSelectedItem({
          ...selectedItem,
          image_url: newImageName
        });
      }
      
      // Upload the image using server action instead of client-side upload
      const imageUrl = selectedItem.image_url || '';
      await uploadImageToSupabase(file, selectedItem.type.toLowerCase(), imageUrl);
      
      // Force a re-render to show the new image
      setSelectedItem({...selectedItem});
      
    } catch (error) {
      console.error('Error uploading image:', error);
      
      // Extract the error message from the error object
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Try to parse JSON error message if present
        try {
          const jsonError = JSON.parse(error.message);
          if (jsonError.message) {
            errorMessage = jsonError.message;
          }
        } catch (e) {
          // Not a JSON error, use the original message
        }
      }
      
      alert(`Failed to upload image: ${errorMessage}`);
    }
  };
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function loadItems() {
      setIsLoading(true);
      try {
        const response = await getItems();
        if (response.success && response.data) {
          setItems(response.data);
        } else {
          console.error('Failed to load items:', response.error);
        }
      } catch (error) {
        console.error('Error loading items:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadItems();
  }, []);
  
  const handleSave = async () => {
    if (!selectedItem) return;
    
    try {
      // Show optimistic UI - you could add a loading state here
      
      const response = await saveItem(selectedItem);
      
      if (response.success) {
        // Simply refresh the items list
        const itemsResponse = await getItems();
        if (itemsResponse.success && itemsResponse.data) {
          setItems(itemsResponse.data);
        }
        
        alert('Item saved successfully!');
      } else {
        alert(`Error saving item: ${response.error}`);
      }
    } catch (error) {
      console.error('Error in save operation:', error);
      alert('An unexpected error occurred while saving');
    }
  };
  
  const handleAdd = () => {
    
    let nextHighestId = -1;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item && item.id >= nextHighestId) {
        nextHighestId = item.id + 1;
      }
    }

    const newItem: EditorItem = {
      id: nextHighestId,
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
  
  const handleDelete = async (id: string | number) => {
    // Only handle numeric IDs - don't try to delete temporary items from DB
    if (typeof id === 'number' && id < 1000000000) {
      try {
        const response = await deleteItem(id);
        
        if (!response.success) {
          alert(`Error deleting item: ${response.error}`);
          return;
        }
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('An unexpected error occurred while deleting');
        return;
      }
    }
    
    // Update UI
    setItems(items.filter(item => item.id !== id));
    if (selectedItem && selectedItem.id === id) {
      setSelectedItem(null);
    }
  };
  
  if (isLoading) {
    return <div className="text-amber-100">Loading items from database...</div>;
  }
  
  // Map items to match the Item interface expected by ListComponent
  const itemsList = items.map(item => ({
    id: item.id,
    name: item.name,
    item: item // Store the original item object
  }));
  
  return (
    <div className="flex flex-col md:flex-row">
      <div className="w-full md:w-auto">
        <ListComponent
          items={itemsList}
          onSelect={(item) => setSelectedItem(item.item as EditorItem)}
          onAdd={handleAdd}
          onDelete={handleDelete}
          selectedId={selectedItem?.id}
          isReadOnly={!isAdmin}
        />
      </div>
      
      <div className="flex-1 p-2 md:p-4 text-amber-100">
        {selectedItem ? (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">{selectedItem.name}</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={selectedItem.name}
                    onChange={(e) => setSelectedItem({
                      ...selectedItem,
                      name: e.target.value
                    })}
                    className="admin-input w-full"
                    disabled={!isAdmin}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">ID</label>
                  <input
                    type="text"
                    value={selectedItem.id}
                    onChange={(e) => setSelectedItem({
                      ...selectedItem,
                      id: Number(e.target.value)
                    })}
                    className="admin-input w-full"
                    disabled={!isAdmin}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={selectedItem.type}
                    onChange={(e) => setSelectedItem({
                      ...selectedItem,
                      type: e.target.value
                    })}
                    className="admin-input w-full"
                    disabled={!isAdmin}
                  >
                    <option value="Weapon">Weapon</option>
                    <option value="Helmet">Helmet</option>
                    <option value="Armor">Armor</option>
                    <option value="Trinket">Trinket</option>
                  </select>
                </div>
                
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">Rarity</label>
                  <select
                    value={selectedItem.rarity}
                    onChange={(e) => setSelectedItem({
                      ...selectedItem,
                      rarity: e.target.value
                    })}
                    className="admin-input w-full"
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
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {selectedItem.type === 'Weapon' && (
                  <>
                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-sm font-medium mb-1">Weapon Type</label>
                      <select
                        value={selectedItem.weapon_type || ''}
                        onChange={(e) => setSelectedItem({
                          ...selectedItem,
                          weapon_type: e.target.value || null
                        })}
                        className="admin-input w-full"
                        disabled={!isAdmin}
                      >
                        <option value="Slashing">Slashing</option>
                        <option value="Blunt">Blunt</option>
                        <option value="Piercing">Piercing</option>
                        <option value="Magic">Magic</option>
                      </select>
                    </div>
                    
                    <div className="col-span-1">
                      <label className="block text-sm font-medium mb-1">Base Damage</label>
                      <input
                        type="number"
                        value={selectedItem.base_damage || ''}
                        onChange={(e) => setSelectedItem({
                          ...selectedItem,
                          base_damage: e.target.value ? parseInt(e.target.value) : null
                        })}
                        className="admin-input w-full"
                        disabled={!isAdmin}
                      />
                    </div>
                  </>
                )}
                
                {(selectedItem.type === 'Armor' || selectedItem.type === 'Helmet') && (
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-sm font-medium mb-1">Base Defense</label>
                    <input
                      type="number"
                      value={selectedItem.base_defense || ''}
                      onChange={(e) => setSelectedItem({
                        ...selectedItem,
                        base_defense: e.target.value ? parseInt(e.target.value) : null
                      })}
                      className="admin-input w-full"
                      disabled={!isAdmin}
                    />
                  </div>
                )}
                
                <div className="col-span-1">
                  <label className="block text-sm font-medium mb-1">Value (Gold)</label>
                  <input
                    type="number"
                    value={selectedItem.value}
                    onChange={(e) => setSelectedItem({
                      ...selectedItem,
                      value: parseInt(e.target.value) || 0
                    })}
                    className="admin-input w-full"
                    disabled={!isAdmin}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="col-span-1 sm:col-span-3">
                  <label className="block text-sm font-medium mb-1">Image URL</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={selectedItem.image_url || ''}
                      onChange={(e) => setSelectedItem({
                        ...selectedItem,
                        image_url: e.target.value || null
                      })}
                      className="admin-input flex-grow"
                      disabled={!isAdmin}
                    />
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1 bg-amber-700 text-amber-100 rounded hover:bg-amber-600 text-sm transition-colors"
                      >
                        Upload
                      </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>
                
                <div className="col-span-1">
                  {selectedItem.image_url ? (
                    <div className="mt-2 border border-amber-700 p-2 rounded-md bg-amber-900/30 flex justify-center">
                      <Image
                        src={selectedItem.image_url ? ImageSource.getItemImagePath(selectedItem) : '/placeholder.png'}
                        alt={selectedItem.name}
                        width={128}
                        height={128}
                        className="h-16 w-16 object-contain"
                        onError={(e) => {
                          // Prevent infinite retries by setting a flag on the element
                          const target = e.target as HTMLImageElement;
                          if (!(target as any).hasErrored) {
                            (target as any).hasErrored = true;
                            target.src = 'https://via.placeholder.com/64?text=No+Image';
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="mt-2 border border-amber-700/50 p-2 rounded-md bg-amber-900/20 flex justify-center items-center h-[72px] text-amber-500/70 text-xs">
                      No image
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Effects</label>
                <EffectsEditor 
                  effects={selectedItem.effects || {}}
                  onChange={(newEffects) => {
                    setSelectedItem({
                      ...selectedItem,
                      effects: newEffects
                    })
                  }}
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
