'use client';

import { useState, useEffect } from 'react';
import ListComponent from '../components/ListComponent';
import SaveButton from '../components/SaveButton';

// Define the Area type based on database schema
type Area = {
  id: number;
  name: string;
  description: string;
  image: string;
  level_requirement: number;
};

export default function AreasComponent({ isAdmin }: { isAdmin: boolean }) {
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Placeholder for fetching areas data
    // This would be replaced with actual API call in future steps
    setIsLoading(false);
    setAreas([
      {
        id: 1,
        name: 'Enchanted Forest',
        description: 'A mystical forest filled with magical creatures and ancient trees.',
        image: '/image/area/enchanted-forest.png',
        level_requirement: 1
      },
      {
        id: 2,
        name: 'Caverns',
        description: 'Dark, winding caves filled with treasures and dangers.',
        image: '/image/area/caverns.png',
        level_requirement: 3
      },
      {
        id: 3,
        name: 'Volcanic Wastes',
        description: 'Scorching hot lands with rivers of lava and fire elementals.',
        image: '/image/area/volcanic-wastes.png',
        level_requirement: 10
      }
    ]);
  }, []);
  
  const handleSave = async () => {
    // Save changes - would be implemented in future steps
    console.log('Saving changes to area:', selectedArea);
    alert('Changes saved successfully!');
  };
  
  const handleAdd = () => {
    // Add new area
    const newArea: Area = {
      id: Date.now(), // Temporary ID
      name: 'New Area',
      description: 'Description of new area',
      image: '',
      level_requirement: 1
    };
    
    setAreas([...areas, newArea]);
    setSelectedArea(newArea);
  };
  
  const handleDelete = (id: string | number) => {
    // Delete area
    setAreas(areas.filter(a => a.id !== id));
    if (selectedArea && selectedArea.id === id) {
      setSelectedArea(null);
    }
  };
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  // Map areas to match the Item interface expected by ListComponent
  const areaItems = areas.map(area => ({
    id: area.id,
    name: area.name,
    area: area // Store the original area object
  }));
  
  return (
    <div className="flex">
      <ListComponent
        items={areaItems}
        onSelect={(item) => setSelectedArea(item.area as Area)}
        onAdd={handleAdd}
        onDelete={handleDelete}
        selectedId={selectedArea?.id}
        isReadOnly={!isAdmin}
      />
      
      <div className="flex-1 p-4">
        {selectedArea ? (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">{selectedArea.name}</h2>
            
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={selectedArea.name}
                  onChange={(e) => setSelectedArea({
                    ...selectedArea,
                    name: e.target.value
                  })}
                  className="w-full p-2 border rounded"
                  disabled={!isAdmin}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={selectedArea.description}
                  onChange={(e) => setSelectedArea({
                    ...selectedArea,
                    description: e.target.value
                  })}
                  className="w-full p-2 border rounded h-24"
                  disabled={!isAdmin}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Level Requirement</label>
                <input
                  type="number"
                  value={selectedArea.level_requirement}
                  onChange={(e) => setSelectedArea({
                    ...selectedArea,
                    level_requirement: parseInt(e.target.value) || 1
                  })}
                  className="w-full p-2 border rounded"
                  disabled={!isAdmin}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Image Path</label>
                <input
                  type="text"
                  value={selectedArea.image}
                  onChange={(e) => setSelectedArea({
                    ...selectedArea,
                    image: e.target.value
                  })}
                  className="w-full p-2 border rounded"
                  disabled={!isAdmin}
                />
                {selectedArea.image && (
                  <div className="mt-2 border p-2 inline-block">
                    <img 
                      src={selectedArea.image} 
                      alt={selectedArea.name} 
                      className="h-24 w-48 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/240x120?text=No+Image';
                      }}
                    />
                  </div>
                )}
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
          <div className="text-gray-500">Select an area from the list {isAdmin ? 'or add a new one' : ''}</div>
        )}
      </div>
    </div>
  );
}
