const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Make sure .env.local file exists with proper values.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to delete all rows from a table
async function clearTable(tableName) {
  console.log(`Clearing all rows from ${tableName}...`);
  const { error } = await supabase
    .from(tableName)
    .delete()
    .neq('id', 0); // Delete all rows
  
  if (error) {
    console.error(`Error clearing table ${tableName}:`, error);
    return false;
  }
  
  console.log(`Table ${tableName} cleared successfully.`);
  return true;
}

// Helper function to get next ID for a table
async function getNextId(tableName) {
  // After clearing the table, we always start with ID 1
  return 1;
}

// Helper function to read JSON data
const readJsonFile = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
};

// Seed items
async function seedItems(filePath) {
  console.log('Seeding items...');
  
  // Clear the table first
  await clearTable('items');
  
  const items = readJsonFile(filePath);
  
  if (!items || !Array.isArray(items)) {
    console.error('Invalid items data format. Expected an array of items.');
    return;
  }
  
  let nextId = await getNextId('items');
  
  for (const item of items) {
    // Generate ID if not provided
    if (!item.id) {
      item.id = nextId++;
    }
    
    // Add created_at if not provided
    if (!item.created_at) {
      item.created_at = new Date().toISOString();
    }
    
    // Insert item
    const { error } = await supabase
      .from('items')
      .insert(item);
    
    if (error) {
      console.error(`Error inserting item ${item.name}:`, error);
    } else {
      console.log(`Item inserted: ${item.name} with ID ${item.id}`);
    }
  }
  
  console.log('Items seeding completed.');
}

// Seed adventures
async function seedAdventures(filePath) {
  console.log('Seeding adventures...');
  
  // Clear the tables first
  await clearTable('adventure_outcomes');
  await clearTable('adventure_decisions');
  await clearTable('adventures');
  
  const adventures = readJsonFile(filePath);
  
  if (!adventures || !Array.isArray(adventures)) {
    console.error('Invalid adventures data format. Expected an array of adventures.');
    return;
  }
  
  let nextAdventureId = await getNextId('adventures');
  
  for (const adventure of adventures) {
    // Generate ID if not provided
    if (!adventure.id) {
      adventure.id = nextAdventureId++;
    }
    
    // Add created_at if not provided
    if (!adventure.created_at) {
      adventure.created_at = new Date().toISOString();
    }
    
    // Extract decisions and outcomes
    const { decisions, ...adventureData } = adventure;
    
    // Insert adventure
    const { error: adventureError } = await supabase
      .from('adventures')
      .insert(adventureData);
    
    if (adventureError) {
      console.error(`Error inserting adventure ${adventure.title}:`, adventureError);
      continue;
    }
    
    console.log(`Adventure inserted: ${adventure.title} with ID ${adventure.id}`);
    
    // Insert decisions and outcomes
    if (decisions && Array.isArray(decisions)) {
      // Reset decision ID counter for each adventure
      let decisionId = 1;
      
      for (const decision of decisions) {
        // Create a new object for the decision
        const decisionData = {
          id: decisionId, // Use a counter that resets for each adventure
          adventure_id: adventure.id,
          description: decision.description,
          requirements: decision.requirements,
          created_at: decision.created_at || new Date().toISOString()
        };
        
        // Insert decision
        const { error: decisionError } = await supabase
          .from('adventure_decisions')
          .insert(decisionData);
        
        if (decisionError) {
          console.error(`Error inserting decision for adventure ${adventure.title}:`, decisionError);
          continue;
        }
        
        console.log(`Decision inserted for adventure ${adventure.title}: ${decisionData.description} with ID ${decisionData.id}`);
        
        // Insert outcomes
        const outcomes = decision.outcomes;
        if (outcomes && Array.isArray(outcomes)) {
          // Reset outcome ID counter for each decision
          let outcomeId = 1;
          
          for (const outcome of outcomes) {
            // Create a new object for the outcome
            const outcomeData = {
              id: outcomeId++, // Use a counter that resets for each decision
              decision_id: decisionData.id,
              adventure_id: adventure.id, // Include the adventure_id for the foreign key reference
              description: outcome.description,
              experience_bonus: outcome.experience_bonus || 0,
              gold_bonus: outcome.gold_bonus || 0,
              hitpoints_change: outcome.hitpoints_change || 0,
              energy_change: outcome.energy_change || 0,
              stat_requirements: outcome.stat_requirements,
              success_rate_formula: outcome.success_rate_formula,
              has_combat: outcome.has_combat || false,
              monster_ids: outcome.monster_ids,
              created_at: outcome.created_at || new Date().toISOString()
            };
            
            // Convert item_reward_id to reward_table_id if needed
            if (outcome.item_reward_id !== undefined && outcome.reward_table_id === undefined) {
              outcomeData.reward_table_id = outcome.item_reward_id;
            } else if (outcome.reward_table_id !== undefined) {
              outcomeData.reward_table_id = outcome.reward_table_id;
            }
            
            // Insert outcome
            const { error: outcomeError } = await supabase
              .from('adventure_outcomes')
              .insert(outcomeData);
            
            if (outcomeError) {
              console.error(`Error inserting outcome for decision ${decisionData.description}:`, outcomeError);
              console.error('Outcome data:', outcomeData);
              console.error('Error details:', outcomeError);
              continue;
            }
            
            console.log(`Outcome inserted for decision ${decisionData.description}: ${outcomeData.description.substring(0, 30)}... with ID ${outcomeData.id}`);
          }
        }
        
        // Increment decision ID for the next decision
        decisionId++;
      }
    }
  }
  
  console.log('Adventures seeding completed.');
}

