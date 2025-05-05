'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import LeaderboardTable from '@/components/leaderboard/leaderboard-table';
import LeaderboardTabs from '@/components/leaderboard/leaderboard-tabs';
import type { 
  LeaderboardCategory, 
  LeaderboardSubcategory 
} from '@/components/leaderboard/leaderboard-tabs';

// leaderboard Server Actions
import {
  fetchLevelLeaderboard,
  fetchLevelLeaderboardByClass,
  fetchWealthLeaderboard,
  fetchPowerLeaderboard,
  fetchPowerLeaderboardByClass,
  fetchAdventuresLeaderboard,
  fetchAdventuresLeaderboardByClass,
  fetchBossesSlainLeaderboard,
  fetchHighestBossDamageLeaderboard
} from '@/app/actions/leaderboard-server';
import type { PaginatedLeaderboard } from '@/app/actions/leaderboard';

export default function LeaderboardContent({ 
  characterId 
}: { 
  characterId?: string 
}) {
  const searchParams = useSearchParams();
  
  const [category, setCategory] = useState<LeaderboardCategory>(
    (searchParams.get('category') as LeaderboardCategory) || 'level'
  );
  
  const [subcategory, setSubcategory] = useState<LeaderboardSubcategory>(
    (searchParams.get('subcategory') as LeaderboardSubcategory) || 'overall'
  );
  
  const [page, setPage] = useState(
    parseInt(searchParams.get('page') || '1', 10)
  );
  
  const [loading, setLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState<PaginatedLeaderboard | null>(null);
  
  useEffect(() => {
    async function fetchLeaderboardData() {
      setLoading(true);
      try {
        let response;
        
        // Select the appropriate leaderboard endpoint based on category and subcategory
        switch (category) {
          case 'level':
            if (subcategory === 'overall') {
              response = await fetchLevelLeaderboard(page, 10, characterId);
            } else {
              response = await fetchLevelLeaderboardByClass(
                subcategory, 
                page, 
                10, 
                characterId
              );
            }
            break;
            
          case 'wealth':
            response = await fetchWealthLeaderboard(page, 10, characterId);
            break;
            
          case 'power':
            if (subcategory === 'overall') {
              response = await fetchPowerLeaderboard(page, 10, characterId);
            } else {
              response = await fetchPowerLeaderboardByClass(
                subcategory, 
                page, 
                10, 
                characterId
              );
            }
            break;
            
          case 'adventures':
            if (subcategory === 'overall') {
              response = await fetchAdventuresLeaderboard(page, 10, characterId);
            } else {
              response = await fetchAdventuresLeaderboardByClass(
                subcategory, 
                page, 
                10, 
                characterId
              );
            }
            break;
            
          case 'bosses_slain':
            response = await fetchBossesSlainLeaderboard(page, 10, characterId);
            break;
            
          case 'boss_damage':
            response = await fetchHighestBossDamageLeaderboard(page, 10, characterId);
            break;
        }
        
        if (response.success && response.data) {
          setLeaderboardData(response.data);
        } else {
          console.error('Failed to fetch leaderboard data:', response.error);
          setLeaderboardData({
            entries: [],
            currentPage: 1,
            totalPages: 0,
            totalEntries: 0
          });
        }
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        setLeaderboardData({
          entries: [],
          currentPage: 1,
          totalPages: 0,
          totalEntries: 0
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchLeaderboardData();
  }, [category, subcategory, page, characterId]);
  
  // Generate table title based on current category and subcategory
  function getTableTitle() {
    let baseTitle = '';
    
    switch (category) {
      case 'level':
        baseTitle = 'Highest Level';
        break;
      case 'wealth':
        return 'Wealthiest Adventurers';
      case 'power':
        baseTitle = 'Most Powerful';
        break;
      case 'adventures':
        baseTitle = 'Most Adventures Completed';
        break;
      case 'bosses_slain':
        return 'Most World Bosses Slain';
      case 'boss_damage':
        return 'Highest Boss Damage';
      default:
        baseTitle = 'Top Adventurers';
    }
    
    // Only show class subtitle for categories that support class filtering
    if (subcategory === 'overall' || 
        !['level', 'power', 'adventures'].includes(category as string)) {
      return baseTitle;
    }
    
    return `${baseTitle} - ${subcategory}`;
  }
  
  // Get value label based on current category
  function getValueLabel() {
    switch (category) {
      case 'level':
        return 'Level';
      case 'wealth':
        return 'Gold';
      case 'power':
        return 'Power';
      case 'adventures':
        return 'Adventures';
      case 'bosses_slain':
        return 'Bosses Slain';
      case 'boss_damage':
        return 'Damage';
      default:
        return 'Value';
    }
  }
  
  // Format value based on category
  function formatValue(value: number) {
    switch (category) {
      case 'wealth':
        return `${value.toLocaleString()} gold`;
      case 'boss_damage':
        return `${value.toLocaleString()} damage`;
      default:
        return value.toLocaleString();
    }
  }
  
  // Handle category change
  function handleCategoryChange(newCategory: LeaderboardCategory) {
    setCategory(newCategory);
    // Reset to overall if switching to a category that doesn't support classes
    if (newCategory === 'wealth' || newCategory === 'bosses_slain' || newCategory === 'boss_damage') {
      setSubcategory('overall');
    }
    // Reset page when category changes
    setPage(1);
  }
  
  return (
    <div>
      <LeaderboardTabs
        currentCategory={category}
        currentSubcategory={subcategory}
        onCategoryChange={handleCategoryChange}
        onSubcategoryChange={(newSubcategory) => {
          setSubcategory(newSubcategory);
          setPage(1); // Reset page when subcategory changes
        }}
      />
      
      <div className="mt-3">
        <LeaderboardTable
          entries={leaderboardData?.entries || []}
          title={getTableTitle()}
          loading={loading}
          pagination={{
            currentPage: leaderboardData?.currentPage || 1,
            totalPages: leaderboardData?.totalPages || 1,
            onPageChange: setPage
          }}
          playerRank={leaderboardData?.playerRank || undefined}
          valueLabel={getValueLabel()}
          labelFormatter={formatValue}
          emptyMessage={
            loading 
              ? 'Loading leaderboard data...' 
              : 'No entries found for this category'
          }
        />
      </div>
    </div>
  );
}
