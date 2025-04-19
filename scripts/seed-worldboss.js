const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check if we have the required environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase environment variables.');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file.');
  process.exit(1);
}

// Initialize the Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedWorldBossData() {
  console.log('Seeding World Boss data...');

  try {
    // Load world boss data
    const worldBossDataPath = path.join(__dirname, '../data/worldboss.json');
    const worldBossData = JSON.parse(fs.readFileSync(worldBossDataPath, 'utf8'));

    // Load world boss reward data
    const worldBossRewardsPath = path.join(__dirname, '../data/worldboss-rewards.json');
    const worldBossRewards = JSON.parse(fs.readFileSync(worldBossRewardsPath, 'utf8'));

    console.log(`Loaded ${worldBossData.length} world bosses and ${worldBossRewards.length} reward tables`);

    // Insert world boss templates (these are used as templates for creating weekly bosses)
    for (const boss of worldBossData) {
      const { error } = await supabase
        .from('world_boss')
        .upsert({
          id: boss.id || undefined, // Let the database auto-generate if not provided
          name: boss.name,
          description: boss.description,
          week: boss.week || 1,
          total_hitpoints: boss.total_hitpoints,
          current_hitpoints: boss.current_hitpoints,
          player_count: boss.player_count || 0,
          attack_count: boss.attack_count || 0,
          total_damage: boss.total_damage || 0,
          is_defeated: boss.is_defeated || false,
          image_url: boss.image_url,
          created_at: new Date().toISOString()
        }, { onConflict: 'name' });

      if (error) {
        console.error(`Error inserting world boss ${boss.name}:`, error);
      } else {
        console.log(`Inserted/updated world boss: ${boss.name}`);
      }
    }

    // Insert reward tables
    for (const rewardTable of worldBossRewards) {
      // Insert the reward table
      const { error: tableError } = await supabase
        .from('reward_tables')
        .upsert({
          id: rewardTable.id,
          name: rewardTable.name,
          description: rewardTable.description,
          created_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (tableError) {
        console.error(`Error inserting reward table ${rewardTable.name}:`, tableError);
        continue;
      }

      console.log(`Inserted/updated reward table: ${rewardTable.name}`);

      // Insert reward items
      if (rewardTable.items && rewardTable.items.length > 0) {
        for (const item of rewardTable.items) {
          const { error: itemError } = await supabase
            .from('reward_items')
            .upsert({
              reward_table_id: rewardTable.id,
              item_id: item.item_id,
              chance: item.chance,
              created_at: new Date().toISOString()
            }, { onConflict: ['reward_table_id', 'item_id'] });

          if (itemError) {
            console.error(`Error inserting reward item ${item.item_id} for table ${rewardTable.name}:`, itemError);
          }
        }
        console.log(`Inserted/updated ${rewardTable.items.length} reward items for table ${rewardTable.name}`);
      }
    }

    console.log('World Boss data seeding complete!');
  } catch (error) {
    console.error('Error seeding World Boss data:', error);
    process.exit(1);
  }
}

// Run the seeding
seedWorldBossData().then(() => {
  console.log('Done!');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
