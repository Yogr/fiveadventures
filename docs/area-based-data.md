# Area-Based Data Organization

The game now uses an area-based organization system for game data, which makes it easier to manage content by area and add new areas in the future.

## Directory Structure

Game data is organized in the following structure:

```
data/
├── adventures/
│   └── enchanted-forest/
│       └── adventures.json
├── monsters/
│   └── enchanted-forest/
│       ├── monsters.json
│       ├── elite-monsters.json
│       └── rewardtables.json
├── items.json
├── areas.json
├── skills.json
└── [other global data files]
```

## Key Concepts

- **Area-specific directories**: Each game area has its own directory under `data/adventures/` and `data/monsters/`
- **Area-specific reward tables**: Reward tables are now defined per area in `data/monsters/[area-name]/rewardtables.json`
- **Proper sequencing**: When seeding data, ensure reward tables are seeded before the adventures that reference them

## Adding a New Area

To add a new area:

1. Create directories: 
   ```
   data/adventures/[area-name]/
   data/monsters/[area-name]/
   ```

2. Create required files:
   - `data/monsters/[area-name]/monsters.json` - Regular monsters for the area
   - `data/monsters/[area-name]/elite-monsters.json` - Elite monsters for the area
   - `data/monsters/[area-name]/rewardtables.json` - Reward tables specific to the area
   - `data/adventures/[area-name]/adventures.json` - Adventures for the area

3. Update the package.json with area-specific seed commands:
   ```json
   "seed:area:[area-name]": "node scripts/seed-data.js adventures ./data/adventures/[area-name]/adventures.json",
   "seed:monster:[area-name]": "node scripts/seed-data.js monsters ./data/monsters/[area-name]/monsters.json ./data/monsters/[area-name]/elite-monsters.json",
   "seed:rewards:[area-name]": "node scripts/seed-data.js rewardtables ./data/monsters/[area-name]/rewardtables.json",
   "seed:[area-name]": "npm run seed:rewards:[area-name] && npm run seed:monster:[area-name] && npm run seed:area:[area-name]"
   ```

## Seeding the Database

The `seed:all` command will find and seed all data from all areas.

For more targeted seeding:

- `npm run seed:install` - Install required dependencies
- `npm run seed:items` - Seed just the items
- `npm run seed:enchanted-forest` - Seed all Enchanted Forest data in the correct order
- `npm run seed:rewards:enchanted-forest` - Seed just the Enchanted Forest reward tables
- `npm run seed:monster:enchanted-forest` - Seed just the Enchanted Forest monsters
- `npm run seed:area:enchanted-forest` - Seed just the Enchanted Forest adventures

## Troubleshooting

### Common Issues:

1. **Reward tables not found**: Make sure reward tables are seeded before adventures by seeding in the correct order: rewards → monsters → adventures.

2. **File path issues**: The seed script tries both forward and backslash path patterns to match files, but if you're having issues, check the actual paths displayed in the console logs.

3. **Debugging mode**: For detailed file discovery logs, run the seed command with the DEBUG environment variable:
   ```
   DEBUG=seed:* npm run seed:all
   ```

### Database Migration

When adding new columns to database tables, create a migration file in `supabase/migrations/`. For example:

```sql
-- Add a new column to the monsters table
ALTER TABLE IF EXISTS public.monsters
ADD COLUMN IF NOT EXISTS rare_item_chance INTEGER;

COMMENT ON COLUMN public.monsters.rare_item_chance IS 'Percentage chance (0-100) of dropping a rare item';
