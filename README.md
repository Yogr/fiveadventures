# Five Adventures

A daily RPG adventure game with a pixelated art style, built with Next.js, React, TypeScript, and Supabase.

## Overview

Five Adventures is a web-based RPG where players can embark on five unique adventures each day. Players create a character, choosing from four classes (Warrior, Wizard, Thief, or Ranger), and then navigate through daily adventures, making decisions that affect their outcomes.

Key features:
- Character creation and progression
- Daily adventures with multiple decision paths
- Item collection and equipment management
- Shop system for buying and selling items with dynamic pricing
- Weekly world boss battles with tiered rewards
- Persistent character progression
- Optimized database schema with integer IDs

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js App Router (Server Components & Server Actions)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth

## Project Structure

```
/src
  /app                 # Next.js App Router pages
    /actions           # Server actions
    /api               # API routes
    /(auth)            # Authentication pages
    /(game)            # Game pages
  /components          # React components
    /ui                # Reusable UI components
    /character         # Character-related components
    /adventure         # Adventure-related components
    /inventory         # Inventory-related components
    /shop              # Shop-related components
    /worldboss         # World boss-related components
  /lib                 # Utility functions and types
    /supabase.ts       # Supabase client
    /utils.ts          # Utility functions
    /types.ts          # TypeScript types
    /constants.ts      # Game constants
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yogr/five-adventures.git
   cd five-adventures
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. Set up the database:
   - Create a new Supabase project
   - Run the SQL script in `supabase-schema.sql` in the Supabase SQL editor to create the necessary tables

5. Install dependencies for the seed scripts:
   ```bash
   npm run seed:install
   ```

6. Seed the database with initial data:
   ```bash
   # Seed all data
   npm run seed:all
   
   # Or seed individual data types
   npm run seed:items
   npm run seed:adventures
   npm run seed:worldboss
   npm run seed:monsters
   npm run seed:rewardtables
   npm run seed:skills
   ```

6. Run the development server:
   ```bash
   npm run dev
   # Or use the helper script
   node dev.js
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Adding New Content

You can add new content by modifying the JSON files in the `data` directory:

- `data/items.json` - Add new weapons, armor, helmets, and trinkets
- `data/adventures.json` - Add new adventures with decisions and outcomes
- `data/worldboss.json` - Add new weekly world bosses
- `data/monsters.json` - Add new monsters for combat encounters
- `data/rewardtables.json` - Add new reward tables for adventures and bosses
- `data/skills.json` - Add new character skills and abilities

After modifying the files, run the appropriate seed command to update the database:

```bash
npm run seed:items
npm run seed:adventures
npm run seed:worldboss
npm run seed:monsters
npm run seed:rewardtables
npm run seed:skills
```

You can also create your own JSON files and use the seed-data.js script directly:

```bash
node scripts/seed-data.js items ./path/to/your/items.json
```

## Game Mechanics

### Character Classes

- **Warrior**: High strength and HP, skilled with all weapons
- **Wizard**: High intelligence, can cast powerful spells
- **Thief**: High luck and agility, good at finding treasures
- **Ranger**: Balanced stats, good tracking and wilderness skills

### Character Stats

- **Strength**: Affects physical damage and certain adventure outcomes
- **Intelligence**: Affects magical abilities and puzzle-solving
- **Agility**: Affects dodge chance and certain adventure outcomes
- **Luck**: Affects critical hit chance and finding rare items
- **Hitpoints**: Character's health, refreshes daily
- **Energy**: Used for certain actions, refreshes daily

### Adventures

Players can complete up to five adventures per day. Each adventure presents a scenario with multiple decision paths. The outcome of each decision is influenced by the character's stats, class, and equipment.

### Items and Equipment

Characters can equip items in four slots:
- Weapon
- Helmet
- Armor
- Trinket

Items have different rarities (Common, Uncommon, Rare, Epic, Legendary) and provide various stat boosts and effects.

### World Boss

After completing daily adventures, players can attack the weekly world boss. Damage dealt is based on character level, stats, equipment, and remaining HP. When the boss is defeated, rewards are distributed to all participants based on their contribution.

## Development

### Database Schema

The game uses an optimized database schema with integer IDs for all tables, which improves performance and reduces storage requirements. The schema is defined in `supabase-schema.sql` and includes tables for:

- Users and characters
- Items and inventory
- Adventures, decisions, and outcomes
- Shop system
- World bosses and rewards
- Monsters and combat
- Skills and abilities

### Shop System

The shop system features:
- Daily refreshing items
- Dynamic pricing based on item rarity and character level
- Inventory management with equipped item detection
- Selling unwanted items for gold

### Adding New Adventures

To add new adventures, insert records into the `adventures`, `adventure_decisions`, and `adventure_outcomes` tables in the database.

### Adding New Items

To add new items, insert records into the `items` table in the database.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
