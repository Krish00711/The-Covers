# Test Cricket Universe - Data Pipeline

This directory contains the data ingestion pipeline for loading cricket match data from Cricsheet YAML files into MongoDB.

## Structure

```
data/
├── cricsheet/          # Place your .yaml files here
├── yamlParser.js       # Parses Cricsheet YAML format
├── transformer.js      # Transforms to Mongoose schema format
├── seed.js            # Main seeding script
└── README.md          # This file
```

## YAML File Format

The pipeline expects Cricsheet YAML files with this structure:

```yaml
info:
  teams: [Team1, Team2]
  dates: [2024-01-01, 2024-01-05]
  venue: "Venue Name"
  city: "City Name"
  outcome:
    winner: "Team1"
    by:
      runs: 150
  toss:
    winner: "Team1"
    decision: "bat"
  umpires: ["Umpire1", "Umpire2"]
  
innings:
  - 1st innings:
      team: "Team1"
      deliveries:
        - 0.1:
            batsman: "Player1"
            bowler: "Player2"
            non_striker: "Player3"
            runs:
              batsman: 4
              extras: 0
              total: 4
        - 0.2:
            batsman: "Player1"
            bowler: "Player2"
            non_striker: "Player3"
            runs:
              batsman: 0
              extras: 0
              total: 0
            wicket:
              player_out: "Player1"
              kind: "caught"
```

## Usage

### 1. Add YAML Files

Place your Cricsheet YAML files in the `cricsheet/` directory:

```bash
cp /path/to/your/match.yaml data/cricsheet/
```

### 2. Ensure MongoDB is Running

```bash
# Check if MongoDB is running
mongosh --eval "db.version()"

# Or start MongoDB
sudo systemctl start mongod
```

### 3. Run the Seeding Script

```bash
node data/seed.js
```

## What the Script Does

1. **Connects to MongoDB** using the connection string from `backend/.env`
2. **Reads all YAML files** from `data/cricsheet/` directory
3. **For each file:**
   - Parses the YAML structure
   - Validates the data
   - Creates/updates Venues
   - Creates/updates Teams
   - Creates Match records
   - Creates Innings records with ball-by-ball data
   - Creates/updates Player records with aggregated stats
4. **Logs progress** for each file processed
5. **Handles errors gracefully** - continues processing even if one file fails
6. **Prints summary** with counts of records inserted

## Output Example

```
============================================================
Test Cricket Universe - Database Seeding
============================================================
✓ MongoDB connected for seeding

Found 5 YAML file(s) to process

Processing: match1.yaml
  ✓ Created venue: Lord's
  ✓ Created team: England
  ✓ Created team: Australia
  ✓ Created match: England vs Australia
  ✓ Created innings 1 for England
  ✓ Created innings 2 for Australia
✓ Successfully processed match1.yaml

...

============================================================
Seeding Summary
============================================================
Files processed: 5
Files skipped: 0
Venues inserted: 3
Teams inserted: 4
Matches inserted: 5
Innings inserted: 10
Players inserted: 87

✓ Seeding completed!
✓ Database connection closed
```

## Error Handling

- **Invalid YAML**: Skips file and logs error
- **Missing required fields**: Skips file and logs error
- **Duplicate records**: Updates existing records instead of creating duplicates
- **Database errors**: Logs error and continues with next file

## Data Transformations

### Venue
- Extracts venue name and city from match info
- Attempts to determine country from city name
- Sets default coordinates (0, 0) - should be updated with actual data

### Team
- Creates team from team name
- Initializes stats counters
- Updates match counts on subsequent matches

### Match
- Determines result from outcome data
- Calculates win margin
- Links to venue and teams via ObjectId references
- Sets match status to 'completed'

### Innings
- Calculates totals from ball-by-ball deliveries
- Aggregates batsman statistics (runs, balls, fours, sixes, strike rate)
- Aggregates bowler statistics (overs, runs, wickets, economy)
- Tracks fall of wickets with over and runs
- Tracks extras (byes, leg byes, wides, no balls)

### Player
- Creates player from name and team
- Determines role based on performance (batsman/bowler/allrounder)
- Aggregates career statistics across matches
- Updates existing players with new match data

## Notes

- The script uses **upsert logic** to avoid duplicates
- Player stats are **aggregated** across multiple matches
- Match numbers are **auto-generated** (timestamp + random)
- The script is **idempotent** - safe to run multiple times
- All operations use **async/await** for better error handling

## Troubleshooting

### "No YAML files found"
- Ensure files are in `data/cricsheet/` directory
- Check file extensions are `.yaml` or `.yml`

### "MongoDB connection failed"
- Check MongoDB is running: `sudo systemctl status mongod`
- Verify connection string in `backend/.env`
- Ensure MongoDB is accessible on the specified port

### "Invalid YAML structure"
- Verify YAML file follows Cricsheet format
- Check for required fields: info.teams, info.venue, innings
- Validate YAML syntax using online validator

## Getting Cricsheet Data

Download official Test match data from:
- https://cricsheet.org/downloads/

Look for Test match YAML files in the downloads section.
