'use client';

import { useState, useEffect } from 'react';
import ListComponent from '../components/ListComponent';
import SaveButton from '../components/SaveButton';
import { getAreas, saveArea, deleteArea } from '@/app/actions/data-editor';
import Image from 'next/image';

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
    async function loadAreas() {
      setIsLoading(true);
      try {
        const response = await getAreas();
        if (response.success && response.data) {
          setAreas(response.data);
        } else {
          console.error('Failed to load areas:', response.error);
        }
      } catch (error) {
        console.error('Error loading areas:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadAreas();
  }, []);
  
  const handleSave = async () => {
    if (!selectedArea) return;
    
    try {
      // Show optimistic UI - you could add a loading state here
      
      const response = await saveArea(selectedArea);
      
      if (response.success) {
        // If area was newly created, update its ID from the database
        if (typeof selectedArea.id !== 'number' || selectedArea.id > 1000000) {
          const savedArea = response.data;
          
          // Update the areas list with the new area data
          setAreas(areas.map(area => 
            area.id === selectedArea.id ? savedArea : area
          ));
          
          // Update selected area
          setSelectedArea(savedArea);
        } else {
          // Simply refresh the areas list
          const areasResponse = await getAreas();
          if (areasResponse.success && areasResponse.data) {
            setAreas(areasResponse.data);
          }
        }
        
        alert('Area saved successfully!');
      } else {
        alert(`Error saving area: ${response.error}`);
      }
    } catch (error) {
      console.error('Error in save operation:', error);
      alert('An unexpected error occurred while saving');
    }
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
  
  const handleDelete = async (id: string | number) => {
    // Only handle numeric IDs - don't try to delete temporary items from DB
    if (typeof id === 'number' && id < 1000000) {
      try {
        const response = await deleteArea(id);
        
        if (!response.success) {
          alert(`Error deleting area: ${response.error}`);
          return;
        }
      } catch (error) {
        console.error('Error deleting area:', error);
        alert('An unexpected error occurred while deleting');
        return;
      }
    }
    
    // Update UI
    setAreas(areas.filter(area => area.id !== id));
    if (selectedArea && selectedArea.id === id) {
      setSelectedArea(null);
    }
  };
  
  if (isLoading) {
    return <div className="text-amber-100">Loading areas from database...</div>;
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
        onAdd={isAdmin ? handleAdd : undefined}
        onDelete={isAdmin ? handleDelete : undefined}
        selectedId={selectedArea?.id}
        isReadOnly={!isAdmin}
      />
      
      <div className="flex-1 p-4 text-amber-100">
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
                  className="admin-input"
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
                  className="admin-textarea"
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
                  className="admin-input"
                  disabled={!isAdmin}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Image Name</label>
                <input
                  type="text"
                  value={selectedArea.image}
                  onChange={(e) => setSelectedArea({
                    ...selectedArea,
                    image: e.target.value
                  })}
                  className="admin-input"
                  disabled={!isAdmin}
                />
                <div className="text-xs text-amber-400 mt-1">
                  Image files should be placed in public/image/area/ (enter just the name without extension)
                </div>
                
                {selectedArea.image && (
                  <div className="mt-3 border border-amber-700 p-2 inline-block bg-amber-950 rounded">
                    <Image 
                      src={`/image/area/${selectedArea.image}.png`} 
                      alt={selectedArea.name}
                      width={240}
                      height={120}
                      className="h-32 w-56 object-cover"
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
          <div className="text-amber-300">Select an area from the list {isAdmin ? 'or add a new one' : ''}</div>
        )}
      </div>
    </div>
  );
}
