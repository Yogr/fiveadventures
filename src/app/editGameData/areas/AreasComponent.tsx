'use client';

import { useState, useEffect, useRef } from 'react';
import ListComponent from '../components/ListComponent';
import SaveButton from '../components/SaveButton';
import { getAreas, saveArea, deleteArea } from '@/app/actions/data-editor';
import Image from 'next/image';
import { ImageSource } from '@/lib/image-source';

// Define the Area type for the editor
type EditorArea = {
  id: number;
  name: string;
  description: string;
  image: string;
  level_requirement: number;
  is_dungeon: boolean;
  dungeon_keys_required: number;
};

export default function AreasComponent({ isAdmin }: { isAdmin: boolean }) {
  const [areas, setAreas] = useState<EditorArea[]>([]);
  const [selectedArea, setSelectedArea] = useState<EditorArea | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !selectedArea) {
      return;
    }
    
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      // If no image name exists yet, create one based on the area name
      if (!selectedArea.image) {
        const newImageName = selectedArea.name.toLowerCase().replace(/\s+/g, '-');
        setSelectedArea({
          ...selectedArea,
          image: newImageName
        });
      }
      
      // Upload the image
      const imageName = selectedArea.image || '';
      await ImageSource.uploadImageClient(file, 'area', imageName);
      
      // Force a re-render to show the new image
      setSelectedArea({...selectedArea});
      
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    }
  };
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
    const nextHighestId = areas.reduce((max, area) => Math.max(max, area.id), 0) + 1;

    // Add new area
    const newArea: EditorArea = {
      id: nextHighestId,
      name: 'New Area',
      description: 'Description of new area',
      image: '',
      level_requirement: 1,
      is_dungeon: false,
      dungeon_keys_required: 0
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
    <div className="flex flex-col md:flex-row">
      <div className="w-full md:w-auto">
        <ListComponent
          items={areaItems}
          onSelect={(item) => setSelectedArea(item.area as EditorArea)}
          onAdd={isAdmin ? handleAdd : undefined}
          onDelete={isAdmin ? handleDelete : undefined}
          selectedId={selectedArea?.id}
          isReadOnly={!isAdmin}
        />
      </div>
      
      <div className="flex-1 p-2 md:p-4 text-amber-100">
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
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={selectedArea.image}
                    onChange={(e) => setSelectedArea({
                      ...selectedArea,
                      image: e.target.value
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
                <div className="text-xs text-amber-400 mt-1">
                  Enter just the image name without extension
                </div>
                
                {selectedArea.image && (
                  <div className="mt-3 border border-amber-700 p-2 inline-block bg-amber-950 rounded">
                    <Image 
                      src={ImageSource.getAreaImagePath(selectedArea)} 
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
              
              <div>
                <label className="block text-sm font-medium mb-1">Dungeon Settings</label>
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={selectedArea.is_dungeon}
                    onChange={(e) => setSelectedArea({
                      ...selectedArea,
                      is_dungeon: e.target.checked
                    })}
                    className="admin-checkbox mr-2"
                    disabled={!isAdmin}
                  />
                  <span>Is Dungeon</span>
                </div>
                
                {selectedArea.is_dungeon && (
                  <div className="ml-6 mt-2">
                    <label className="block text-sm font-medium mb-1">Dungeon Keys Required</label>
                    <input
                      type="number"
                      value={selectedArea.dungeon_keys_required}
                      onChange={(e) => setSelectedArea({
                        ...selectedArea,
                        dungeon_keys_required: parseInt(e.target.value) || 0
                      })}
                      className="admin-input w-20"
                      min="0"
                      disabled={!isAdmin}
                    />
                    <div className="text-xs text-amber-400 mt-1">
                      Number of dungeon keys required to enter this dungeon
                    </div>
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
