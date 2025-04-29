'use client';

import { useState, useEffect } from 'react';
import ListComponent from '../components/ListComponent';
import SaveButton from '../components/SaveButton';
import { getRewardTables, getItems, saveRewardTable, deleteRewardTable } from '@/app/actions/data-editor';

// Define the RewardTable type based on database schema
type RewardTable = {
  id: number;
  name: string;
  description: string;
  items: RewardItem[];
};

type RewardItem = {
  id: number;
  item_id: number;
  item_name?: string; // For display purposes
  chance: number;
};

export default function RewardTablesComponent({ isAdmin }: { isAdmin: boolean }) {
  const [rewardTables, setRewardTables] = useState<RewardTable[]>([]);
  const [selectedTable, setSelectedTable] = useState<RewardTable | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<{ id: number; name: string }[]>([]); // All available items
  
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // Load reward tables
        const tablesResponse = await getRewardTables();
        if (tablesResponse.success && tablesResponse.data) {
          setRewardTables(tablesResponse.data);
        } else {
          console.error('Failed to load reward tables:', tablesResponse.error);
        }
        
        // Load items for dropdown
        const itemsResponse = await getItems();
        if (itemsResponse.success && itemsResponse.data) {
          setItems(itemsResponse.data.map(item => ({
            id: item.id,
            name: item.name
          })));
        } else {
          console.error('Failed to load items:', itemsResponse.error);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, []);
  
  const handleSave = async () => {
    if (!selectedTable) return;
    
    try {
      // Show optimistic UI - you could add a loading state here
      
      const response = await saveRewardTable(selectedTable);
      
      if (response.success) {
        // If reward table was newly created, update its ID from the database
        if (typeof selectedTable.id !== 'number' || selectedTable.id > 1000000) {
          const savedTable = response.data;
          
          // Update the reward tables list with the new data
          setRewardTables(rewardTables.map(table => 
            table.id === selectedTable.id ? savedTable : table
          ));
          
          // Update selected table
          setSelectedTable(savedTable);
        } else {
          // Simply refresh the reward tables list
          const tablesResponse = await getRewardTables();
          if (tablesResponse.success && tablesResponse.data) {
            setRewardTables(tablesResponse.data);
          }
        }
        
        alert('Reward table saved successfully!');
      } else {
        alert(`Error saving reward table: ${response.error}`);
      }
    } catch (error) {
      console.error('Error in save operation:', error);
      alert('An unexpected error occurred while saving');
    }
  };
  
  const handleAdd = () => {
    // Find the next highest ID
    let nextHighestId = 1;
    for (let i = 0; i < rewardTables.length; i++) {
      const table = rewardTables[i];
      if (table && table.id >= nextHighestId) {
        nextHighestId = table.id + 1;
      }
    }
    
    // Add new reward table with incremental ID
    const newTable: RewardTable = {
      id: nextHighestId,
      name: 'New Reward Table',
      description: 'Description of new reward table',
      items: []
    };
    
    setRewardTables([...rewardTables, newTable]);
    setSelectedTable(newTable);
  };
  
  const handleDelete = async (id: string | number) => {
    // Only handle numeric IDs - don't try to delete temporary items from DB
    if (typeof id === 'number' && id < 1000000) {
      try {
        const response = await deleteRewardTable(id);
        
        if (!response.success) {
          alert(`Error deleting reward table: ${response.error}`);
          return;
        }
      } catch (error) {
        console.error('Error deleting reward table:', error);
        alert('An unexpected error occurred while deleting');
        return;
      }
    }
    
    // Update UI
    setRewardTables(rewardTables.filter(table => table.id !== id));
    if (selectedTable && selectedTable.id === id) {
      setSelectedTable(null);
    }
  };
  
  const handleAddItem = () => {
    if (!selectedTable || items.length === 0) return;
    
    // Make sure we have access to the selected table
    const tableItems = selectedTable.items;

    // Find the next highest ID for the item
    let nextItemId = 1;
    for (let i = 0; i < tableItems.length; i++) {
      const item = tableItems[i];
      if (item && item.id >= nextItemId) {
        nextItemId = item.id + 1;
      }
    }
    
    // Create a new item with the first available item in the dropdown
    const newItem: RewardItem = {
      id: nextItemId, // Use incremental ID
      item_id: items[0]?.id || 0, // Provide fallback values for type safety
      item_name: items[0]?.name || "Unknown Item",
      chance: 10
    };
    
    const updatedTable = {
      ...selectedTable,
      items: [...tableItems, newItem]
    };
    
    setSelectedTable(updatedTable);
    
    // Also update the table in the main list
    const selectedId = selectedTable.id;
    setRewardTables(rewardTables.map(table => 
      table.id === selectedId ? updatedTable : table
    ));
  };
  
  const handleRemoveItem = (itemId: number) => {
    if (!selectedTable) return;
    
    const updatedItems = selectedTable.items.filter(item => item.id !== itemId);
    const updatedTable = {
      ...selectedTable,
      items: updatedItems
    };
    
    setSelectedTable(updatedTable);
    
    // Also update the table in the main list
    const selectedId = selectedTable.id;
    setRewardTables(rewardTables.map(table => 
      table.id === selectedId ? updatedTable : table
    ));
  };
  
  const handleItemChange = (itemId: number, field: keyof RewardItem, value: any) => {
    if (!selectedTable) return;
    
    const updatedItems = selectedTable.items.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value };
        
        // If item_id changed, update the item_name too
        if (field === 'item_id') {
          const selectedItem = items.find(i => i.id === value);
          if (selectedItem) {
            updatedItem.item_name = selectedItem.name;
          }
        }
        
        return updatedItem;
      }
      return item;
    });
    
    const updatedTable = {
      ...selectedTable,
      items: updatedItems
    };
    
    setSelectedTable(updatedTable);
    
    // Also update the table in the main list
    const selectedId = selectedTable.id;
    setRewardTables(rewardTables.map(table => 
      table.id === selectedId ? updatedTable : table
    ));
  };
  
  if (isLoading) {
    return <div className="text-amber-100">Loading reward tables from database...</div>;
  }
  
  // Map reward tables to match the Item interface expected by ListComponent
  const tableItems = rewardTables.map(table => ({
    id: table.id,
    name: table.name,
    table: table // Store the original table object
  }));
  
  return (
    <div className="flex">
      <ListComponent
        items={tableItems}
        onSelect={(item) => setSelectedTable(item.table as RewardTable)}
        onAdd={isAdmin ? handleAdd : undefined}
        onDelete={isAdmin ? handleDelete : undefined}
        selectedId={selectedTable?.id}
        isReadOnly={!isAdmin}
      />
      
      <div className="flex-1 p-4 text-amber-100">
        {selectedTable ? (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">{selectedTable.name}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={selectedTable.name}
                  onChange={(e) => setSelectedTable({
                    ...selectedTable,
                    name: e.target.value
                  })}
                  className="admin-input"
                  disabled={!isAdmin}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={selectedTable.description}
                  onChange={(e) => setSelectedTable({
                    ...selectedTable,
                    description: e.target.value
                  })}
                  className="admin-textarea"
                  disabled={!isAdmin}
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium">Reward Items</h3>
                  {isAdmin && (
                    <button
                      onClick={handleAddItem}
                      className="px-2 py-1 bg-amber-600 text-amber-100 rounded hover:bg-amber-700 text-sm"
                    >
                      Add Item
                    </button>
                  )}
                </div>
                
                <div className="border border-amber-700 rounded overflow-hidden">
                  <table className="min-w-full divide-y divide-amber-800">
                    <thead className="bg-amber-800">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-amber-200 uppercase tracking-wider">Item</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-amber-200 uppercase tracking-wider">Chance (%)</th>
                        {isAdmin && (
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-amber-200 uppercase tracking-wider">Actions</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-amber-900/60 divide-y divide-amber-800">
                      {selectedTable.items.length === 0 ? (
                        <tr>
                          <td colSpan={isAdmin ? 3 : 2} className="px-6 py-4 text-center text-sm text-amber-300">
                            No items in this reward table.
                          </td>
                        </tr>
                      ) : (
                        selectedTable.items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {isAdmin ? (
                                <select
                                  value={item.item_id}
                                  onChange={(e) => handleItemChange(item.id, 'item_id', parseInt(e.target.value))}
                                  className="admin-input w-full"
                                >
                                  {items.map((i) => (
                                    <option key={i.id} value={i.id}>{i.name}</option>
                                  ))}
                                </select>
                              ) : (
                                <span className="text-sm text-amber-200">{item.item_name}</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {isAdmin ? (
                                <input
                                  type="number"
                                  min="1"
                                  max="100"
                                  value={item.chance}
                                  onChange={(e) => handleItemChange(item.id, 'chance', parseInt(e.target.value) || 0)}
                                  className="admin-input w-24"
                                />
                              ) : (
                                <span className="text-sm text-amber-200">{item.chance}%</span>
                              )}
                            </td>
                            {isAdmin && (
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <button
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="text-red-400 hover:text-red-300"
                                >
                                  Remove
                                </button>
                              </td>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                
                {selectedTable.items.length > 0 && (
                  <div className="mt-2 text-sm text-amber-300">
                    Total chance: {selectedTable.items.reduce((sum, item) => sum + item.chance, 0)}%
                    {selectedTable.items.reduce((sum, item) => sum + item.chance, 0) !== 100 && isAdmin && (
                      <span className="ml-2 text-red-400">
                        (Warning: Total should be 100%)
                      </span>
                    )}
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
          <div className="text-amber-300">Select a reward table from the list {isAdmin ? 'or add a new one' : ''}</div>
        )}
      </div>
    </div>
  );
}
