# Elite Encounters

Elite encounters are special, more challenging versions of regular monsters that appear during the 5th adventure of each day. These encounters provide greater rewards but are more difficult to defeat.

## Features

- Elite monsters appear during the 5th adventure of each day
- Elite monsters have enhanced stats and abilities
- Elite monsters are visually distinguished with a special "ELITE" tag and different styling
- Elite monsters provide greater experience and gold rewards

## Implementation Details

### Data Structure

Elite monsters are stored in the `monsters` table with the following additional fields:

- `is_elite`: Boolean flag indicating if the monster is an elite version

### Elite Monster Data

Elite monster data is stored in `data/elite-monsters.json`. Each elite monster has:

- Higher hitpoints, attack, and defense values
- Increased experience and gold rewards
- Enhanced abilities
- Visual indicators (ELITE tag, different styling)

### Code Changes

1. **Database Schema**: Added `is_elite` column to the `monsters` table
2. **Type Definitions**: Updated Monster type to include the new fields
3. **Adventure Logic**: Modified `getAdventure` and `completeAdventure` functions to use elite monsters for the 5th adventure
4. **Combat Interface**: Updated to visually distinguish elite monsters
5. **Seed Data**: Added elite monsters data and updated seeding script

## How It Works

1. When a player starts their 5th adventure of the day, the system checks if it should be an elite encounter
2. If it's an elite encounter, the system replaces regular monsters with their elite counterparts
3. The combat interface displays the elite monster with special styling
4. Upon victory, the player receives enhanced rewards

## Technical Notes

- The combat interface checks for the `is_elite` flag to apply special styling
