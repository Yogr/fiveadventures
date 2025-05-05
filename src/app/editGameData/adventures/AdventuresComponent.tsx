'use client';

import { useState, useEffect } from 'react';
import ListComponent from '../components/ListComponent';
import SaveButton from '../components/SaveButton';
import { 
  getAdventures, 
  saveAdventure, 
  deleteAdventure, 
  getAreas, 
  saveAdventureDecision, 
  deleteAdventureDecision, 
  saveAdventureOutcome, 
  deleteAdventureOutcome,
  getRewardTables,
  getMonsters
} from '@/app/actions/data-editor';
import Image from 'next/image';
import { ImageSource } from '@/lib/image-source';
import { ChevronDownIcon, ChevronRightIcon, PlusIcon, XCircleIcon } from '@heroicons/react/24/outline';

// Define types based on database schema
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
  decisions?: AdventureDecision[];
};

type AdventureDecision = {
  id: number;
  adventure_id: number;
  description: string;
  requirements: any | null;
  type: string | null;
  icon: string | null;
  stat_check: string | null;
  base_success_rate: number | null;
  mastery: any | null;
  outcomes: AdventureOutcome[];
};

type AdventureOutcome = {
  id: number;
  decision_id: number;
  description: string;
  experience_bonus: number;
  gold_bonus: number;
  reward_table_id: number | null;
  hitpoints_change: number;
  energy_change: number;
  stat_requirements: any | null;
  success_rate_formula: any | null;
  has_combat: boolean;
  monster_ids: number[] | null;
  is_success: boolean;
};

