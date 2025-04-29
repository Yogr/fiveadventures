'use client';

import { useState, useEffect } from 'react';
import ListComponent from '../components/ListComponent';
import SaveButton from '../components/SaveButton';

// Define the Monster type based on database schema
type Monster = {
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
  reward_table?: number | null;
  is_boss?: boolean;
  rare_item_chance?: number | null;
};

export default function MonstersComponent({ isAdmin }: { isAdmin: boolean }) {
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [selectedMonster, setSelectedMonster] = useState<Monster | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Placeholder for fetching monsters data
    // This would be replaced with actual API call in future steps
    setIsLoading(false);
    setMonsters([
      {
        id: 1,
        name: 'Forest Wolf',
        description: 'A ferocious wolf that prowls the enchanted forest.',
        hitpoints: 15,
        attack: 5,
        defense: 2,
        experience_reward: 10,
        gold_reward: 5,
        difficulty: 1,
        attack_type: 'physical',
        abilities: {},
        image_url: '/image/enemy/forest_wolf.png',
        is_elite: false,
        scale: 1.0,
        reward_table: 1,
        is_boss: false,
        rare_item_chance: 5
      },
      {
        id: 2,
        name: 'Cave Troll',
        description: 'A massive troll that lives in the dark caverns.',
        hitpoints: 40,
        attack: 12,
        defense: 6,
        experience_reward: 30,
        gold_reward: 20,
        difficulty: 3,
        attack_type: 'physical',
        abilities: {
          special_attack: { name: 'Smash', damage_multiplier: 1.5, cooldown: 3 }
        },
        image_url: '/image/enemy/cave_troll.png',
        is_elite: false,
        scale: 1.2,
        reward_table: 2,
        is_boss: false,
        rare_item_chance: 10
      },
      {
        id: 3,
        name: 'Forest Guardian',
        description: 'An ancient protector of the enchanted forest.',
        hitpoints: 100,
        attack: 20,
        defense: 15,
        experience_reward: 100,
        gold_reward: 75,
        difficulty: 5,
        attack_type: 'magic',
        abilities: {
          heal: { amount: 10, cooldown: 4 },
          nature_wrath: { damage: 15, cooldown: 2 }
        },
        image_url: '/image/enemy/forest_guardian.png',
        is_elite: true,
        scale: 1.5,
        reward_table: 3,
        is_boss: true,
        rare_item_chance: 25
      }
    ]);
  }, []);
  
  const handleSave = async () => {
    // Save changes - would be implemented in future steps
    console.log('Saving changes to monster:', selectedMonster);
    alert('Changes saved successfully!');
  };
  
  const handleAdd = () => {
    // Add new monster
    const newMonster: Monster = {
      id: Date.now(), // Temporary ID
      name: 'New Monster',
      description: 'Description of new monster',
      hitpoints: 10,
      attack: 3,
      defense: 1,
      experience_reward: 5,
      gold_reward: 3,
      difficulty: 1,
      attack_type: 'physical',
      abilities: {},
      image_url: null,
      is_elite: false,
      scale: 1.0,
      reward_table: null,
      is_boss: false,
      rare_item_chance: 5
    };
    
    setMonsters([...monsters, newMonster]);
    setSelectedMonster(newMonster);
  };
  
  const handleDelete = (id: string | number) => {
    // Delete monster
    setMonsters(monsters.filter(m => m.id !== id));
    if (selectedMonster && selectedMonster.id === id) {
      setSelectedMonster(null);
    }
  };
  
  if (isLoading) {
    return <div>Loading...</div>;
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
        onSelect={(item) => setSelectedMonster(item.monster as Monster)}
        onAdd={handleAdd}
        onDelete={handleDelete}
        selectedId={selectedMonster?.id}
        isReadOnly={!isAdmin}
      />
      
      <div className="flex-1 p-4">
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
                  className="w-full p-2 border rounded"
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
                  className="w-full p-2 border rounded h-24"
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
                    className="w-full p-2 border rounded"
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
                    className="w-full p-2 border rounded"
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
                    className="w-full p-2 border rounded"
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
                    className="w-full p-2 border rounded"
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
                    className="w-full p-2 border rounded"
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
                    className="w-full p-2 border rounded"
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
                    className="w-full p-2 border rounded"
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
                    className="w-full p-2 border rounded"
                    disabled={!isAdmin}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Reward Table ID</label>
                  <input
                    type="number"
                    value={selectedMonster.reward_table || ''}
                    onChange={(e) => setSelectedMonster({
                      ...selectedMonster,
                      reward_table: e.target.value ? parseInt(e.target.value) : null
                    })}
                    className="w-full p-2 border rounded"
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
                    className="w-full p-2 border rounded"
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
                      className="h-4 w-4 border-gray-300 rounded"
                      disabled={!isAdmin}
                    />
                    <span className="ml-2 text-sm text-gray-700">This is an elite monster</span>
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
                      className="h-4 w-4 border-gray-300 rounded"
                      disabled={!isAdmin}
                    />
                    <span className="ml-2 text-sm text-gray-700">This is a boss monster</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <input
                  type="text"
                  value={selectedMonster.image_url || ''}
                  onChange={(e) => setSelectedMonster({
                    ...selectedMonster,
                    image_url: e.target.value || null
                  })}
                  className="w-full p-2 border rounded"
                  disabled={!isAdmin}
                />
                {selectedMonster.image_url && (
                  <div className="mt-2 border p-2 inline-block">
                    <img 
                      src={selectedMonster.image_url} 
                      alt={selectedMonster.name} 
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
          <div className="text-gray-500">Select a monster from the list {isAdmin ? 'or add a new one' : ''}</div>
        )}
      </div>
    </div>
  );
}
