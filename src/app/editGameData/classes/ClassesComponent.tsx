'use client';

import { useState, useEffect } from 'react';
import ListComponent from '../components/ListComponent';
import { CLASS_BASE_STATS } from '@/lib/utils';

// Define the Class type
type Class = {
  id: number;
  name: string;
  description: string;
  baseStats: {
    strength: number;
    intelligence: number;
    agility: number;
    luck: number;
    wisdom: number;
    hitpoints: number;
    energy: number;
  };
  startingSkills: number[];
};

// Class descriptions
const CLASS_DESCRIPTIONS = {
  Warrior: "A strong fighter skilled in melee combat and physical prowess. Warriors excel at frontline combat and can withstand significant damage.",
  Wizard: "A powerful spellcaster with arcane knowledge. Wizards control devastating magical attacks and utility spells.",
  Thief: "A nimble rogue specializing in stealth and precision strikes. Thieves excel at critical strikes and finding treasures.",
  Ranger: "A skilled hunter with exceptional accuracy in ranged combat. Rangers are versatile fighters who excel in nature environments.",
  Cleric: "A divine spellcaster with healing abilities and protective magic. Clerics provide essential support to their allies."
};

// Starting skills for each class (placeholder IDs)
const CLASS_STARTING_SKILLS = {
  Warrior: [1, 4, 8],
  Wizard: [2, 6, 9],
  Thief: [3, 7, 12],
  Ranger: [5, 10, 14],
  Cleric: [11, 13, 15]
};

export default function ClassesComponent({ isAdmin }: { isAdmin: boolean }) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Load classes from the hard-coded data
    const classData = Object.entries(CLASS_BASE_STATS).map(([name, stats], index) => ({
      id: index + 1,
      name,
      description: CLASS_DESCRIPTIONS[name as keyof typeof CLASS_DESCRIPTIONS] || "",
      baseStats: stats,
      startingSkills: CLASS_STARTING_SKILLS[name as keyof typeof CLASS_STARTING_SKILLS] || []
    }));
    
    setClasses(classData);
    setIsLoading(false);
  }, []);
  
  if (isLoading) {
    return <div className="text-amber-100">Loading...</div>;
  }
  
  // Map classes to match the interface expected by ListComponent
  const classItems = classes.map(classItem => ({
    id: classItem.id,
    name: classItem.name,
    class: classItem // Store the original class object
  }));
  
  return (
    <div className="flex flex-col md:flex-row">
      <div className="w-full md:w-auto">
        <ListComponent
          items={classItems}
          onSelect={(item) => setSelectedClass(item.class as Class)}
          onAdd={undefined} // No adding new classes
          onDelete={undefined} // No deleting classes
          selectedId={selectedClass?.id}
          isReadOnly={true} // Always read-only since classes are hard-coded
        />
      </div>
      
      <div className="flex-1 p-2 md:p-4 text-amber-100">
        {selectedClass ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">{selectedClass.name}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={selectedClass.description}
                  className="admin-textarea"
                  disabled={true}
                  readOnly
                />
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Base Stats</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Strength</label>
                    <input
                      type="number"
                      value={selectedClass.baseStats.strength}
                      className="admin-input"
                      disabled={true}
                      readOnly
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Intelligence</label>
                    <input
                      type="number"
                      value={selectedClass.baseStats.intelligence}
                      className="admin-input"
                      disabled={true}
                      readOnly
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Agility</label>
                    <input
                      type="number"
                      value={selectedClass.baseStats.agility}
                      className="admin-input"
                      disabled={true}
                      readOnly
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Luck</label>
                    <input
                      type="number"
                      value={selectedClass.baseStats.luck}
                      className="admin-input"
                      disabled={true}
                      readOnly
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Wisdom</label>
                    <input
                      type="number"
                      value={selectedClass.baseStats.wisdom}
                      className="admin-input"
                      disabled={true}
                      readOnly
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Hitpoints</label>
                    <input
                      type="number"
                      value={selectedClass.baseStats.hitpoints}
                      className="admin-input"
                      disabled={true}
                      readOnly
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Energy</label>
                    <input
                      type="number"
                      value={selectedClass.baseStats.energy}
                      className="admin-input"
                      disabled={true}
                      readOnly
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Starting Skills</label>
                <div className="bg-gray-800 text-amber-100 p-4 rounded border border-amber-700">
                  <span className="text-amber-300 font-medium">Skill IDs: </span>
                  {selectedClass.startingSkills.join(', ')}
                </div>
              </div>
            </div>
            
            <div className="mt-6 text-amber-400">
              <p>Classes are hard-coded in the system and cannot be modified.</p>
            </div>
          </div>
        ) : (
          <div className="text-amber-300">Select a class from the list to view details</div>
        )}
      </div>
    </div>
  );
}