// Component for displaying and editing a single decision
const DecisionComponent = ({ 
  decision, 
  adventureId, 
  onUpdate, 
  onDelete, 
  isAdmin 
}: { 
  decision: AdventureDecision, 
  adventureId: number, 
  onUpdate: (decision: AdventureDecision) => void, 
  onDelete: (id: number) => void, 
  isAdmin: boolean 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localDecision, setLocalDecision] = useState<AdventureDecision>(decision);
  
  useEffect(() => {
    setLocalDecision(decision);
  }, [decision]);
  
  const handleFieldChange = (field: keyof AdventureDecision, value: any) => {
    const updatedDecision = { ...localDecision, [field]: value };
    setLocalDecision(updatedDecision);
    onUpdate(updatedDecision);
  };
  
  const handleAddOutcome = () => {
    // Find the next highest ID for outcome
    let nextOutcomeId = 1;
    for (const outcome of localDecision.outcomes) {
      if (outcome.id >= nextOutcomeId) {
        nextOutcomeId = outcome.id + 1;
      }
    }
    
    const newOutcome: AdventureOutcome = {
      id: nextOutcomeId,
      decision_id: localDecision.id,
      description: 'New outcome description',
      experience_bonus: 10,
      gold_bonus: 5,
      reward_table_id: null,
      hitpoints_change: 0,
      energy_change: 0,
      stat_requirements: null,
      success_rate_formula: null,
      has_combat: false,
      monster_ids: null,
      is_success: true
    };
    
    const updatedOutcomes = [...localDecision.outcomes, newOutcome];
    const updatedDecision = { ...localDecision, outcomes: updatedOutcomes };
    setLocalDecision(updatedDecision);
    onUpdate(updatedDecision);
  };
  
  const handleOutcomeUpdate = (updatedOutcome: AdventureOutcome) => {
    const updatedOutcomes = localDecision.outcomes.map(outcome => 
      outcome.id === updatedOutcome.id ? updatedOutcome : outcome
    );
    
    const updatedDecision = { ...localDecision, outcomes: updatedOutcomes };
    setLocalDecision(updatedDecision);
    onUpdate(updatedDecision);
  };
  
  const handleOutcomeDelete = (outcomeId: number) => {
    const updatedOutcomes = localDecision.outcomes.filter(outcome => outcome.id !== outcomeId);
    const updatedDecision = { ...localDecision, outcomes: updatedOutcomes };
    setLocalDecision(updatedDecision);
    onUpdate(updatedDecision);
  };
  
  return (
    <div className="mt-4 border border-amber-700 rounded-md p-3 bg-amber-950/60">
      <div className="flex items-center justify-between">
        <div 
          className="flex items-center cursor-pointer" 
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronDownIcon className="h-5 w-5 text-amber-400" />
          ) : (
            <ChevronRightIcon className="h-5 w-5 text-amber-400" />
          )}
          <h3 className="text-lg font-medium text-amber-200 ml-2">
            Decision: {localDecision.description.substring(0, 40)}{localDecision.description.length > 40 ? '...' : ''}
          </h3>
        </div>
        
        {isAdmin && (
          <button 
            className="text-red-500 hover:text-red-400"
            onClick={() => onDelete(localDecision.id)}
          >
            <XCircleIcon className="h-5 w-5" />
          </button>
        )}
      </div>
      
      {isExpanded && (
        <div className="mt-3 pl-7">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-amber-300">Description</label>
              <textarea
                value={localDecision.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                className="admin-textarea"
                disabled={!isAdmin}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-amber-300">Type</label>
                <select
                  value={localDecision.type || ''}
                  onChange={(e) => handleFieldChange('type', e.target.value)}
                  className="admin-input w-full"
                  disabled={!isAdmin}
                >
                  <option value="">Select Type</option>
                  <option value="skill">Skill Check</option>
                  <option value="inventory">Inventory Check</option>
                  <option value="dialog">Dialog</option>
                  <option value="combat">Combat</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-amber-300">Icon</label>
                <input
                  type="text"
                  value={localDecision.icon || ''}
                  onChange={(e) => handleFieldChange('icon', e.target.value)}
                  className="admin-input w-full"
                  disabled={!isAdmin}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-amber-300">Stat Check</label>
                <select
                  value={localDecision.stat_check || ''}
                  onChange={(e) => handleFieldChange('stat_check', e.target.value)}
                  className="admin-input w-full"
                  disabled={!isAdmin}
                >
                  <option value="">None</option>
                  <option value="strength">Strength</option>
                  <option value="intelligence">Intelligence</option>
                  <option value="agility">Agility</option>
                  <option value="luck">Luck</option>
                  <option value="wisdom">Wisdom</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-amber-300">Base Success Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={localDecision.base_success_rate || 0}
                  onChange={(e) => handleFieldChange('base_success_rate', parseInt(e.target.value) || 0)}
                  className="admin-input w-full"
                  disabled={!isAdmin}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-amber-300">Requirements (JSON)</label>
              <textarea
                value={localDecision.requirements ? JSON.stringify(localDecision.requirements, null, 2) : ''}
                onChange={(e) => {
                  try {
                    const requirements = e.target.value ? JSON.parse(e.target.value) : null;
                    handleFieldChange('requirements', requirements);
                  } catch (error) {
                    // Invalid JSON - don't update
                  }
                }}
                className="admin-textarea font-mono text-sm"
                disabled={!isAdmin}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-amber-300">Mastery (JSON)</label>
              <textarea
                value={localDecision.mastery ? JSON.stringify(localDecision.mastery, null, 2) : ''}
                onChange={(e) => {
                  try {
                    const mastery = e.target.value ? JSON.parse(e.target.value) : null;
                    handleFieldChange('mastery', mastery);
                  } catch (error) {
                    // Invalid JSON - don't update
                  }
                }}
                className="admin-textarea font-mono text-sm"
                disabled={!isAdmin}
              />
            </div>
            
            {/* Outcomes section */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-md font-medium text-amber-200">Outcomes</h4>
                {isAdmin && (
                  <button
                    onClick={handleAddOutcome}
                    className="flex items-center px-3 py-1 bg-amber-600 text-amber-100 rounded hover:bg-amber-700 text-sm"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add Outcome
                  </button>
                )}
              </div>
              
              {localDecision.outcomes.length === 0 ? (
                <div className="text-amber-400 text-sm italic">No outcomes added yet.</div>
              ) : (
                <div className="space-y-4">
                  {localDecision.outcomes.map(outcome => (
                    <OutcomeComponent
                      key={outcome.id}
                      outcome={outcome}
                      decisionId={localDecision.id}
                      onUpdate={handleOutcomeUpdate}
                      onDelete={handleOutcomeDelete}
                      isAdmin={isAdmin}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Component for displaying and editing a single outcome
const OutcomeComponent = ({ 
  outcome, 
  decisionId, 
  onUpdate, 
  onDelete, 
  isAdmin 
}: { 
  outcome: AdventureOutcome, 
  decisionId: number, 
  onUpdate: (outcome: AdventureOutcome) => void, 
  onDelete: (id: number) => void, 
  isAdmin: boolean 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localOutcome, setLocalOutcome] = useState<AdventureOutcome>(outcome);
  const [rewardTables, setRewardTables] = useState<any[]>([]);
  const [monsters, setMonsters] = useState<any[]>([]);
  
  useEffect(() => {
    setLocalOutcome(outcome);
  }, [outcome]);
  
  useEffect(() => {
    // Load reward tables and monsters for dropdowns
    async function loadData() {
      const rewardTablesResponse = await getRewardTables();
      if (rewardTablesResponse.success && rewardTablesResponse.data) {
        setRewardTables(rewardTablesResponse.data);
      }
      
      const monstersResponse = await getMonsters();
      if (monstersResponse.success && monstersResponse.data) {
        setMonsters(monstersResponse.data);
      }
    }
    
    if (isExpanded) {
      loadData();
    }
  }, [isExpanded]);
  
  const handleFieldChange = (field: keyof AdventureOutcome, value: any) => {
    const updatedOutcome = { ...localOutcome, [field]: value };
    setLocalOutcome(updatedOutcome);
    onUpdate(updatedOutcome);
  };
  
  return (
    <div className="border border-amber-800/60 rounded-md p-3 bg-amber-900/40">
      <div className="flex items-center justify-between">
        <div 
          className="flex items-center cursor-pointer" 
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronDownIcon className="h-4 w-4 text-amber-400" />
          ) : (
            <ChevronRightIcon className="h-4 w-4 text-amber-400" />
          )}
          <div className="ml-2 flex items-center">
            <span className={`mr-2 inline-block w-3 h-3 rounded-full ${localOutcome.is_success ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <h4 className="text-md font-medium text-amber-200">
              {localOutcome.is_success ? 'Success' : 'Failure'}: {localOutcome.description.substring(0, 30)}{localOutcome.description.length > 30 ? '...' : ''}
            </h4>
          </div>
        </div>
        
        {isAdmin && (
          <button 
            className="text-red-500 hover:text-red-400"
            onClick={() => onDelete(localOutcome.id)}
          >
            <XCircleIcon className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {isExpanded && (
        <div className="mt-3 pl-5">
          <div className="space-y-3">
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={localOutcome.is_success}
                onChange={(e) => handleFieldChange('is_success', e.target.checked)}
                className="h-4 w-4 border-amber-300 rounded bg-gray-700 mr-2"
                disabled={!isAdmin}
              />
              <label className="text-sm font-medium text-amber-300">This is a success outcome</label>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-amber-300">Description</label>
              <textarea
                value={localOutcome.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                className="admin-textarea"
                disabled={!isAdmin}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-amber-300">Experience Bonus</label>
                <input
                  type="number"
                  value={localOutcome.experience_bonus}
                  onChange={(e) => handleFieldChange('experience_bonus', parseInt(e.target.value) || 0)}
                  className="admin-input w-full"
                  disabled={!isAdmin}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-amber-300">Gold Bonus</label>
                <input
                  type="number"
                  value={localOutcome.gold_bonus}
                  onChange={(e) => handleFieldChange('gold_bonus', parseInt(e.target.value) || 0)}
                  className="admin-input w-full"
                  disabled={!isAdmin}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-amber-300">Hitpoints Change</label>
                <input
                  type="number"
                  value={localOutcome.hitpoints_change}
                  onChange={(e) => handleFieldChange('hitpoints_change', parseInt(e.target.value) || 0)}
                  className="admin-input w-full"
                  disabled={!isAdmin}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-amber-300">Energy Change</label>
                <input
                  type="number"
                  value={localOutcome.energy_change}
                  onChange={(e) => handleFieldChange('energy_change', parseInt(e.target.value) || 0)}
                  className="admin-input w-full"
                  disabled={!isAdmin}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-amber-300">Reward Table</label>
              <select
                value={localOutcome.reward_table_id || ''}
                onChange={(e) => handleFieldChange('reward_table_id', e.target.value ? parseInt(e.target.value) : null)}
                className="admin-input w-full"
                disabled={!isAdmin}
              >
                <option value="">None</option>
                {rewardTables.map(table => (
                  <option key={table.id} value={table.id}>{table.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={localOutcome.has_combat}
                onChange={(e) => handleFieldChange('has_combat', e.target.checked)}
                className="h-4 w-4 border-amber-300 rounded bg-gray-700 mr-2"
                disabled={!isAdmin}
              />
              <label className="text-sm font-medium text-amber-300">This outcome includes combat</label>
            </div>
            
            {localOutcome.has_combat && (
              <div>
                <label className="block text-sm font-medium mb-1 text-amber-300">Monster IDs (comma separated)</label>
                <input
                  type="text"
                  value={localOutcome.monster_ids?.join(', ') || ''}
                  onChange={(e) => {
                    const monsterIds = e.target.value
                      .split(',')
                      .map(id => parseInt(id.trim()))
                      .filter(id => !isNaN(id));
                    
                    handleFieldChange('monster_ids', monsterIds.length > 0 ? monsterIds : null);
                  }}
                  className="admin-input w-full"
                  disabled={!isAdmin}
                />
                <div className="text-xs text-amber-400 mt-1">
                  Available monsters: {monsters.map(m => `${m.id} (${m.name})`).join(', ')}
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium mb-1 text-amber-300">Stat Requirements (JSON)</label>
              <textarea
                value={localOutcome.stat_requirements ? JSON.stringify(localOutcome.stat_requirements, null, 2) : ''}
                onChange={(e) => {
                  try {
                    const statRequirements = e.target.value ? JSON.parse(e.target.value) : null;
                    handleFieldChange('stat_requirements', statRequirements);
                  } catch (error) {
                    // Invalid JSON - don't update
                  }
                }}
                className="admin-textarea font-mono text-sm"
                disabled={!isAdmin}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-amber-300">Success Rate Formula (JSON)</label>
              <textarea
                value={localOutcome.success_rate_formula ? JSON.stringify(localOutcome.success_rate_formula, null, 2) : ''}
                onChange={(e) => {
                  try {
                    const formula = e.target.value ? JSON.parse(e.target.value) : null;
                    handleFieldChange('success_rate_formula', formula);
                  } catch (error) {
                    // Invalid JSON - don't update
                  }
                }}
                className="admin-textarea font-mono text-sm"
                disabled={!isAdmin}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function AdventuresComponent({ isAdmin }: { isAdmin: boolean }) {
  const [adventures, setAdventures] = useState<Adventure[]>([]);
  const [selectedAdventure, setSelectedAdventure] = useState<Adventure | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [areas, setAreas] = useState<any[]>([]);
  
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // Load adventures
        const adventuresResponse = await getAdventures();
        if (adventuresResponse.success && adventuresResponse.data) {
          setAdventures(adventuresResponse.data);
        } else {
          console.error('Failed to load adventures:', adventuresResponse.error);
        }
        
        // Load areas for area_ids selection
        const areasResponse = await getAreas();
        if (areasResponse.success && areasResponse.data) {
          setAreas(areasResponse.data);
        } else {
          console.error('Failed to load areas:', areasResponse.error);
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
    if (!selectedAdventure) return;
    
    try {
      // First save the adventure record
      const adventureResponse = await saveAdventure({
        id: selectedAdventure.id,
        title: selectedAdventure.title,
        description: selectedAdventure.description,
        min_experience: selectedAdventure.min_experience,
        min_gold: selectedAdventure.min_gold,
        is_violent: selectedAdventure.is_violent,
        has_combat: selectedAdventure.has_combat,
        area_ids: selectedAdventure.area_ids,
        image_url: selectedAdventure.image_url
      });
      
      if (!adventureResponse.success) {
        alert(`Error saving adventure: ${adventureResponse.error}`);
        return;
      }
      
      // Then save all decisions
      if (selectedAdventure.decisions && selectedAdventure.decisions.length > 0) {
        for (const decision of selectedAdventure.decisions) {
          const decisionResponse = await saveAdventureDecision(decision);
          
          if (!decisionResponse.success) {
            alert(`Error saving decision: ${decisionResponse.error}`);
            continue;
          }
          
          // Save all outcomes for this decision
          if (decision.outcomes && decision.outcomes.length > 0) {
            for (const outcome of decision.outcomes) {
              const outcomeResponse = await saveAdventureOutcome(outcome);
              
              if (!outcomeResponse.success) {
                alert(`Error saving outcome: ${outcomeResponse.error}`);
              }
            }
          }
        }
      }
      
      // Refresh the adventures list
      const refreshResponse = await getAdventures();
      if (refreshResponse.success && refreshResponse.data) {
        setAdventures(refreshResponse.data);
        
        // Find and select the updated adventure
        const updatedAdventure = refreshResponse.data.find(adv => adv.id === selectedAdventure.id);
        if (updatedAdventure) {
          setSelectedAdventure(updatedAdventure);
        }
      }
      
      alert('Adventure saved successfully!');
    } catch (error) {
      console.error('Error in save operation:', error);
      alert('An unexpected error occurred while saving');
    }
  };
  
  const handleAdd = () => {
    // Find next highest ID
    let nextHighestId = 1;
    for (const adventure of adventures) {
      if (adventure.id >= nextHighestId) {
        nextHighestId = adventure.id + 1;
      }
    }
    
    // Add new adventure
    const newAdventure: Adventure = {
      id: nextHighestId,
      title: 'New Adventure',
      description: 'Description of new adventure',
      min_experience: 10,
      min_gold: 5,
      is_violent: false,
      has_combat: false,
      area_ids: [],
      image_url: null,
      decisions: []
    };
    
    setAdventures([...adventures, newAdventure]);
    setSelectedAdventure(newAdventure);
  };
  
  const handleDelete = async (id: number) => {
    try {
      const response = await deleteAdventure(id);
      
      if (!response.success) {
        alert(`Error deleting adventure: ${response.error}`);
        return;
      }
      
      // Update UI
      setAdventures(adventures.filter(adventure => adventure.id !== id));
      if (selectedAdventure && selectedAdventure.id === id) {
        setSelectedAdventure(null);
      }
    } catch (error) {
      console.error('Error deleting adventure:', error);
      alert('An unexpected error occurred while deleting');
    }
  };
  
  const handleAddDecision = () => {
    if (!selectedAdventure) return;
    
    // Find next highest decision ID
    let nextDecisionId = 1;
    if (selectedAdventure.decisions) {
      for (const decision of selectedAdventure.decisions) {
        if (decision.id >= nextDecisionId) {
          nextDecisionId = decision.id + 1;
        }
      }
    }
    
    // Create new decision
    const newDecision: AdventureDecision = {
      id: nextDecisionId,
      adventure_id: selectedAdventure.id,
      description: 'New decision description',
      requirements: null,
      type: null,
      icon: null,
      stat_check: null,
      base_success_rate: 50,
      mastery: null,
      outcomes: []
    };
    
    // Add to selected adventure
    const updatedDecisions = [...(selectedAdventure.decisions || []), newDecision];
    const updatedAdventure = { ...selectedAdventure, decisions: updatedDecisions };
    
    // Update state
    setSelectedAdventure(updatedAdventure);
    
    // Update adventures list
    setAdventures(adventures.map(adventure => 
      adventure.id === updatedAdventure.id ? updatedAdventure : adventure
    ));
  };
  
  const handleDecisionUpdate = (updatedDecision: AdventureDecision) => {
    if (!selectedAdventure || !selectedAdventure.decisions) return;
    
    const updatedDecisions = selectedAdventure.decisions.map(decision => 
      decision.id === updatedDecision.id ? updatedDecision : decision
    );
    
    const updatedAdventure = { ...selectedAdventure, decisions: updatedDecisions };
    setSelectedAdventure(updatedAdventure);
    
    // Update adventures list
    setAdventures(adventures.map(adventure => 
      adventure.id === updatedAdventure.id ? updatedAdventure : adventure
    ));
  };
  
  const handleDecisionDelete = async (decisionId: number) => {
    if (!selectedAdventure || !selectedAdventure.decisions) return;
    
    try {
      // Check if it's a temporary ID (not yet saved to DB)
      const isTemporary = selectedAdventure.decisions.find(d => d.id === decisionId)?.outcomes?.length === 0;
      
      if (!isTemporary) {
        // If it's not temporary, delete from DB
        const response = await deleteAdventureDecision(decisionId);
        
        if (!response.success) {
          alert(`Error deleting decision: ${response.error}`);
          return;
        }
      }
      
      // Remove from selected adventure
      const updatedDecisions = selectedAdventure.decisions.filter(decision => decision.id !== decisionId);
      const updatedAdventure = { ...selectedAdventure, decisions: updatedDecisions };
      
      // Update state
      setSelectedAdventure(updatedAdventure);
      
      // Update adventures list
      setAdventures(adventures.map(adventure => 
        adventure.id === updatedAdventure.id ? updatedAdventure : adventure
      ));
    } catch (error) {
      console.error('Error deleting decision:', error);
      alert('An unexpected error occurred while deleting the decision');
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
      
      <div className="flex-1 p-4 text-amber-100 overflow-y-auto max-h-screen">
        {selectedAdventure ? (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">{selectedAdventure.title}</h2>
            
            <div className="space-y-3">
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
                <div className="text-xs text-amber-400 mt-1">
                  Available areas: {areas.map(area => `${area.id} (${area.name})`).join(', ')}
                </div>
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
                      src={ImageSource.getAdventureImagePath({ image_url: selectedAdventure.image_url })}
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
              
              {/* Decisions section */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium">Adventure Decisions</h3>
                  {isAdmin && (
                    <button
                      onClick={handleAddDecision}
                      className="flex items-center px-3 py-1 bg-amber-600 text-amber-100 rounded hover:bg-amber-700 text-sm"
                    >
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Add Decision
                    </button>
                  )}
                </div>
                
                {selectedAdventure.decisions && selectedAdventure.decisions.length > 0 ? (
                  <div className="mt-4">
                    {selectedAdventure.decisions.map(decision => (
                      <DecisionComponent
                        key={decision.id}
                        decision={decision}
                        adventureId={selectedAdventure.id}
                        onUpdate={handleDecisionUpdate}
                        onDelete={handleDecisionDelete}
                        isAdmin={isAdmin}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-amber-400 text-sm italic">No decisions added yet.</div>
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
