'use client';

import { useState, useEffect } from 'react';
import ListComponent from '../components/ListComponent';
import SaveButton from '../components/SaveButton';
import EffectsEditor from '../components/EffectsEditor';
import { getSkills, saveSkill, deleteSkill } from '@/app/actions/data-editor';
import Image from 'next/image';
import { ImageSource } from '@/lib/image-source';

// Define the Skill type based on database schema
type Skill = {
  id: number;
  name: string;
  description: string;
  class: string;
  energy_cost: number;
  cooldown: number;
  level_required: number;
  attribute: string;
  power: number;
  effects: any;
  image_url: string | null;
};

export default function SkillsComponent({ isAdmin }: { isAdmin: boolean }) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function loadSkills() {
      setIsLoading(true);
      try {
        const response = await getSkills();
        if (response.success && response.data) {
          setSkills(response.data);
        } else {
          console.error('Failed to load skills:', response.error);
        }
      } catch (error) {
        console.error('Error loading skills:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadSkills();
  }, []);
  
  const handleSave = async () => {
    if (!selectedSkill) return;
    
    try {
      // Show optimistic UI - you could add a loading state here
      
      const response = await saveSkill(selectedSkill);
      
      if (response.success) {
        // If skill was newly created, update its ID from the database
        if (typeof selectedSkill.id !== 'number' || selectedSkill.id > 1000000) {
          const savedSkill = response.data;
          
          // Update the skills list with the new skill data
          setSkills(skills.map(skill => 
            skill.id === selectedSkill.id ? savedSkill : skill
          ));
          
          // Update selected skill
          setSelectedSkill(savedSkill);
        } else {
          // Simply refresh the skills list
          const skillsResponse = await getSkills();
          if (skillsResponse.success && skillsResponse.data) {
            setSkills(skillsResponse.data);
          }
        }
        
        alert('Skill saved successfully!');
      } else {
        alert(`Error saving skill: ${response.error}`);
      }
    } catch (error) {
      console.error('Error in save operation:', error);
      alert('An unexpected error occurred while saving');
    }
  };
  
  const handleAdd = () => {
    // Find next highest ID
    let nextHighestId = 1;
    for (const skill of skills) {
      if (skill && skill.id >= nextHighestId) {
        nextHighestId = skill.id + 1;
      }
    }

    // Add new skill
    const newSkill: Skill = {
      id: nextHighestId,
      name: 'New Skill',
      description: 'Description of new skill',
      class: 'Warrior',
      energy_cost: 10,
      cooldown: 0,
      level_required: 1,
      attribute: 'strength',
      power: 1,
      effects: {},
      image_url: null
    };
    
    setSkills([...skills, newSkill]);
    setSelectedSkill(newSkill);
  };
  
  const handleDelete = async (id: string | number) => {
    // Only handle numeric IDs - don't try to delete temporary items from DB
    if (typeof id === 'number' && id < 1000000) {
      try {
        const response = await deleteSkill(id);
        
        if (!response.success) {
          alert(`Error deleting skill: ${response.error}`);
          return;
        }
      } catch (error) {
        console.error('Error deleting skill:', error);
        alert('An unexpected error occurred while deleting');
        return;
      }
    }
    
    // Update UI
    setSkills(skills.filter(skill => skill.id !== id));
    if (selectedSkill && selectedSkill.id === id) {
      setSelectedSkill(null);
    }
  };
  
  if (isLoading) {
    return <div className="text-amber-100">Loading skills from database...</div>;
  }
  
  // Map skills to match the Item interface expected by ListComponent
  const skillItems = skills.map(skill => ({
    id: skill.id,
    name: skill.name,
    skill: skill // Store the original skill object
  }));
  
  return (
    <div className="flex flex-col md:flex-row">
      <div className="w-full md:w-auto">
        <ListComponent
          items={skillItems}
          onSelect={(item) => setSelectedSkill(item.skill as Skill)}
          onAdd={isAdmin ? handleAdd : undefined}
          onDelete={isAdmin ? handleDelete : undefined}
          selectedId={selectedSkill?.id}
          isReadOnly={!isAdmin}
        />
      </div>
      
      <div className="flex-1 p-2 md:p-4 text-amber-100">
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
                  className="admin-input"
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
                  className="admin-textarea"
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
                  className="admin-input"
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
                    className="admin-input"
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
                    className="admin-input"
                    disabled={!isAdmin}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Level Required</label>
                  <input
                    type="number"
                    value={selectedSkill.level_required}
                    onChange={(e) => setSelectedSkill({
                      ...selectedSkill,
                      level_required: parseInt(e.target.value) || 1
                    })}
                    className="admin-input"
                    disabled={!isAdmin}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Attribute</label>
                  <select
                    value={selectedSkill.attribute}
                    onChange={(e) => setSelectedSkill({
                      ...selectedSkill,
                      attribute: e.target.value
                    })}
                    className="admin-input"
                    disabled={!isAdmin}
                  >
                    <option value="strength">Strength</option>
                    <option value="intelligence">Intelligence</option>
                    <option value="agility">Agility</option>
                    <option value="luck">Luck</option>
                    <option value="wisdom">Wisdom</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Power</label>
                <input
                  type="number"
                  step="0.1"
                  value={selectedSkill.power}
                  onChange={(e) => setSelectedSkill({
                    ...selectedSkill,
                    power: parseFloat(e.target.value) || 0
                  })}
                  className="admin-input"
                  disabled={!isAdmin}
                />
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
                  className="admin-input"
                  disabled={!isAdmin}
                />
                {selectedSkill.image_url && (
                  <div className="mt-3 border border-amber-700 p-2 inline-block bg-amber-950 rounded">
                    <Image
                      src={ImageSource.getSkillImagePath({ image_url: selectedSkill.image_url })} 
                      alt={selectedSkill.name} 
                      width={128}
                      height={128}
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
                <label className="block text-sm font-medium mb-1">Effects</label>
                <EffectsEditor 
                  effects={selectedSkill.effects || {}}
                  onChange={(newEffects) => {
                    setSelectedSkill({
                      ...selectedSkill,
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
          <div className="text-amber-300">Select a skill from the list {isAdmin ? 'or add a new one' : ''}</div>
        )}
      </div>
    </div>
  );
}
