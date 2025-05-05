'use client';

import { useState } from 'react';
import type { CharacterClass } from '@/lib/types';
import { formatNumber } from '@/lib/utils';

export type LeaderboardItem = {
  rank: number;
  id: string;
  name: string;
  class: CharacterClass;
  value: number;
};

interface LeaderboardPagination {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

interface LeaderboardTableProps {
  entries: LeaderboardItem[];
  labelFormatter?: (value: number) => string;
  title: string;
  loading: boolean;
  pagination: LeaderboardPagination;
  emptyMessage?: string;
  playerRank?: number | null;
  valueLabel?: string;
}

export default function LeaderboardTable({
  entries,
  labelFormatter = (value) => formatNumber(value),
  title,
  loading,
  pagination,
  emptyMessage = "No entries found",
  playerRank,
  valueLabel = "Value"
}: LeaderboardTableProps) {
  const { currentPage, totalPages, onPageChange } = pagination;
  
  const classColors: Record<CharacterClass, string> = {
    'Warrior': 'text-red-400',
    'Thief': 'text-gray-400',
    'Wizard': 'text-blue-400',
    'Ranger': 'text-green-400',
    'Cleric': 'text-yellow-400'
  };
  
  return (
    <div className="bg-gray-800 border border-amber-800 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-amber-800 bg-amber-900/30 flex justify-between items-center">
        <h3 className="text-xl font-semibold text-amber-300">{title}</h3>
        {playerRank && (
          <div className="text-sm text-amber-200">
            Your Rank: <span className="font-bold text-amber-400">{playerRank}</span>
          </div>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800/60">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-amber-200 uppercase tracking-wider w-16">
                Rank
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-amber-200 uppercase tracking-wider">
                Adventurer
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-amber-200 uppercase tracking-wider">
                Class
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-amber-200 uppercase tracking-wider">
                {valueLabel}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {loading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} className="bg-gray-800/30 animate-pulse">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="h-4 bg-gray-600 rounded w-8"></div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="h-4 bg-gray-600 rounded w-32"></div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="h-4 bg-gray-600 rounded w-20"></div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="h-4 bg-gray-600 rounded w-16 ml-auto"></div>
                  </td>
                </tr>
              ))
            ) : entries.length > 0 ? (
              entries.map((entry) => (
                <tr 
                  key={entry.id} 
                  className={`hover:bg-amber-900/20 transition-colors duration-150 ${
                    playerRank === entry.rank ? 'bg-amber-900/30' : 'bg-transparent'
                  }`}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`${entry.rank <= 3 ? 'text-amber-400 font-bold' : 'text-gray-300'}`}>
                        {entry.rank}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{entry.name}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`text-sm ${classColors[entry.class]}`}>
                      {entry.class}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-amber-300">
                      {labelFormatter(entry.value)}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-amber-800 bg-amber-900/30 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md 
                ${currentPage === 1 
                  ? 'text-gray-500 bg-gray-700 cursor-not-allowed' 
                  : 'text-amber-300 bg-gray-800 hover:bg-amber-900'}`}
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md 
                ${currentPage === totalPages 
                  ? 'text-gray-500 bg-gray-700 cursor-not-allowed' 
                  : 'text-amber-300 bg-gray-800 hover:bg-amber-900'}`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-300">
                Page <span className="font-medium text-amber-300">{currentPage}</span> of{' '}
                <span className="font-medium text-amber-300">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md 
                    ${currentPage === 1 
                      ? 'text-gray-500 bg-gray-700 cursor-not-allowed' 
                      : 'text-amber-300 bg-gray-800 hover:bg-amber-900'}`}
                >
                  <span>←</span>
                </button>
                
                {/* Page number buttons */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Show pages around the current page
                  let pageNum;
                  
                  if (totalPages <= 5) {
                    // If 5 or fewer pages, show all
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    // Near the start
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    // Near the end
                    pageNum = totalPages - 4 + i;
                  } else {
                    // In the middle
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-medium 
                        ${currentPage === pageNum 
                          ? 'z-10 bg-amber-900 text-amber-200 border border-amber-500' 
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}
                        ${i === 0 ? '' : 'border-l border-gray-700'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md 
                    ${currentPage === totalPages 
                      ? 'text-gray-500 bg-gray-700 cursor-not-allowed' 
                      : 'text-amber-300 bg-gray-800 hover:bg-amber-900'}`}
                >
                  <span>→</span>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
