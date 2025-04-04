const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

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

// Helper function to generate UUIDs
const generateId = () => uuidv4();

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
  const items = readJsonFile(filePath);
  
  if (!items || !Array.isArray(items)) {
    console.error('Invalid items data format. Expected an array of items.');
    return;
  }
  
  for (const item of items) {
    // Generate ID if not provided
    if (!item.id) {
      item.id = generateId();
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
      console.log(`Item inserted: ${item.name}`);
    }
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
  
  for (const adventure of adventures) {
    // Generate ID if not provided
    if (!adventure.id) {
      adventure.id = generateId();
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
    
    console.log(`Adventure inserted: ${adventure.title}`);
    
    // Insert decisions and outcomes
    if (decisions && Array.isArray(decisions)) {
      for (const decision of decisions) {
        // Generate ID if not provided
        if (!decision.id) {
          decision.id = generateId();
        }
        
        // Add created_at if not provided
        if (!decision.created_at) {
          decision.created_at = new Date().toISOString();
        }
        
        // Set adventure_id
        decision.adventure_id = adventure.id;
        
        // Extract outcomes
        const { outcomes, ...decisionData } = decision;
        
        // Insert decision
        const { error: decisionError } = await supabase
          .from('adventure_decisions')
          .insert(decisionData);
        
        if (decisionError) {
          console.error(`Error inserting decision for adventure ${adventure.title}:`, decisionError);
          continue;
        }
        
        console.log(`Decision inserted for adventure ${adventure.title}: ${decision.description}`);
        
        // Insert outcomes
        if (outcomes && Array.isArray(outcomes)) {
          for (const outcome of outcomes) {
            // Generate ID if not provided
            if (!outcome.id) {
              outcome.id = generateId();
            }
            
            // Add created_at if not provided
            if (!outcome.created_at) {
              outcome.created_at = new Date().toISOString();
            }
            
            // Set decision_id
            outcome.decision_id = decision.id;
            
            // Insert outcome
            const { error: outcomeError } = await supabase
              .from('adventure_outcomes')
              .insert(outcome);
            
            if (outcomeError) {
              console.error(`Error inserting outcome for decision ${decision.description}:`, outcomeError);
              continue;
            }
            
            console.log(`Outcome inserted for decision ${decision.description}: ${outcome.description.substring(0, 30)}...`);
          }
        }
      }
    }
  }
  
  console.log('Adventures seeding completed.');
}

// Seed world boss
async function seedWorldBoss(filePath) {
  console.log('Seeding world boss...');
  const bosses = readJsonFile(filePath);
  
  if (!bosses || !Array.isArray(bosses)) {
    console.error('Invalid world boss data format. Expected an array of bosses.');
    return;
  }
  
  for (const boss of bosses) {
    // Generate ID if not provided
    if (!boss.id) {
      boss.id = generateId();
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
      console.log(`World boss inserted: ${boss.name}`);
    }
  }
  
  console.log('World boss seeding completed.');
}

// Seed monsters
async function seedMonsters(filePath) {
  console.log('Seeding monsters...');
  const monsters = readJsonFile(filePath);
  
  if (!monsters || !Array.isArray(monsters)) {
    console.error('Invalid monsters data format. Expected an array of monsters.');
    return;
  }
  
  for (const monster of monsters) {
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
      console.log(`Monster inserted: ${monster.name}`);
    }
  }
  
  console.log('Monsters seeding completed.');
}

// Seed reward tables
async function seedRewardTables(filePath) {
  console.log('Seeding reward tables...');
  const rewardTables = readJsonFile(filePath);
  
  if (!rewardTables || !Array.isArray(rewardTables)) {
    console.error('Invalid reward tables data format. Expected an array of reward tables.');
    return;
  }
  
  for (const rewardTable of rewardTables) {
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
    
    console.log(`Reward table inserted: ${rewardTable.name}`);
    
    // Insert reward items
    if (items && Array.isArray(items)) {
      for (const item of items) {
        // Add created_at if not provided
        if (!item.created_at) {
          item.created_at = new Date().toISOString();
        }
        
        // Set reward_table_id
        item.reward_table_id = rewardTable.id;
        
        // Insert reward item
        const { error: itemError } = await supabase
          .from('reward_items')
          .insert(item);
        
        if (itemError) {
          console.error(`Error inserting reward item for table ${rewardTable.name}:`, itemError);
          continue;
        }
        
        console.log(`Reward item inserted for table ${rewardTable.name}: Item ID ${item.item_id}`);
      }
    }
  }
  
  console.log('Reward tables seeding completed.');
}

// Seed skills
async function seedSkills(filePath) {
  console.log('Seeding skills...');
  const skills = readJsonFile(filePath);
  
  if (!skills || !Array.isArray(skills)) {
    console.error('Invalid skills data format. Expected an array of skills.');
    return;
  }
  
  for (const skill of skills) {
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
      console.log(`Skill inserted: ${skill.name}`);
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
        await seedItems(path.join(directory, 'items.json'));
        await seedAdventures(path.join(directory, 'adventures.json'));
        await seedWorldBoss(path.join(directory, 'worldboss.json'));
        await seedMonsters(path.join(directory, 'monsters.json'));
        await seedRewardTables(path.join(directory, 'rewardtables.json'));
        await seedSkills(path.join(directory, 'skills.json'));
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
