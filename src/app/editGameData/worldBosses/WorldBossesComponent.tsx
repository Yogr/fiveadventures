'use client';

import { useState, useEffect } from 'react';
import ListComponent from '../components/ListComponent';
import SaveButton from '../components/SaveButton';

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
  
  useEffect(() => {
    // Placeholder for fetching world bosses data
    // This would be replaced with actual API call in future steps
    setIsLoading(false);
    
    // Fake reward tables data for dropdown
    setRewardTables([
      { id: 1, name: 'Common Boss Loot' },
      { id: 2, name: 'Rare Boss Loot' },
      { id: 3, name: 'Legendary Boss Loot' }
    ]);
    
    setWorldBosses([
      {
        id: 1,
        name: 'Ancient Dragon',
        description: 'A massive dragon that has lived for centuries in the mountains.',
        hitpoints: 1000,
        attack: 50,
        defense: 30,
        image_url: '/image/boss/ancient_dragon.png',
        abilities: {
          fire_breath: { damage: 75, cooldown: 3 },
          tail_swipe: { damage: 40, cooldown: 1 }
        },
        reward_table_id: 3,
        respawn_time: 86400, // 24 hours in seconds
        active: true,
        scale: 2.0
      },
      {
        id: 2,
        name: 'Forest Guardian',
        description: 'An ancient spirit that protects the enchanted forest.',
        hitpoints: 800,
        attack: 40,
        defense: 35,
        image_url: '/image/boss/forest_guardian.png',
        abilities: {
          root: { effect: 'stun', duration: 2, cooldown: 4 },
          nature_fury: { damage: 60, cooldown: 2 }
        },
        reward_table_id: 2,
        respawn_time: 43200, // 12 hours in seconds
        active: true,
        scale: 1.8
      },
      {
        id: 3,
        name: 'Shadow Demon',
        description: 'A terrifying demon from the shadow realm.',
        hitpoints: 1200,
        attack: 60,
        defense: 25,
        image_url: '/image/boss/shadow_demon.png',
        abilities: {
          shadow_bolt: { damage: 80, cooldown: 2 },
          fear: { effect: 'flee', duration: 3, cooldown: 5 }
        },
        reward_table_id: 3,
        respawn_time: 86400, // 24 hours in seconds
        active: false,
        scale: 2.2
      }
    ]);
  }, []);
  
  const handleSave = async () => {
    // Save changes - would be implemented in future steps
    console.log('Saving changes to world boss:', selectedBoss);
    alert('Changes saved successfully!');
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
  
  const handleDelete = (id: string | number) => {
    // Delete world boss
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
    return <div>Loading...</div>;
  }
  
  // Map world bosses to match the Item interface expected by ListComponent
  const bossItems = worldBosses.map(boss => ({
    id: boss.id,
    name: boss.name,
    boss: boss // Store the original boss object
  }));
  
  return (
    <div className="flex">
      <ListComponent
        items={bossItems}
        onSelect={(item) => setSelectedBoss(item.boss as WorldBoss)}
        onAdd={handleAdd}
        onDelete={handleDelete}
        selectedId={selectedBoss?.id}
        isReadOnly={!isAdmin}
      />
      
      <div className="flex-1 p-4">
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
                  className="w-full p-2 border rounded"
                  disabled={!isAdmin}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={selectedBoss.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="w-full p-2 border rounded h-24"
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
                    className="w-full p-2 border rounded"
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
                    className="w-full p-2 border rounded"
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
                    className="w-full p-2 border rounded"
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
                    className="w-full p-2 border rounded"
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
                    className="w-full p-2 border rounded"
                    disabled={!isAdmin}
                  />
                  <div className="text-xs text-gray-500 mt-1">
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
                      className="h-4 w-4 border-gray-300 rounded"
                      disabled={!isAdmin}
                    />
                    <span className="ml-2 text-sm text-gray-700">Boss is active</span>
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
                  className="w-full p-2 border rounded"
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
                <input
                  type="text"
                  value={selectedBoss.image_url || ''}
                  onChange={(e) => handleChange('image_url', e.target.value || null)}
                  className="w-full p-2 border rounded"
                  disabled={!isAdmin}
                />
                {selectedBoss.image_url && (
                  <div className="mt-2 border p-2 inline-block">
                    <img 
                      src={selectedBoss.image_url} 
                      alt={selectedBoss.name} 
                      className="h-32 w-32 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/128?text=No+Image';
                      }}
                    />
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
          <div className="text-gray-500">Select a world boss from the list {isAdmin ? 'or add a new one' : ''}</div>
        )}
      </div>
    </div>
  );
}
