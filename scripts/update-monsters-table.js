const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Make sure .env.local file exists with proper values.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateMonstersTable() {
  console.log('Updating monsters table...');
  
  try {
    // Check if the columns already exist
    const { data: columns, error: columnsError } = await supabase
      .from('monsters')
      .select('is_elite, base_monster_id, rare_item_chance')
      .limit(1);
    
    if (columnsError) {
      // If the columns don't exist, add them
      console.log('Adding is_elite, base_monster_id, and rare_item_chance columns to monsters table...');
      
      // Use raw SQL to add the columns
      const { error: addColumnsError } = await supabase.rpc('exec', {
        query: `
          ALTER TABLE monsters 
          ADD COLUMN IF NOT EXISTS is_elite BOOLEAN DEFAULT FALSE,
          ADD COLUMN IF NOT EXISTS base_monster_id INTEGER,
          ADD COLUMN IF NOT EXISTS rare_item_chance INTEGER;
        `
      });
      
      if (addColumnsError) {
        console.error('Error adding columns:', addColumnsError);
        return;
      }
      
      console.log('Columns added successfully.');
    } else {
      if (columns[0] && columns[0].rare_item_chance === undefined) {
        console.log('Adding rare_item_chance column to monsters table...');
        
        // Add the rare_item_chance column if it doesn't exist
        const { error: addColumnError } = await supabase.rpc('exec', {
          query: `
            ALTER TABLE monsters 
            ADD COLUMN IF NOT EXISTS rare_item_chance INTEGER;
          `
        });
        
        if (addColumnError) {
          console.error('Error adding rare_item_chance column:', addColumnError);
          return;
        }
        
        console.log('rare_item_chance column added successfully.');
      } else {
        console.log('All columns already exist.');
      }
    }
    
    console.log('Monsters table updated successfully.');
  } catch (error) {
    console.error('Error updating monsters table:', error);
  }
}

async function main() {
  await updateMonstersTable();
  process.exit(0);
}

main();
