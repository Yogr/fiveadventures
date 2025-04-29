'use client';

import { useState, useEffect } from 'react';
import ListComponent from '../components/ListComponent';
import SaveButton from '../components/SaveButton';

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
  };
  startingSkills: number[];
};

export default function ClassesComponent({ isAdmin }: { isAdmin: boolean }) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Placeholder for fetching classes data
    // This would be replaced with actual API call in future steps
    setIsLoading(false);
    setClasses([
      {
        id: 1,
        name: 'Warrior',
        description: 'A strong fighter skilled in melee combat.',
        baseStats: {
          strength: 10,
          intelligence: 5,
          agility: 7,
          luck: 5,
          wisdom: 5
        },
        startingSkills: [1, 2, 3]
      },
      {
        id: 2,
        name: 'Wizard',
        description: 'A powerful spellcaster with arcane knowledge.',
        baseStats: {
          strength: 4,
          intelligence: 10,
          agility: 6,
          luck: 5,
          wisdom: 8
        },
        startingSkills: [4, 5, 6]
      }
    ]);
  }, []);
  
  const handleSave = async () => {
    // Save changes - would be implemented in future steps
    console.log('Saving changes to class:', selectedClass);
    alert('Changes saved successfully!');
  };
  
  const handleAdd = () => {
    // Add new class
    const newClass: Class = {
      id: Date.now(), // Temporary ID
      name: 'New Class',
      description: 'Description of new class',
      baseStats: {
        strength: 5,
        intelligence: 5,
        agility: 5,
        luck: 5,
        wisdom: 5
      },
      startingSkills: []
    };
    
    setClasses([...classes, newClass]);
    setSelectedClass(newClass);
  };
  
  const handleDelete = (id: string | number) => {
    // Delete class
    setClasses(classes.filter(c => c.id !== id));
    if (selectedClass && selectedClass.id === id) {
      setSelectedClass(null);
    }
  };
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  // Map classes to match the Item interface expected by ListComponent
  const classItems = classes.map(classItem => ({
    id: classItem.id,
    name: classItem.name,
    class: classItem // Store the original class object
  }));
  
  return (
    <div className="flex">
      <ListComponent
        items={classItems}
        onSelect={(item) => setSelectedClass(item.class as Class)}
        onAdd={handleAdd}
        onDelete={handleDelete}
        selectedId={selectedClass?.id}
        isReadOnly={!isAdmin}
      />
      
      <div className="flex-1 p-4">
        {selectedClass ? (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">{selectedClass.name}</h2>
            
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={selectedClass.name}
                  onChange={(e) => setSelectedClass({
                    ...selectedClass,
                    name: e.target.value
                  })}
                  className="w-full p-2 border rounded"
                  disabled={!isAdmin}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={selectedClass.description}
                  onChange={(e) => setSelectedClass({
                    ...selectedClass,
                    description: e.target.value
                  })}
                  className="w-full p-2 border rounded h-24"
                  disabled={!isAdmin}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Base Stats</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs">Strength</label>
                    <input
                      type="number"
                      value={selectedClass.baseStats.strength}
                      onChange={(e) => setSelectedClass({
                        ...selectedClass,
                        baseStats: {
                          ...selectedClass.baseStats,
                          strength: parseInt(e.target.value) || 0
                        }
                      })}
                      className="w-full p-2 border rounded"
                      disabled={!isAdmin}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs">Intelligence</label>
                    <input
                      type="number"
                      value={selectedClass.baseStats.intelligence}
                      onChange={(e) => setSelectedClass({
                        ...selectedClass,
                        baseStats: {
                          ...selectedClass.baseStats,
                          intelligence: parseInt(e.target.value) || 0
                        }
                      })}
                      className="w-full p-2 border rounded"
                      disabled={!isAdmin}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs">Agility</label>
                    <input
                      type="number"
                      value={selectedClass.baseStats.agility}
                      onChange={(e) => setSelectedClass({
                        ...selectedClass,
                        baseStats: {
                          ...selectedClass.baseStats,
                          agility: parseInt(e.target.value) || 0
                        }
                      })}
                      className="w-full p-2 border rounded"
                      disabled={!isAdmin}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs">Luck</label>
                    <input
                      type="number"
                      value={selectedClass.baseStats.luck}
                      onChange={(e) => setSelectedClass({
                        ...selectedClass,
                        baseStats: {
                          ...selectedClass.baseStats,
                          luck: parseInt(e.target.value) || 0
                        }
                      })}
                      className="w-full p-2 border rounded"
                      disabled={!isAdmin}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs">Wisdom</label>
                    <input
                      type="number"
                      value={selectedClass.baseStats.wisdom}
                      onChange={(e) => setSelectedClass({
                        ...selectedClass,
                        baseStats: {
                          ...selectedClass.baseStats,
                          wisdom: parseInt(e.target.value) || 0
                        }
                      })}
                      className="w-full p-2 border rounded"
                      disabled={!isAdmin}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Starting Skills</label>
                <p className="text-sm text-gray-500 mb-2">Skill IDs (comma separated)</p>
                <input
                  type="text"
                  value={selectedClass.startingSkills.join(', ')}
                  onChange={(e) => {
                    const skillIds = e.target.value
                      .split(',')
                      .map(id => parseInt(id.trim()))
                      .filter(id => !isNaN(id));
                    
                    setSelectedClass({
                      ...selectedClass,
                      startingSkills: skillIds
                    });
                  }}
                  className="w-full p-2 border rounded"
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
          <div className="text-gray-500">Select a class from the list {isAdmin ? 'or add a new one' : ''}</div>
        )}
      </div>
    </div>
  );
}