// Seed world boss
async function seedWorldBoss(filePath) {
  console.log('Seeding world boss...');
  
  // Clear the table first
  await clearTable('world_boss');
  
  const bosses = readJsonFile(filePath);
  
  if (!bosses || !Array.isArray(bosses)) {
    console.error('Invalid world boss data format. Expected an array of bosses.');
    return;
  }
  
  let nextBossId = await getNextId('world_boss');
  
  for (const boss of bosses) {
    // Generate ID if not provided
    if (!boss.id) {
      boss.id = nextBossId++;
    }
    
    // Add created_at if not provided
    if (!boss.created_at) {
      boss.created_at = new Date().toISOString();
    }
    
    // Insert boss
    const { error } = await supabase
      .from('world_boss')
      .insert(boss);
    
    if (error) {
      console.error(`Error inserting world boss ${boss.name}:`, error);
    } else {
      console.log(`World boss inserted: ${boss.name} with ID ${boss.id}`);
    }
  }
  
  console.log('World boss seeding completed.');
}

// Seed monsters
async function seedMonsters(filePath) {
  console.log('Seeding monsters...');
  
  // Clear the table first
  await clearTable('monsters');
  
  const monsters = readJsonFile(filePath);
  
  if (!monsters || !Array.isArray(monsters)) {
    console.error('Invalid monsters data format. Expected an array of monsters.');
    return;
  }
  
  let nextMonsterId = await getNextId('monsters');
  
  for (const monster of monsters) {
    // Generate ID if not provided
    if (!monster.id) {
      monster.id = nextMonsterId++;
    }
    
    // Add created_at if not provided
    if (!monster.created_at) {
      monster.created_at = new Date().toISOString();
    }
    
    // Insert monster
    const { error } = await supabase
      .from('monsters')
      .insert(monster);
    
    if (error) {
      console.error(`Error inserting monster ${monster.name}:`, error);
    } else {
      console.log(`Monster inserted: ${monster.name} with ID ${monster.id}`);
    }
  }
  
  console.log('Monsters seeding completed.');
}

