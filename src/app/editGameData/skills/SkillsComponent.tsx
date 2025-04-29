'use client';

import { useState, useEffect } from 'react';
import ListComponent from '../components/ListComponent';
import SaveButton from '../components/SaveButton';

// Define the Skill type based on database schema
type Skill = {
  id: number;
  name: string;
  description: string;
  class: string;
  energy_cost: number;
  cooldown: number;
  effects: any;
  image_url: string | null;
  attribute: string | null;
  power: number | null;
};

export default function SkillsComponent({ isAdmin }: { isAdmin: boolean }) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Placeholder for fetching skills data
    // This would be replaced with actual API call in future steps
    setIsLoading(false);
    setSkills([
      {
        id: 1,
        name: 'Slash',
        description: 'A strong melee attack that deals physical damage.',
        class: 'Warrior',
        energy_cost: 10,
        cooldown: 0,
        effects: { damage: 5, type: 'physical' },
        image_url: '/image/skill/slash.png',
        attribute: 'strength',
        power: 1.5
      },
      {
        id: 2,
        name: 'Fireball',
        description: 'Launches a ball of fire at the enemy.',
        class: 'Wizard',
        energy_cost: 20,
        cooldown: 1,
        effects: { damage: 8, type: 'fire', burn: { chance: 30, duration: 2, damage: 2 } },
        image_url: '/image/skill/fireball.png',
        attribute: 'intelligence',
        power: 2.0
      }
    ]);
  }, []);
  
  const handleSave = async () => {
    // Save changes - would be implemented in future steps
    console.log('Saving changes to skill:', selectedSkill);
    alert('Changes saved successfully!');
  };
  
  const handleAdd = () => {
    // Add new skill
    const newSkill: Skill = {
      id: Date.now(), // Temporary ID
      name: 'New Skill',
      description: 'Description of new skill',
      class: 'Warrior',
      energy_cost: 10,
      cooldown: 0,
      effects: {},
      image_url: null,
      attribute: null,
      power: null
    };
    
    setSkills([...skills, newSkill]);
    setSelectedSkill(newSkill);
  };
  
  const handleDelete = (id: string | number) => {
    // Delete skill
    setSkills(skills.filter(s => s.id !== id));
    if (selectedSkill && selectedSkill.id === id) {
      setSelectedSkill(null);
    }
  };
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  // Map skills to match the Item interface expected by ListComponent
  const skillItems = skills.map(skill => ({
    id: skill.id,
    name: skill.name,
    skill: skill // Store the original skill object
  }));
  
  return (
    <div className="flex">
      <ListComponent
        items={skillItems}
        onSelect={(item) => setSelectedSkill(item.skill as Skill)}
        onAdd={handleAdd}
        onDelete={handleDelete}
        selectedId={selectedSkill?.id}
        isReadOnly={!isAdmin}
      />
      
      <div className="flex-1 p-4">
        {selectedSkill ? (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">{selectedSkill.name}</h2>
            
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={selectedSkill.name}
                  onChange={(e) => setSelectedSkill({
                    ...selectedSkill,
                    name: e.target.value
                  })}
                  className="w-full p-2 border rounded"
                  disabled={!isAdmin}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={selectedSkill.description}
                  onChange={(e) => setSelectedSkill({
                    ...selectedSkill,
                    description: e.target.value
                  })}
                  className="w-full p-2 border rounded h-24"
                  disabled={!isAdmin}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Class</label>
                <select
                  value={selectedSkill.class}
                  onChange={(e) => setSelectedSkill({
                    ...selectedSkill,
                    class: e.target.value
                  })}
                  className="w-full p-2 border rounded"
                  disabled={!isAdmin}
                >
                  <option value="Warrior">Warrior</option>
                  <option value="Wizard">Wizard</option>
                  <option value="Thief">Thief</option>
                  <option value="Ranger">Ranger</option>
                  <option value="Cleric">Cleric</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Energy Cost</label>
                  <input
                    type="number"
                    value={selectedSkill.energy_cost}
                    onChange={(e) => setSelectedSkill({
                      ...selectedSkill,
                      energy_cost: parseInt(e.target.value) || 0
                    })}
                    className="w-full p-2 border rounded"
                    disabled={!isAdmin}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Cooldown (turns)</label>
                  <input
                    type="number"
                    value={selectedSkill.cooldown}
                    onChange={(e) => setSelectedSkill({
                      ...selectedSkill,
                      cooldown: parseInt(e.target.value) || 0
                    })}
                    className="w-full p-2 border rounded"
                    disabled={!isAdmin}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Attribute</label>
                  <select
                    value={selectedSkill.attribute || ''}
                    onChange={(e) => setSelectedSkill({
                      ...selectedSkill,
                      attribute: e.target.value || null
                    })}
                    className="w-full p-2 border rounded"
                    disabled={!isAdmin}
                  >
                    <option value="">None</option>
                    <option value="strength">Strength</option>
                    <option value="intelligence">Intelligence</option>
                    <option value="agility">Agility</option>
                    <option value="luck">Luck</option>
                    <option value="wisdom">Wisdom</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Power Multiplier</label>
                  <input
                    type="number"
                    step="0.1"
                    value={selectedSkill.power || ''}
                    onChange={(e) => setSelectedSkill({
                      ...selectedSkill,
                      power: parseFloat(e.target.value) || null
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
                  value={selectedSkill.image_url || ''}
                  onChange={(e) => setSelectedSkill({
                    ...selectedSkill,
                    image_url: e.target.value || null
                  })}
                  className="w-full p-2 border rounded"
                  disabled={!isAdmin}
                />
                {selectedSkill.image_url && (
                  <div className="mt-2 border p-2 inline-block">
                    <img 
                      src={selectedSkill.image_url} 
                      alt={selectedSkill.name} 
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
                  value={JSON.stringify(selectedSkill.effects, null, 2)}
                  onChange={(e) => {
                    try {
                      const effects = JSON.parse(e.target.value);
                      setSelectedSkill({
                        ...selectedSkill,
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
          <div className="text-gray-500">Select a skill from the list {isAdmin ? 'or add a new one' : ''}</div>
        )}
      </div>
    </div>
  );
}
