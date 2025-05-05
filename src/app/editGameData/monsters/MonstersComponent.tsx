'use client';

import { useState, useEffect, useRef } from 'react';
import ListComponent from '../components/ListComponent';
import SaveButton from '../components/SaveButton';
import { getMonsters, saveMonster, deleteMonster } from '@/app/actions/data-editor';
import Image from 'next/image';
import { ImageSource } from '@/lib/image-source';

// Local Monster type for the editor
type EditorMonster = {
  id: number;
  name: string;
  description: string;
  hitpoints: number;
  attack: number;
  defense: number;
  experience_reward: number;
  gold_reward: number;
  difficulty: number;
  attack_type: string;
  abilities: any;
  image_url: string | null;
  is_elite?: boolean;
  scale?: number | null;
  reward_table_id?: number | null;
  is_boss?: boolean;
  rare_item_chance?: number | null;
  created_at?: string;
};

export default function MonstersComponent({ isAdmin }: { isAdmin: boolean }) {
  const [monsters, setMonsters] = useState<EditorMonster[]>([]);
  const [selectedMonster, setSelectedMonster] = useState<EditorMonster | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function loadMonsters() {
      setIsLoading(true);
      try {
        const response = await getMonsters();
        if (response.success && response.data) {
          setMonsters(response.data);
        } else {
          console.error('Failed to load monsters:', response.error);
        }
      } catch (error) {
        console.error('Error loading monsters:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadMonsters();
  }, []);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !selectedMonster) {
      return;
    }
    
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      // If no image_url exists yet, create one based on the monster name
      if (!selectedMonster.image_url) {
        const newImageName = selectedMonster.name.toLowerCase().replace(/\s+/g, '_');
        setSelectedMonster({
          ...selectedMonster,
          image_url: newImageName
        });
      }
      
      // Upload the image
      const imageUrl = selectedMonster.image_url || '';
      await ImageSource.uploadImageClient(file, 'enemy', imageUrl);
      
      // Force a re-render to show the new image
      setSelectedMonster({...selectedMonster});
      
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    }
  };
  
  const handleSave = async () => {
    if (!selectedMonster) return;
    
    try {
      // Show optimistic UI - you could add a loading state here
      
      const response = await saveMonster(selectedMonster);
      
      if (response.success) {
        // If monster was newly created, update its ID from the database
        if (typeof selectedMonster.id !== 'number' || selectedMonster.id > 1000000) {
          const savedMonster = response.data;
          
          // Update the monsters list with the new monster data
          setMonsters(monsters.map(monster => 
            monster.id === selectedMonster.id ? savedMonster : monster
          ));
          
          // Update selected monster
          setSelectedMonster(savedMonster);
        } else {
          // Simply refresh the monsters list
          const monstersResponse = await getMonsters();
          if (monstersResponse.success && monstersResponse.data) {
            setMonsters(monstersResponse.data);
          }
        }
        
        alert('Monster saved successfully!');
      } else {
        alert(`Error saving monster: ${response.error}`);
      }
    } catch (error) {
      console.error('Error in save operation:', error);
      alert('An unexpected error occurred while saving');
    }
  };
  
  const handleAdd = () => {
    // Add new monster
    let nextHighestId = -1;
    for (let i = 0; i < monsters.length; i++) {
      const monster = monsters[i];
      if (monster && monster.id >= nextHighestId) {
        nextHighestId = monster.id + 1;
      }
    }

    const newMonster: EditorMonster = {
      id: nextHighestId,
      name: 'New Monster',
      description: 'Description of new monster',
      hitpoints: 100,
      attack: 10,
      defense: 5,
      experience_reward: 50,
      gold_reward: 20,
      difficulty: 1,
      attack_type: 'Physical',
      abilities: {},
      image_url: null,
      is_elite: false,
      reward_table_id: null,
      is_boss: false,
      rare_item_chance: 5,
      scale: 1.0
    };
    
    setMonsters([...monsters, newMonster]);
    setSelectedMonster(newMonster);
  };
  
  const handleDelete = async (id: number) => {
    // Only handle numeric IDs - don't try to delete temporary items from DB
    try {
      const response = await deleteMonster(id);
      
      if (!response.success) {
        alert(`Error deleting monster: ${response.error}`);
        return;
      }
    } catch (error) {
      console.error('Error deleting monster:', error);
      alert('An unexpected error occurred while deleting');
      return;
    }

    // Update UI
    setMonsters(monsters.filter(monster => monster.id !== id));
    if (selectedMonster && selectedMonster.id === id) {
      setSelectedMonster(null);
    }
  };
  
  if (isLoading) {
    return <div className="text-amber-100">Loading monsters from database...</div>;
  }
  
  // Map monsters to match the Item interface expected by ListComponent
  const monsterItems = monsters.map(monster => ({
    id: monster.id,
    name: monster.name,
    monster: monster // Store the original monster object
  }));
  
  return (
    <div className="flex">
      <ListComponent
        items={monsterItems}
        onSelect={(item) => setSelectedMonster(item.monster as EditorMonster)}
        onAdd={isAdmin ? handleAdd : undefined}
        onDelete={isAdmin ? handleDelete : undefined}
        selectedId={selectedMonster?.id}
        isReadOnly={!isAdmin}
      />
      
      <div className="flex-1 p-4 text-amber-100">
        {selectedMonster ? (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">{selectedMonster.name}</h2>
            
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={selectedMonster.name}
                  onChange={(e) => setSelectedMonster({
                    ...selectedMonster,
                    name: e.target.value
                  })}
                  className="admin-input"
                  disabled={!isAdmin}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={selectedMonster.description}
                  onChange={(e) => setSelectedMonster({
                    ...selectedMonster,
                    description: e.target.value
                  })}
                  className="admin-textarea"
                  disabled={!isAdmin}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Hitpoints</label>
                  <input
                    type="number"
                    value={selectedMonster.hitpoints}
                    onChange={(e) => setSelectedMonster({
                      ...selectedMonster,
                      hitpoints: parseInt(e.target.value) || 0
                    })}
                    className="admin-input"
                    disabled={!isAdmin}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Attack</label>
                  <input
                    type="number"
                    value={selectedMonster.attack}
                    onChange={(e) => setSelectedMonster({
                      ...selectedMonster,
                      attack: parseInt(e.target.value) || 0
                    })}
                    className="admin-input"
                    disabled={!isAdmin}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Defense</label>
                  <input
                    type="number"
                    value={selectedMonster.defense}
                    onChange={(e) => setSelectedMonster({
                      ...selectedMonster,
                      defense: parseInt(e.target.value) || 0
                    })}
                    className="admin-input"
                    disabled={!isAdmin}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Experience Reward</label>
                  <input
                    type="number"
                    value={selectedMonster.experience_reward}
                    onChange={(e) => setSelectedMonster({
                      ...selectedMonster,
                      experience_reward: parseInt(e.target.value) || 0
                    })}
                    className="admin-input"
                    disabled={!isAdmin}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Gold Reward</label>
                  <input
                    type="number"
                    value={selectedMonster.gold_reward}
                    onChange={(e) => setSelectedMonster({
                      ...selectedMonster,
                      gold_reward: parseInt(e.target.value) || 0
                    })}
                    className="admin-input"
                    disabled={!isAdmin}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Difficulty</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={selectedMonster.difficulty}
                    onChange={(e) => setSelectedMonster({
                      ...selectedMonster,
                      difficulty: parseInt(e.target.value) || 1
                    })}
                    className="admin-input"
                    disabled={!isAdmin}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Attack Type</label>
                  <select
                    value={selectedMonster.attack_type}
                    onChange={(e) => setSelectedMonster({
                      ...selectedMonster,
                      attack_type: e.target.value
                    })}
                    className="admin-input"
                    disabled={!isAdmin}
                  >
                    <option value="physical">Physical</option>
                    <option value="magic">Magic</option>
                    <option value="ranged">Ranged</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Scale</label>
                  <input
                    type="number"
                    step="0.1"
                    value={selectedMonster.scale || 1.0}
                    onChange={(e) => setSelectedMonster({
                      ...selectedMonster,
                      scale: parseFloat(e.target.value) || 1.0
                    })}
                    className="admin-input"
                    disabled={!isAdmin}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Reward Table ID</label>
                  <input
                    type="number"
                    value={selectedMonster.reward_table_id !== null && selectedMonster.reward_table_id !== undefined ? selectedMonster.reward_table_id : ''}
                    onChange={(e) => setSelectedMonster({
                      ...selectedMonster,
                      reward_table_id: e.target.value ? parseInt(e.target.value) : null
                    })}
                    className="admin-input"
                    disabled={!isAdmin}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Rare Item Chance (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={selectedMonster.rare_item_chance || 0}
                    onChange={(e) => setSelectedMonster({
                      ...selectedMonster,
                      rare_item_chance: parseInt(e.target.value) || 0
                    })}
                    className="admin-input"
                    disabled={!isAdmin}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Is Elite</label>
                  <div className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      checked={selectedMonster.is_elite || false}
                      onChange={(e) => setSelectedMonster({
                        ...selectedMonster,
                        is_elite: e.target.checked
                      })}
                      className="h-4 w-4 border-amber-300 rounded bg-gray-700"
                      disabled={!isAdmin}
                    />
                    <span className="ml-2 text-sm text-amber-200">This is an elite monster</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Is Boss</label>
                  <div className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      checked={selectedMonster.is_boss || false}
                      onChange={(e) => setSelectedMonster({
                        ...selectedMonster,
                        is_boss: e.target.checked
                      })}
                      className="h-4 w-4 border-amber-300 rounded bg-gray-700"
                      disabled={!isAdmin}
                    />
                    <span className="ml-2 text-sm text-amber-200">This is a boss monster</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={selectedMonster.image_url || ''}
                    onChange={(e) => setSelectedMonster({
                      ...selectedMonster,
                      image_url: e.target.value || null
                    })}
                    className="admin-input flex-grow"
                    disabled={!isAdmin}
                  />
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1 bg-amber-700 text-amber-100 rounded hover:bg-amber-600 text-sm"
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
                {selectedMonster.image_url && (
                  <div className="mt-3 border border-amber-700 p-2 inline-block bg-amber-950 rounded">
                    <Image 
                      src={ImageSource.getMonsterImagePath(selectedMonster)}
                      alt={selectedMonster.name}
                      width={128 * selectedMonster.scale!}
                      height={128 * selectedMonster.scale!}
                      className="h-24 w-24 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/120?text=No+Image';
                      }}
                    />
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Abilities (JSON)</label>
                <textarea
                  value={JSON.stringify(selectedMonster.abilities, null, 2)}
                  onChange={(e) => {
                    try {
                      const abilities = JSON.parse(e.target.value);
                      setSelectedMonster({
                        ...selectedMonster,
                        abilities
                      });
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
          <div className="text-amber-300">Select a monster from the list {isAdmin ? 'or add a new one' : ''}</div>
        )}
      </div>
    </div>
  );
}