// Seed reward tables
async function seedRewardTables(filePath) {
  console.log('Seeding reward tables...');
  
  // Clear the tables first
  await clearTable('reward_items');
  await clearTable('reward_tables');
  
  const rewardTables = readJsonFile(filePath);
  
  if (!rewardTables || !Array.isArray(rewardTables)) {
    console.error('Invalid reward tables data format. Expected an array of reward tables.');
    return;
  }
  
  let nextRewardTableId = await getNextId('reward_tables');
  
  for (const rewardTable of rewardTables) {
    // Generate ID if not provided
    if (!rewardTable.id) {
      rewardTable.id = nextRewardTableId++;
    }
    
    // Add created_at if not provided
    if (!rewardTable.created_at) {
      rewardTable.created_at = new Date().toISOString();
    }
    
    // Extract reward items
    const { items, ...rewardTableData } = rewardTable;
    
    // Insert reward table
    const { error: tableError } = await supabase
      .from('reward_tables')
      .insert(rewardTableData);
    
    if (tableError) {
      console.error(`Error inserting reward table ${rewardTable.name}:`, tableError);
      continue;
    }
    
    console.log(`Reward table inserted: ${rewardTable.name} with ID ${rewardTable.id}`);
    
    // Insert reward items
    if (items && Array.isArray(items)) {
      // Reset reward item ID counter for each reward table
      let rewardItemId = 1;
      
      for (const item of items) {
        // Create a new object for the reward item
        const rewardItem = {
          id: rewardItemId++, // Use a counter that resets for each reward table
          reward_table_id: rewardTable.id,
          item_id: item.item_id,
          chance: item.chance,
          created_at: item.created_at || new Date().toISOString()
        };
        
        // Insert reward item
        const { error: itemError } = await supabase
          .from('reward_items')
          .insert(rewardItem);
        
        if (itemError) {
          console.error(`Error inserting reward item for table ${rewardTable.name}:`, itemError);
          continue;
        }
        
        console.log(`Reward item inserted for table ${rewardTable.name}: Item ID ${rewardItem.item_id} with ID ${rewardItem.id}`);
      }
    }
  }
  
  console.log('Reward tables seeding completed.');
}

// Seed skills
async function seedSkills(filePath) {
  console.log('Seeding skills...');
  
  // Clear the table first
  await clearTable('skills');
  
  const skills = readJsonFile(filePath);
  
  if (!skills || !Array.isArray(skills)) {
    console.error('Invalid skills data format. Expected an array of skills.');
    return;
  }
  
  let nextSkillId = await getNextId('skills');
  
  for (const skill of skills) {
    // Generate ID if not provided
    if (!skill.id) {
      skill.id = nextSkillId++;
    }
    
    // Add created_at if not provided
    if (!skill.created_at) {
      skill.created_at = new Date().toISOString();
    }
    
    // Insert skill
    const { error } = await supabase
      .from('skills')
      .insert(skill);
    
    if (error) {
      console.error(`Error inserting skill ${skill.name}:`, error);
    } else {
      console.log(`Skill inserted: ${skill.name} with ID ${skill.id}`);
    }
  }
  
  console.log('Skills seeding completed.');
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
Usage: node seed-data.js <command> <file>

Commands:
  items <file>         - Seed items from JSON file
  adventures <file>    - Seed adventures from JSON file
  worldboss <file>     - Seed world boss from JSON file
  monsters <file>      - Seed monsters from JSON file
  rewardtables <file>  - Seed reward tables from JSON file
  skills <file>        - Seed skills from JSON file
  all <directory>      - Seed all data from directory (looks for items.json, adventures.json, worldboss.json, monsters.json, rewardtables.json, skills.json)

Examples:
  node seed-data.js items ./data/items.json
  node seed-data.js adventures ./data/adventures.json
  node seed-data.js worldboss ./data/worldboss.json
  node seed-data.js monsters ./data/monsters.json
  node seed-data.js rewardtables ./data/rewardtables.json
  node seed-data.js skills ./data/skills.json
  node seed-data.js all ./data
    `);
    return;
  }
  
  const command = args[0];
  const filePath = args[1];
  
  if (!filePath) {
    console.error('Missing file path.');
    return;
  }
  
  try {
    switch (command) {
      case 'items':
        await seedItems(filePath);
        break;
      case 'adventures':
        await seedAdventures(filePath);
        break;
      case 'worldboss':
        await seedWorldBoss(filePath);
        break;
      case 'monsters':
        await seedMonsters(filePath);
        break;
      case 'rewardtables':
        await seedRewardTables(filePath);
        break;
      case 'skills':
        await seedSkills(filePath);
        break;
      case 'all':
        const directory = filePath;
        // Seed in the correct order to avoid foreign key constraint violations
        await seedItems(path.join(directory, 'items.json'));
        await seedMonsters(path.join(directory, 'monsters.json'));
        await seedRewardTables(path.join(directory, 'rewardtables.json'));
        await seedSkills(path.join(directory, 'skills.json'));
        await seedAdventures(path.join(directory, 'adventures.json'));
        await seedWorldBoss(path.join(directory, 'worldboss.json'));
        break;
      default:
        console.error(`Unknown command: ${command}`);
        break;
    }
  } catch (error) {
    console.error('Error during seeding:', error);
  }
}

main();
