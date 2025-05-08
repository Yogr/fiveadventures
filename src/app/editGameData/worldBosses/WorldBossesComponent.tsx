'use client';

import { useState, useEffect, useRef } from 'react';
import ListComponent from '../components/ListComponent';
import SaveButton from '../components/SaveButton';
import { getWorldBosses, getRewardTables, saveWorldBoss, deleteWorldBoss } from '@/app/actions/data-editor';
import { uploadImageToSupabase } from '@/app/actions/image-actions';
import Image from 'next/image';
import { ImageSource } from '@/lib/image-source';

// Define the WorldBoss type based on database schema
type WorldBoss = {
  id: number;
  name: string;
  description: string;
  hitpoints: number;
  attack: number;
  defense: number;
  image_url: string | null;
  abilities: any;
  reward_table_id: number | null;
  respawn_time: number;
  active: boolean;
  scale: number;
};

export default function WorldBossesComponent({ isAdmin }: { isAdmin: boolean }) {
  const [worldBosses, setWorldBosses] = useState<WorldBoss[]>([]);
  const [selectedBoss, setSelectedBoss] = useState<WorldBoss | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rewardTables, setRewardTables] = useState<{ id: number; name: string }[]>([]); // Available reward tables
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !selectedBoss) {
      return;
    }
    
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      // If no image_url exists yet, create one based on the boss name
      if (!selectedBoss.image_url) {
        const newImageName = selectedBoss.name.toLowerCase().replace(/\s+/g, '_');
        handleChange('image_url', newImageName);
      }
      
      // Upload the image using server action instead of client-side upload
      const imageUrl = selectedBoss.image_url || '';
      await uploadImageToSupabase(file, 'boss', imageUrl);
      
      // Force a re-render to show the new image
      setSelectedBoss({...selectedBoss});
      
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
  
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // Load world bosses from database
        const bossesResponse = await getWorldBosses();
        if (bossesResponse.success && bossesResponse.data) {
          setWorldBosses(bossesResponse.data);
        } else {
          console.error('Failed to load world bosses:', bossesResponse.error);
        }
        
        // Load reward tables for dropdown
        const rewardTablesResponse = await getRewardTables();
        if (rewardTablesResponse.success && rewardTablesResponse.data) {
          setRewardTables(rewardTablesResponse.data.map(table => ({
            id: table.id,
            name: table.name
          })));
        } else {
          console.error('Failed to load reward tables:', rewardTablesResponse.error);
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
    if (!selectedBoss) return;
    
    try {
      // Show optimistic UI - you could add a loading state here
      
      const response = await saveWorldBoss(selectedBoss);
      
      if (response.success) {
        // If world boss was newly created, update its ID from the database
        if (typeof selectedBoss.id !== 'number' || selectedBoss.id > 1000000) {
          const savedBoss = response.data;
          
          // Update the world bosses list with the new data
          setWorldBosses(worldBosses.map(boss => 
            boss.id === selectedBoss.id ? savedBoss : boss
          ));
          
          // Update selected boss
          setSelectedBoss(savedBoss);
        } else {
          // Simply refresh the world bosses list
          const bossesResponse = await getWorldBosses();
          if (bossesResponse.success && bossesResponse.data) {
            setWorldBosses(bossesResponse.data);
          }
        }
        
        alert('World boss saved successfully!');
      } else {
        alert(`Error saving world boss: ${response.error}`);
      }
    } catch (error) {
      console.error('Error in save operation:', error);
      alert('An unexpected error occurred while saving');
    }
  };
  
  const handleAdd = () => {
    // Add new world boss
    const newBoss: WorldBoss = {
      id: Date.now(), // Temporary ID
      name: 'New World Boss',
      description: 'Description of new world boss',
      hitpoints: 500,
      attack: 25,
      defense: 15,
      image_url: null,
      abilities: {},
      reward_table_id: null,
      respawn_time: 86400, // 24 hours in seconds
      active: false,
      scale: 1.5
    };
    
    setWorldBosses([...worldBosses, newBoss]);
    setSelectedBoss(newBoss);
  };
  
  const handleDelete = async (id: string | number) => {
    // Only handle numeric IDs - don't try to delete temporary items from DB
    if (typeof id === 'number' && id < 1000000) {
      try {
        const response = await deleteWorldBoss(id);
        
        if (!response.success) {
          alert(`Error deleting world boss: ${response.error}`);
          return;
        }
      } catch (error) {
        console.error('Error deleting world boss:', error);
        alert('An unexpected error occurred while deleting');
        return;
      }
    }
    
    // Update UI
    setWorldBosses(worldBosses.filter(boss => boss.id !== id));
    if (selectedBoss && selectedBoss.id === id) {
      setSelectedBoss(null);
    }
  };
  
  const handleChange = (field: keyof WorldBoss, value: any) => {
    if (!selectedBoss) return;
    
    const selectedId = selectedBoss.id; // Store the ID in a variable
    const updatedBoss = { ...selectedBoss, [field]: value };
    
    setSelectedBoss(updatedBoss);
    
    // Also update the boss in the main list
    setWorldBosses(worldBosses.map(boss => 
      boss.id === selectedId ? updatedBoss : boss
    ));
  };
  
  if (isLoading) {
    return <div className="text-amber-100">Loading world bosses from database...</div>;
  }
  
  // Map world bosses to match the Item interface expected by ListComponent
  const bossItems = worldBosses.map(boss => ({
    id: boss.id,
    name: boss.name,
    boss: boss // Store the original boss object
  }));
  
  return (
    <div className="flex flex-col md:flex-row">
      <div className="w-full md:w-auto">
        <ListComponent
          items={bossItems}
          onSelect={(item) => setSelectedBoss(item.boss as WorldBoss)}
          onAdd={isAdmin ? handleAdd : undefined}
          onDelete={isAdmin ? handleDelete : undefined}
          selectedId={selectedBoss?.id}
          isReadOnly={!isAdmin}
        />
      </div>
      
      <div className="flex-1 p-2 md:p-4 text-amber-100">
        {selectedBoss ? (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">{selectedBoss.name}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={selectedBoss.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="admin-input w-full"
                  disabled={!isAdmin}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={selectedBoss.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="admin-textarea"
                  disabled={!isAdmin}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Hitpoints</label>
                  <input
                    type="number"
                    min="1"
                    value={selectedBoss.hitpoints}
                    onChange={(e) => handleChange('hitpoints', parseInt(e.target.value) || 1)}
                    className="admin-input"
                    disabled={!isAdmin}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Attack</label>
                  <input
                    type="number"
                    min="1"
                    value={selectedBoss.attack}
                    onChange={(e) => handleChange('attack', parseInt(e.target.value) || 1)}
                    className="admin-input"
                    disabled={!isAdmin}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Defense</label>
                  <input
                    type="number"
                    min="0"
                    value={selectedBoss.defense}
                    onChange={(e) => handleChange('defense', parseInt(e.target.value) || 0)}
                    className="admin-input"
                    disabled={!isAdmin}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Scale</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={selectedBoss.scale}
                    onChange={(e) => handleChange('scale', parseFloat(e.target.value) || 1.0)}
                    className="admin-input"
                    disabled={!isAdmin}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Respawn Time (seconds)</label>
                  <input
                    type="number"
                    min="300"
                    value={selectedBoss.respawn_time}
                    onChange={(e) => handleChange('respawn_time', parseInt(e.target.value) || 86400)}
                    className="admin-input"
                    disabled={!isAdmin}
                  />
                  <div className="text-xs text-amber-400 mt-1">
                    {(selectedBoss.respawn_time / 3600).toFixed(1)} hours
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <div className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      checked={selectedBoss.active}
                      onChange={(e) => handleChange('active', e.target.checked)}
                      className="h-4 w-4 border-amber-300 rounded bg-gray-700"
                      disabled={!isAdmin}
                    />
                    <span className="ml-2 text-sm text-amber-200">Boss is active</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Reward Table</label>
                <select
                  value={selectedBoss.reward_table_id || ''}
                  onChange={(e) => {
                    const val = e.target.value === '' ? null : parseInt(e.target.value);
                    handleChange('reward_table_id', val);
                  }}
                  className="admin-input w-full"
                  disabled={!isAdmin}
                >
                  <option value="">No reward table</option>
                  {rewardTables.map((table) => (
                    <option key={table.id} value={table.id}>{table.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={selectedBoss.image_url || ''}
                    onChange={(e) => handleChange('image_url', e.target.value || null)}
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
                {selectedBoss.image_url ? (
                  <div className="mt-3 border border-amber-700 p-2 inline-block bg-amber-950 rounded">
                    <Image 
                      src={selectedBoss.image_url ? ImageSource.getBossImagePath(selectedBoss) : '/placeholder.png'}
                      alt={selectedBoss.name}
                      width={128}
                      height={128}
                      className="h-32 w-32 object-contain"
                      onError={(e) => {
                        // Prevent infinite retries by setting a flag on the element
                        const target = e.target as HTMLImageElement;
                        if (!(target as any).hasErrored) {
                          (target as any).hasErrored = true;
                          target.src = 'https://via.placeholder.com/128?text=No+Image';
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="mt-3 border border-amber-700/50 p-2 inline-block bg-amber-900/20 rounded flex justify-center items-center h-32 w-32 text-amber-500/70 text-xs">
                    No image
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Abilities (JSON)</label>
                <textarea
                  value={JSON.stringify(selectedBoss.abilities, null, 2)}
                  onChange={(e) => {
                    try {
                      const abilities = JSON.parse(e.target.value);
                      handleChange('abilities', abilities);
                    } catch (error) {
                      // Invalid JSON - don't update
                    }
                  }}
                  className="admin-textarea font-mono text-sm"
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
          <div className="text-amber-300">Select a world boss from the list {isAdmin ? 'or add a new one' : ''}</div>
        )}
      </div>
    </div>
  );
}
