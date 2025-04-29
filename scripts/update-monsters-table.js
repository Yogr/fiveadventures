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
      .select('is_elite, rare_item_chance')
      .limit(1);
    
    if (columnsError) {
      // If the columns don't exist, add them
      console.log('Adding is_elite column to monsters table...');
      
      // Use raw SQL to add the columns
      const { error: addColumnsError } = await supabase.rpc('exec', {
        query: `
          ALTER TABLE monsters 
          ADD COLUMN IF NOT EXISTS is_elite BOOLEAN DEFAULT FALSE
        `
      });
      
      if (addColumnsError) {
        console.error('Error adding columns:', addColumnsError);
        return;
      }
      
      console.log('Columns added successfully.');
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
