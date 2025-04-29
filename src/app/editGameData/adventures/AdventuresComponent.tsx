'use client';

import { useState, useEffect } from 'react';
import ListComponent from '../components/ListComponent';
import SaveButton from '../components/SaveButton';
import { getAdventures, saveAdventure, deleteAdventure, getAreas } from '@/app/actions/data-editor';
import Image from 'next/image';

// Define the Adventure type based on database schema
type Adventure = {
  id: number;
  title: string;
  description: string;
  min_experience: number;
  min_gold: number;
  is_violent: boolean;
  has_combat: boolean;
  area_ids: number[] | null;
  image_url: string | null;
};

export default function AdventuresComponent({ isAdmin }: { isAdmin: boolean }) {
  const [adventures, setAdventures] = useState<Adventure[]>([]);
  const [selectedAdventure, setSelectedAdventure] = useState<Adventure | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function loadAdventures() {
      setIsLoading(true);
      try {
        const response = await getAdventures();
        if (response.success && response.data) {
          setAdventures(response.data);
        } else {
          console.error('Failed to load adventures:', response.error);
        }
      } catch (error) {
        console.error('Error loading adventures:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadAdventures();
  }, []);
  
  const handleSave = async () => {
    if (!selectedAdventure) return;
    
    try {
      // Show optimistic UI - you could add a loading state here
      
      const response = await saveAdventure(selectedAdventure);
      
      if (response.success) {
        // If adventure was newly created, update its ID from the database
        if (typeof selectedAdventure.id !== 'number' || selectedAdventure.id > 1000000) {
          const savedAdventure = response.data;
          
          // Update the adventures list with the new data
          setAdventures(adventures.map(adventure => 
            adventure.id === selectedAdventure.id ? savedAdventure : adventure
          ));
          
          // Update selected adventure
          setSelectedAdventure(savedAdventure);
        } else {
          // Simply refresh the adventures list
          const adventuresResponse = await getAdventures();
          if (adventuresResponse.success && adventuresResponse.data) {
            setAdventures(adventuresResponse.data);
          }
        }
        
        alert('Adventure saved successfully!');
      } else {
        alert(`Error saving adventure: ${response.error}`);
      }
    } catch (error) {
      console.error('Error in save operation:', error);
      alert('An unexpected error occurred while saving');
    }
  };
  
  const handleAdd = () => {
    // Add new adventure
    const newAdventure: Adventure = {
      id: Date.now(), // Temporary ID
      title: 'New Adventure',
      description: 'Description of new adventure',
      min_experience: 10,
      min_gold: 5,
      is_violent: false,
      has_combat: false,
      area_ids: [],
      image_url: null
    };
    
    setAdventures([...adventures, newAdventure]);
    setSelectedAdventure(newAdventure);
  };
  
  const handleDelete = async (id: string | number) => {
    // Only handle numeric IDs - don't try to delete temporary items from DB
    if (typeof id === 'number' && id < 1000000) {
      try {
        const response = await deleteAdventure(id);
        
        if (!response.success) {
          alert(`Error deleting adventure: ${response.error}`);
          return;
        }
      } catch (error) {
        console.error('Error deleting adventure:', error);
        alert('An unexpected error occurred while deleting');
        return;
      }
    }
    
    // Update UI
    setAdventures(adventures.filter(adventure => adventure.id !== id));
    if (selectedAdventure && selectedAdventure.id === id) {
      setSelectedAdventure(null);
    }
  };
  
  if (isLoading) {
    return <div className="text-amber-100">Loading adventures from database...</div>;
  }
  
  // Map adventures to match the Item interface expected by ListComponent
  const adventureItems = adventures.map(adventure => ({
    id: adventure.id,
    name: adventure.title,
    adventure: adventure // Store the original adventure object
  }));
  
  return (
    <div className="flex">
      <ListComponent
        items={adventureItems}
        onSelect={(item) => setSelectedAdventure(item.adventure as Adventure)}
        onAdd={isAdmin ? handleAdd : undefined}
        onDelete={isAdmin ? handleDelete : undefined}
        selectedId={selectedAdventure?.id}
        isReadOnly={!isAdmin}
      />
      
      <div className="flex-1 p-4 text-amber-100">
        {selectedAdventure ? (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">{selectedAdventure.title}</h2>
            
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={selectedAdventure.title}
                  onChange={(e) => setSelectedAdventure({
                    ...selectedAdventure,
                    title: e.target.value
                  })}
                  className="admin-input"
                  disabled={!isAdmin}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={selectedAdventure.description}
                  onChange={(e) => setSelectedAdventure({
                    ...selectedAdventure,
                    description: e.target.value
                  })}
                  className="admin-textarea"
                  disabled={!isAdmin}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Minimum Experience</label>
                  <input
                    type="number"
                    value={selectedAdventure.min_experience}
                    onChange={(e) => setSelectedAdventure({
                      ...selectedAdventure,
                      min_experience: parseInt(e.target.value) || 0
                    })}
                    className="admin-input"
                    disabled={!isAdmin}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Minimum Gold</label>
                  <input
                    type="number"
                    value={selectedAdventure.min_gold}
                    onChange={(e) => setSelectedAdventure({
                      ...selectedAdventure,
                      min_gold: parseInt(e.target.value) || 0
                    })}
                    className="admin-input"
                    disabled={!isAdmin}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Is Violent</label>
                  <div className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      checked={selectedAdventure.is_violent}
                      onChange={(e) => setSelectedAdventure({
                        ...selectedAdventure,
                        is_violent: e.target.checked
                      })}
                      className="h-4 w-4 border-amber-300 rounded bg-gray-700"
                      disabled={!isAdmin}
                    />
                    <span className="ml-2 text-sm text-amber-200">Adventure contains violence</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Has Combat</label>
                  <div className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      checked={selectedAdventure.has_combat}
                      onChange={(e) => setSelectedAdventure({
                        ...selectedAdventure,
                        has_combat: e.target.checked
                      })}
                      className="h-4 w-4 border-amber-300 rounded bg-gray-700"
                      disabled={!isAdmin}
                    />
                    <span className="ml-2 text-sm text-amber-200">Adventure includes combat</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Area IDs</label>
                <p className="text-sm text-amber-400 mb-2">Area IDs (comma separated)</p>
                <input
                  type="text"
                  value={selectedAdventure.area_ids?.join(', ') || ''}
                  onChange={(e) => {
                    const areaIds = e.target.value
                      .split(',')
                      .map(id => parseInt(id.trim()))
                      .filter(id => !isNaN(id));
                    
                    setSelectedAdventure({
                      ...selectedAdventure,
                      area_ids: areaIds.length > 0 ? areaIds : null
                    });
                  }}
                  className="admin-input"
                  disabled={!isAdmin}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <input
                  type="text"
                  value={selectedAdventure.image_url || ''}
                  onChange={(e) => setSelectedAdventure({
                    ...selectedAdventure,
                    image_url: e.target.value || null
                  })}
                  className="admin-input"
                  disabled={!isAdmin}
                />
                {selectedAdventure.image_url && (
                  <div className="mt-3 border border-amber-700 p-2 inline-block bg-amber-950 rounded">
                    <Image 
                      src={`/image/adventure/${selectedAdventure.image_url}.png`}
                      alt={selectedAdventure.title}
                      width={240}
                      height={120}
                      className="h-32 w-64 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/320x160?text=No+Image';
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
          <div className="text-amber-300">Select an adventure from the list {isAdmin ? 'or add a new one' : ''}</div>
        )}
      </div>
    </div>
  );
}
