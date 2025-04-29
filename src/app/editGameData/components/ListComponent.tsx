'use client';

import React from 'react';

export type Item = {
  id: number | string;
  name: string;
  [key: string]: any; // Allow for additional properties
};

type ListComponentProps = {
  items: Item[];
  onSelect: (item: Item) => void;
  onAdd?: () => void;
  onDelete?: (id: number | string) => void;
  selectedId?: number | string | null;
  isReadOnly: boolean;
};

export default function ListComponent({
  items,
  onSelect,
  onAdd,
  onDelete,
  selectedId,
  isReadOnly
}: ListComponentProps) {
  return (
    <div className="w-64 border-r pr-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-gray-700">Items ({items.length})</h3>
        {!isReadOnly && onAdd && (
          <button
            onClick={onAdd}
            className="bg-blue-600 text-white text-sm px-2 py-1 rounded hover:bg-blue-700 transition-colors"
            aria-label="Add new item"
          >
            Add New
          </button>
        )}
      </div>
      
      <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
        {items.length === 0 ? (
          <div className="text-gray-500 text-sm">No items yet.</div>
        ) : (
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.id} className="relative">
                <button
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    selectedId === item.id
                      ? 'bg-blue-100 text-blue-800 font-medium'
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => onSelect(item)}
                >
                  {item.name}
                </button>
                
                {!isReadOnly && onDelete && selectedId === item.id && (
                  <button
                    onClick={() => onDelete(item.id)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-500 hover:text-red-700 transition-colors"
                    aria-label={`Delete ${item.name}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
