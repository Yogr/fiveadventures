'use client';

import { useState, useEffect } from 'react';
import ListComponent from '../components/ListComponent';
import SaveButton from '../components/SaveButton';

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
    // Placeholder for fetching reward tables data
    // This would be replaced with actual API call in future steps
    setIsLoading(false);
    
    // Fake items data for dropdown
    setItems([
      { id: 1, name: 'Iron Sword' },
      { id: 2, name: 'Leather Armor' },
      { id: 3, name: 'Health Potion' },
      { id: 4, name: 'Fire Amulet' },
      { id: 5, name: 'Magic Staff' }
    ]);
    
    setRewardTables([
      {
        id: 1,
        name: 'Forest Loot',
        description: 'Common items found in the enchanted forest.',
        items: [
          { id: 1, item_id: 1, item_name: 'Iron Sword', chance: 20 },
          { id: 2, item_id: 2, item_name: 'Leather Armor', chance: 30 },
          { id: 3, item_id: 3, item_name: 'Health Potion', chance: 50 }
        ]
      },
      {
        id: 2,
        name: 'Rare Magic Items',
        description: 'Rare magical items found in special locations.',
        items: [
          { id: 1, item_id: 4, item_name: 'Fire Amulet', chance: 40 },
          { id: 2, item_id: 5, item_name: 'Magic Staff', chance: 60 }
        ]
      }
    ]);
  }, []);
  
  const handleSave = async () => {
    // Save changes - would be implemented in future steps
    console.log('Saving changes to reward table:', selectedTable);
    alert('Changes saved successfully!');
  };
  
  const handleAdd = () => {
    // Add new reward table
    const newTable: RewardTable = {
      id: Date.now(), // Temporary ID
      name: 'New Reward Table',
      description: 'Description of new reward table',
      items: []
    };
    
    setRewardTables([...rewardTables, newTable]);
    setSelectedTable(newTable);
  };
  
  const handleDelete = (id: string | number) => {
    // Delete reward table
    setRewardTables(rewardTables.filter(rt => rt.id !== id));
    if (selectedTable && selectedTable.id === id) {
      setSelectedTable(null);
    }
  };
  
  const handleAddItem = () => {
    if (!selectedTable || !items.length) return;
    
    // Extract values to help TypeScript know they're defined
    const { id, items: tableItems } = selectedTable;
    
    // Use the first available item as default
    const newItem: RewardItem = {
      id: Date.now(), // Temporary ID
      item_id: items[0].id,
      item_name: items[0].name,
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
    return <div>Loading...</div>;
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
        onAdd={handleAdd}
        onDelete={handleDelete}
        selectedId={selectedTable?.id}
        isReadOnly={!isAdmin}
      />
      
      <div className="flex-1 p-4">
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
                  className="w-full p-2 border rounded"
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
                  className="w-full p-2 border rounded h-24"
                  disabled={!isAdmin}
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium">Reward Items</h3>
                  {isAdmin && (
                    <button
                      onClick={handleAddItem}
                      className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      Add Item
                    </button>
                  )}
                </div>
                
                <div className="border rounded overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chance (%)</th>
                        {isAdmin && (
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedTable.items.length === 0 ? (
                        <tr>
                          <td colSpan={isAdmin ? 3 : 2} className="px-6 py-4 text-center text-sm text-gray-500">
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
                                  className="p-1 border rounded w-full"
                                >
                                  {items.map((i) => (
                                    <option key={i.id} value={i.id}>{i.name}</option>
                                  ))}
                                </select>
                              ) : (
                                <span className="text-sm">{item.item_name}</span>
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
                                  className="p-1 border rounded w-24"
                                />
                              ) : (
                                <span className="text-sm">{item.chance}%</span>
                              )}
                            </td>
                            {isAdmin && (
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <button
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="text-red-600 hover:text-red-800"
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
                  <div className="mt-2 text-sm text-gray-500">
                    Total chance: {selectedTable.items.reduce((sum, item) => sum + item.chance, 0)}%
                    {selectedTable.items.reduce((sum, item) => sum + item.chance, 0) !== 100 && isAdmin && (
                      <span className="ml-2 text-red-500">
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
          <div className="text-gray-500">Select a reward table from the list {isAdmin ? 'or add a new one' : ''}</div>
        )}
      </div>
    </div>
  );
}
