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
  
  // For tables with UUID primary keys, we need a different approach
  const uuidTables = ['character_adventures', 'combat', 'combat_turns', 'character_inventory', 'character_equipment'];
  
  if (uuidTables.includes(tableName)) {
    // For UUID tables, just delete all rows without a condition
    const { error } = await supabase
      .from(tableName)
      .delete()
      .gte('id', '00000000-0000-0000-0000-000000000000'); // Match all UUIDs
    
    if (error) {
      console.error(`Error clearing table ${tableName}:`, error);
      return false;
    }
  } else {
    // For numeric ID tables, use the original approach
    const { error } = await supabase
      .from(tableName)
      .delete()
      .neq('id', 0); // Delete all rows
    
    if (error) {
      console.error(`Error clearing table ${tableName}:`, error);
      return false;
    }
  }
  
  console.log(`Table ${tableName} cleared successfully.`);
  return true;
}

// Helper function to clear tables in the correct order
async function clearTables(tables) {
  for (const table of tables) {
    await clearTable(table);
  }
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

// Helper function to get all JSON files in a directory and subdirectories
const findAllJsonFiles = (basePath, pattern) => {
  try {
    return require('glob').sync(path.join(basePath, pattern));
  } catch (error) {
    console.error(`Error finding JSON files: ${error}`);
    return [];
  }
};

// Function to clear all tables in the correct order
async function clearAllTables() {
  console.log('Clearing all tables...');
  
  // Clear tables in the correct order to respect foreign key constraints
  // First clear tables with UUID primary keys and those with foreign key dependencies
  await clearTables([
    'character_adventures',
    'combat_turns', 
    'combat', 
    'character_inventory', 
    'character_equipment'
  ]);
  
  // Special handling for character_boss_progress due to UUID format
  console.log(`Clearing all rows from character_boss_progress...`);
  const { error: bossProgressError } = await supabase
    .from('character_boss_progress')
    .delete()
    .filter('id', 'not.is', null);
  
  if (bossProgressError) {
    console.error(`Error clearing table character_boss_progress:`, bossProgressError);
  } else {
    console.log(`Table character_boss_progress cleared successfully.`);
  }
  
  // Then clear tables with numeric primary keys in the correct order
  await clearTables([
    'adventure_outcomes',
    'adventure_decisions',
    'reward_items',
    'adventures',
    'reward_tables',
    'areas',
    'monsters',
    'items',
    'skills',
    'world_boss'
  ]);
  
  console.log('All tables cleared successfully.');
}

// Seed items
async function seedItems(filePaths) {
  console.log('Seeding items...');
  
  // Convert to array if a single file path is provided
  const filePathArray = Array.isArray(filePaths) ? filePaths : [filePaths];
  
  let nextId = await getNextId('items');
  
  for (const filePath of filePathArray) {
    console.log(`Processing items from: ${filePath}`);
    const items = readJsonFile(filePath);
    
    if (!items || !Array.isArray(items)) {
      console.error(`Invalid items data format in ${filePath}. Expected an array of items.`);
      continue;
    }
    
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
    
    console.log(`Completed processing items from: ${filePath}`);
  }
  
  console.log('Items seeding completed.');
}

// Seed adventures
async function seedAdventures(filePath) {
  console.log('Seeding adventures...');
  
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
async function seedWorldBoss(filePath, rewardsFilePath = null) {
  console.log('Seeding world boss...');
  
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
  
  // Seed world boss rewards if a rewards file is provided
  if (rewardsFilePath) {
    await seedWorldBossRewards(rewardsFilePath);
  }
}

// Seed world boss rewards
async function seedWorldBossRewards(filePath) {
  console.log('Seeding world boss rewards...');
  
  const bossRewards = readJsonFile(filePath);
  
  if (!bossRewards || !Array.isArray(bossRewards)) {
    console.error('Invalid world boss rewards data format. Expected an array of reward tables.');
    return;
  }
  
  for (const rewardTable of bossRewards) {
    // Insert reward table
    const { error: tableError } = await supabase
      .from('reward_tables')
      .upsert({
        id: rewardTable.id,
        name: rewardTable.name,
        description: rewardTable.description,
        created_at: new Date().toISOString()
      }, { onConflict: 'id' });
    
    if (tableError) {
      console.error(`Error inserting world boss reward table ${rewardTable.name}:`, tableError);
      continue;
    }
    
    console.log(`World boss reward table inserted: ${rewardTable.name} with ID ${rewardTable.id}`);
    
    // Insert reward items
    if (rewardTable.items && Array.isArray(rewardTable.items)) {
      for (const item of rewardTable.items) {
        // Create a new object for the reward item
        const rewardItem = {
          reward_table_id: rewardTable.id,
          item_id: item.item_id,
          chance: item.chance,
          created_at: new Date().toISOString()
        };
        
        // Insert reward item
        const { error: itemError } = await supabase
          .from('reward_items')
          .upsert(rewardItem, { onConflict: ['reward_table_id', 'item_id'] });
        
        if (itemError) {
          console.error(`Error inserting world boss reward item for table ${rewardTable.name}:`, itemError);
          continue;
        }
      }
      
      console.log(`Inserted ${rewardTable.items.length} reward items for world boss table ${rewardTable.name}`);
    }
  }
  
  console.log('World boss rewards seeding completed.');
}

// Seed monsters
async function seedMonsters(filePath, eliteFilePath = null) {
  console.log('Seeding monsters...');
  
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
  
  // Seed elite monsters if provided
  if (eliteFilePath) {
    console.log('Seeding elite monsters...');
    
    const eliteMonsters = readJsonFile(eliteFilePath);
    
    if (!eliteMonsters || !Array.isArray(eliteMonsters)) {
      console.error('Invalid elite monsters data format. Expected an array of monsters.');
      return;
    }
    
    for (const monster of eliteMonsters) {
      // Generate ID if not provided
      if (!monster.id) {
        monster.id = nextMonsterId++;
      }
      
      // Add created_at if not provided
      if (!monster.created_at) {
        monster.created_at = new Date().toISOString();
      }
      
      // Insert elite monster
      const { error } = await supabase
        .from('monsters')
        .insert(monster);
      
      if (error) {
        console.error(`Error inserting elite monster ${monster.name}:`, error);
      } else {
        console.log(`Elite monster inserted: ${monster.name} with ID ${monster.id}`);
      }
    }
  }
  
  console.log('Monsters seeding completed.');
}

// Seed reward tables
async function seedRewardTables(filePath) {
  console.log('Seeding reward tables from:', filePath);
  
  const rewardTables = readJsonFile(filePath);
  
  if (!rewardTables || !Array.isArray(rewardTables)) {
    console.error('Invalid reward tables data format. Expected an array of reward tables.');
    return;
  }
  
  console.log(`Found ${rewardTables.length} reward tables to seed`);
  
  for (const rewardTable of rewardTables) {
    // Log details about the reward table
    console.log(`Processing reward table: ID=${rewardTable.id}, Name=${rewardTable.name}`);
    
    // First check if the reward table already exists
    const { data: existingTable, error: checkError } = await supabase
      .from('reward_tables')
      .select('id')
      .eq('id', rewardTable.id)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error(`Error checking if reward table ${rewardTable.name} exists:`, checkError);
    }
    
    if (existingTable) {
      console.log(`Reward table ${rewardTable.name} with ID ${rewardTable.id} already exists, skipping insert`);
    } else {
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
    }
    
    // Always attempt to insert reward items, in case we need to add new ones
    if (rewardTable.items && Array.isArray(rewardTable.items)) {
      console.log(`Processing ${rewardTable.items.length} reward items for table ${rewardTable.name}`);
      
      // First clear existing items for this table to avoid duplicates
      const { error: clearError } = await supabase
        .from('reward_items')
        .delete()
        .eq('reward_table_id', rewardTable.id);
      
      if (clearError) {
        console.error(`Error clearing existing reward items for table ${rewardTable.name}:`, clearError);
      } else {
        console.log(`Cleared existing reward items for table ${rewardTable.name}`);
      }
      
      // Now insert all items
      for (const item of rewardTable.items) {
        // Create a new object for the reward item
        const rewardItem = {
          reward_table_id: rewardTable.id,
          item_id: item.item_id,
          chance: item.chance,
          created_at: new Date().toISOString()
        };
        
        // Insert reward item
        const { error: itemError } = await supabase
          .from('reward_items')
          .insert(rewardItem);
        
        if (itemError) {
          console.error(`Error inserting reward item ${item.item_id} for table ${rewardTable.name}:`, itemError);
          console.error('Reward item data:', rewardItem);
          continue;
        } else {
          console.log(`Inserted reward item ${item.item_id} for table ${rewardTable.name}`);
        }
      }
      
      console.log(`Finished processing reward items for table ${rewardTable.name}`);
    }
  }
  
  console.log('Reward tables seeding completed for:', filePath);
}

// Seed areas
async function seedAreas(filePath) {
  console.log('Seeding areas...');
  
  const areas = readJsonFile(filePath);
  
  if (!areas || !Array.isArray(areas)) {
    console.error('Invalid areas data format. Expected an array of areas.');
    return;
  }
  
  let nextAreaId = await getNextId('areas');
  
  for (const area of areas) {
    // Generate ID if not provided
    if (!area.id) {
      area.id = nextAreaId++;
    }
    
    // Add created_at if not provided
    if (!area.created_at) {
      area.created_at = new Date().toISOString();
    }
    
    // Insert area
    const { error } = await supabase
      .from('areas')
      .insert(area);
    
    if (error) {
      console.error(`Error inserting area ${area.name}:`, error);
    } else {
      console.log(`Area inserted: ${area.name} with ID ${area.id}`);
    }
  }
  
  console.log('Areas seeding completed.');
}

// Seed skills
async function seedSkills(filePath) {
  console.log('Seeding skills...');
  
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
  items <file>                    - Seed items from JSON file
  adventures <file>               - Seed adventures from JSON file
  worldboss <file> [rewardsFile]  - Seed world boss and optionally its rewards
  monsters <file>                 - Seed monsters from JSON file
  rewardtables <file>             - Seed reward tables from JSON file
  skills <file>                   - Seed skills from JSON file
  areas <file>                    - Seed areas from JSON file
  all <directory>                 - Seed all data from directory

Examples:
  node seed-data.js items ./data/items.json
  node seed-data.js adventures ./data/adventures.json
  node seed-data.js worldboss ./data/worldboss.json
  node seed-data.js monsters ./data/monsters.json
  node seed-data.js rewardtables ./data/rewardtables.json
  node seed-data.js skills ./data/skills.json
  node seed-data.js areas ./data/areas.json
  node seed-data.js all ./data
    `);
    return;
  }
  
  const command = args[0];
  const filePath = args[1];
  const secondFilePath = args[2]; // For commands that take two files (like worldboss + rewards)
  
  if (!filePath) {
    console.error('Missing file path.');
    return;
  }
  
  try {
    switch (command) {
      case 'items':
        await clearAllTables();
        await seedItems(filePath);
        break;
      case 'adventures':
        await clearAllTables();
        await seedAdventures(filePath);
        break;
      case 'worldboss':
        await clearAllTables();
        await seedWorldBoss(filePath, secondFilePath);
        break;
      case 'monsters':
        await clearAllTables();
        await seedMonsters(filePath);
        break;
      case 'rewardtables':
        await clearAllTables();
        await seedRewardTables(filePath);
        break;
      case 'skills':
        await clearAllTables();
        await seedSkills(filePath);
        break;
      case 'areas':
        await clearAllTables();
        await seedAreas(filePath);
        break;
      case 'all':
        const directory = filePath;
        
        // Clear all tables before seeding
        await clearAllTables();
        
        // Seed in the correct order to avoid foreign key constraint violations
        
        // Hardcoded list of item files - let's be explicit about which files to load
        const itemFiles = [
          path.join(directory, 'items.json'),
          path.join(directory, 'items2.json')
        ];
        
        // Log all item files we'll be processing
        console.log("EXPLICITLY LOADING THESE ITEM FILES:");
        itemFiles.forEach(file => {
          if (fs.existsSync(file)) {
            console.log(` - ${file} (EXISTS)`);
          } else {
            console.log(` - ${file} (MISSING)`);
          }
        });
        
        if (itemFiles.length > 0) {
          console.log(`Found ${itemFiles.length} item files to process:`);
          itemFiles.forEach(file => console.log(`- ${file}`));
          await seedItems(itemFiles);
        } else {
          console.error('No item files found!');
        }
        
        // First seed all reward tables to avoid foreign key constraint violations
        // Seed global reward tables
        if (fs.existsSync(path.join(directory, 'rewardtables.json'))) {
          console.log('Seeding global reward tables...');
          await seedRewardTables(path.join(directory, 'rewardtables.json'));
        }
        
        // HARDCODED LIST OF ALL REWARD TABLE FILES
        console.log('Loading reward tables from hardcoded file paths:');
        const rewardTableFiles = [
          // Global reward tables
          path.join(directory, 'rewardtables.json'),
          
          // Enchanted Forest reward tables
          path.join(directory, 'monsters', 'enchanted-forest', 'rewardtables.json'),
          
          // Caverns reward tables
          path.join(directory, 'monsters', 'caverns', 'rewardtables.json')
        ];
        
        // Process each reward table file
        let processedRewardFiles = 0;
        for (const rewardFile of rewardTableFiles) {
          if (fs.existsSync(rewardFile)) {
            console.log(`SEEDING REWARD TABLES FROM: ${rewardFile}`);
            await seedRewardTables(rewardFile);
            processedRewardFiles++;
          } else {
            console.warn(`WARNING: Reward table file does not exist: ${rewardFile}`);
          }
        }
        
        console.log(`Processed ${processedRewardFiles} reward table files.`);
        
        // HARDCODED LIST OF ALL MONSTER FILES
        console.log('Loading monsters from hardcoded file paths:');
        const monsterSets = [
          // Enchanted Forest monsters
          {
            normal: path.join(directory, 'monsters', 'enchanted-forest', 'monsters.json'),
            elite: path.join(directory, 'monsters', 'enchanted-forest', 'elite-monsters.json')
          },
          
          // Caverns monsters
          {
            normal: path.join(directory, 'monsters', 'caverns', 'monsters.json'),
            elite: path.join(directory, 'monsters', 'caverns', 'elite-monsters.json')
          }
        ];
        
        // Process each monster set
        let processedMonsterSets = 0;
        for (const monsterSet of monsterSets) {
          if (fs.existsSync(monsterSet.normal)) {
            console.log(`SEEDING MONSTERS FROM: ${monsterSet.normal}`);
            
            if (fs.existsSync(monsterSet.elite)) {
              console.log(`WITH ELITE MONSTERS FROM: ${monsterSet.elite}`);
              await seedMonsters(monsterSet.normal, monsterSet.elite);
            } else {
              await seedMonsters(monsterSet.normal);
            }
            
            processedMonsterSets++;
          } else {
            console.warn(`WARNING: Monster file does not exist: ${monsterSet.normal}`);
          }
        }
        
        console.log(`Processed ${processedMonsterSets} monster sets.`);
        
        // Fall back to legacy monster files if needed
        if (processedMonsterSets === 0) {
          console.log('No area-specific monster files found, trying legacy monster files');
          const legacyMonsterFile = path.join(directory, 'monsters.json');
          const legacyEliteFile = path.join(directory, 'elite-monsters.json');
          
          if (fs.existsSync(legacyMonsterFile)) {
            console.log(`Using legacy monster file: ${legacyMonsterFile}`);
            
            if (fs.existsSync(legacyEliteFile)) {
              console.log(`Using legacy elite monster file: ${legacyEliteFile}`);
              await seedMonsters(legacyMonsterFile, legacyEliteFile);
            } else {
              await seedMonsters(legacyMonsterFile);
            }
          }
        }
        
        await seedSkills(path.join(directory, 'skills.json'));
        await seedAreas(path.join(directory, 'areas.json'));
        
// HARDCODED LIST OF ALL ADVENTURE FILES
console.log('Loading adventures from hardcoded file paths:');
const adventureFileSequence = [
  {
    // Enchanted Forest adventure file
    path: path.join(directory, 'adventures', 'enchanted-forest', 'adventures.json'),
    startId: 1 // IDs will start from 1
  },
  {
    // Caverns adventure files in sequence
    path: path.join(directory, 'adventures', 'caverns', 'adventures.json'),
    startId: 50 // IDs will start from 50
  },
  {
    path: path.join(directory, 'adventures', 'caverns', 'adventures2.json'),
    startId: 100 // IDs will start from 100
  },
  {
    path: path.join(directory, 'adventures', 'caverns', 'adventures3.json'),
    startId: 150 // IDs will start from 150
  },
  {
    path: path.join(directory, 'adventures', 'caverns', 'adventures4.json'),
    startId: 200 // IDs will start from 200
  }
];

// Process each adventure file in sequence with explicit ID ranges
let processedFiles = 0;
let totalAdventureCount = 0;

for (const adventureFile of adventureFileSequence) {
  if (fs.existsSync(adventureFile.path)) {
    console.log(`SEEDING ADVENTURES FROM: ${adventureFile.path} with IDs starting at ${adventureFile.startId}`);
    
    // Read file content
    const adventures = readJsonFile(adventureFile.path);
    if (!adventures || !Array.isArray(adventures)) {
      console.error(`Invalid adventures data format in ${adventureFile.path}. Expected an array of adventures.`);
      continue;
    }
    
    console.log(`Found ${adventures.length} adventures in ${adventureFile.path}`);
    
    // Explicitly assign IDs before seeding
    let currentId = adventureFile.startId;
    for (const adventure of adventures) {
      adventure.id = currentId++;
      console.log(`Assigned ID ${adventure.id} to adventure "${adventure.title}"`);
    }
    
    // Seed with explicitly assigned IDs
    let insertedCount = 0;
    for (const adventure of adventures) {
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
        console.error(`Error inserting adventure ${adventure.title} (ID: ${adventure.id}):`, adventureError);
        continue;
      }
      
      console.log(`Adventure inserted: ${adventure.title} with ID ${adventure.id}`);
      insertedCount++;
      
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
          
          // Ensure type, icon, stat_check are properly passed
          if (decision.type) decisionData.type = decision.type;
          if (decision.icon) decisionData.icon = decision.icon;
          if (decision.stat_check) decisionData.stat_check = decision.stat_check;
          if (decision.base_success_rate !== undefined) decisionData.base_success_rate = decision.base_success_rate;
          if (decision.mastery) decisionData.mastery = decision.mastery;
          
          // Insert decision
          const { error: decisionError } = await supabase
            .from('adventure_decisions')
            .insert(decisionData);
          
          if (decisionError) {
            console.error(`Error inserting decision for adventure ${adventure.title}:`, decisionError);
            console.error('Decision data:', decisionData);
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
                created_at: outcome.created_at || new Date().toISOString(),
                is_success: outcome.is_success !== undefined ? outcome.is_success : true
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
    
    console.log(`Successfully inserted ${insertedCount} out of ${adventures.length} adventures from ${adventureFile.path}`);
    totalAdventureCount += insertedCount;
    processedFiles++;
  } else {
    console.warn(`WARNING: Adventure file does not exist: ${adventureFile.path}`);
  }
}

console.log(`Processed ${processedFiles} adventure files with a total of ${totalAdventureCount} adventures.`);

// Fall back to legacy adventure file if needed
if (processedFiles === 0) {
  console.log('No area-specific adventure files found, using legacy adventure file if available');
  if (fs.existsSync(path.join(directory, 'adventures.json'))) {
    await seedAdventures(path.join(directory, 'adventures.json'));
  }
}
        
        // Seed world boss data
        if (fs.existsSync(path.join(directory, 'worldboss.json'))) {
          const rewardsPath = fs.existsSync(path.join(directory, 'worldboss-rewards.json')) 
            ? path.join(directory, 'worldboss-rewards.json')
            : null;
            
          await seedWorldBoss(path.join(directory, 'worldboss.json'), rewardsPath);
        }
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
