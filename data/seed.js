const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

// Import models
const Player = require('../backend/models/Player');
const Match = require('../backend/models/Match');
const Innings = require('../backend/models/Innings');
const Venue = require('../backend/models/Venue');
const Team = require('../backend/models/Team');
const Series = require('../backend/models/Series');

// Import utilities
const { parseYAML, validateParsedData } = require('./yamlParser');
const {
  transformVenue,
  transformTeam,
  transformMatch,
  transformInnings,
  transformPlayer
} = require('./transformer');

// Statistics tracking
const stats = {
  filesProcessed: 0,
  filesSkipped: 0,
  venuesInserted: 0,
  teamsInserted: 0,
  matchesInserted: 0,
  inningsInserted: 0,
  playersInserted: 0,
  errors: []
};

/**
 * Connect to MongoDB
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ MongoDB connected for seeding');
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

/**
 * Get or create venue
 */
const getOrCreateVenue = async (matchInfo) => {
  try {
    let venue = await Venue.findOne({ name: matchInfo.venue });
    
    if (!venue) {
      const venueData = transformVenue(matchInfo);
      venue = await Venue.create(venueData);
      stats.venuesInserted++;
      console.log(`  ✓ Created venue: ${venue.name}`);
    } else {
      // Increment matches played
      venue.matchesPlayed += 1;
      await venue.save();
    }
    
    return venue._id;
  } catch (error) {
    console.error(`  ✗ Error creating venue: ${error.message}`);
    throw error;
  }
};

/**
 * Get or create team
 */
const getOrCreateTeam = async (teamName) => {
  try {
    let team = await Team.findOne({ name: teamName });
    
    if (!team) {
      const teamData = transformTeam(teamName);
      team = await Team.create(teamData);
      stats.teamsInserted++;
      console.log(`  ✓ Created team: ${team.name}`);
    } else {
      // Increment matches played
      team.stats.matchesPlayed += 1;
      await team.save();
    }
    
    return team._id;
  } catch (error) {
    console.error(`  ✗ Error creating team: ${error.message}`);
    throw error;
  }
};

/**
 * Get or create player
 */
const getOrCreatePlayer = async (playerName, teamName, stats = {}) => {
  try {
    let player = await Player.findOne({ name: playerName, country: teamName });
    
    if (!player) {
      const playerData = transformPlayer(playerName, teamName, stats);
      player = await Player.create(playerData);
      stats.playersInserted++;
    } else {
      // Update player stats (simplified - in production, aggregate properly)
      if (stats.runs) {
        player.batting.runs += stats.runs;
        player.batting.innings += 1;
        player.batting.average = player.batting.runs / player.batting.innings;
        if (stats.runs > player.batting.highScore) {
          player.batting.highScore = stats.runs;
        }
        if (stats.runs >= 100) player.batting.centuries += 1;
        else if (stats.runs >= 50) player.batting.fifties += 1;
      }
      
      if (stats.wickets) {
        player.bowling.wickets += stats.wickets;
        player.bowling.innings += 1;
      }
      
      await player.save();
    }
    
    return player._id;
  } catch (error) {
    console.error(`  ✗ Error creating player ${playerName}: ${error.message}`);
    throw error;
  }
};

/**
 * Process a single YAML file
 */
const processYAMLFile = async (filePath) => {
  try {
    console.log(`\nProcessing: ${path.basename(filePath)}`);
    
    // Parse YAML
    const parsedData = parseYAML(filePath);
    validateParsedData(parsedData);
    
    const { info, innings } = parsedData;
    
    // Get or create venue
    const venueId = await getOrCreateVenue(info);
    
    // Get or create teams
    const team1Id = await getOrCreateTeam(info.teams[0]);
    const team2Id = await getOrCreateTeam(info.teams[1]);
    
    // Create match
    const matchData = transformMatch(parsedData, {
      venueId,
      team1Id,
      team2Id,
      teams: info.teams,
      matchNumber: Date.now() + Math.floor(Math.random() * 1000)
    });
    
    const match = await Match.create(matchData);
    stats.matchesInserted++;
    console.log(`  ✓ Created match: ${info.teams[0]} vs ${info.teams[1]}`);
    
    // Process innings
    const inningsIds = [];
    for (const inning of innings) {
      const inningsData = transformInnings(inning, {
        matchId: match._id,
        team1Id,
        team2Id,
        teams: info.teams
      });
      
      // Create players and populate ObjectIds in scorecards
      for (const batting of inningsData.battingScorecard) {
        const playerId = await getOrCreatePlayer(batting.playerName, inning.team, {
          batted: true,
          runs: batting.runs,
          strikeRate: batting.strikeRate
        });
        batting.player = playerId;
        delete batting.playerName;
      }
      
      for (const bowling of inningsData.bowlingScorecard) {
        const bowlingTeam = inning.team === info.teams[0] ? info.teams[1] : info.teams[0];
        const playerId = await getOrCreatePlayer(bowling.playerName, bowlingTeam, {
          bowled: true,
          wickets: bowling.wickets,
          runs: bowling.runs,
          economy: bowling.economy
        });
        bowling.player = playerId;
        delete bowling.playerName;
      }
      
      const inningsDoc = await Innings.create(inningsData);
      inningsIds.push(inningsDoc._id);
      stats.inningsInserted++;
      console.log(`  ✓ Created innings ${inning.inningsNumber} for ${inning.team}`);
    }
    
    // Update match with innings references
    match.innings = inningsIds;
    await match.save();
    
    stats.filesProcessed++;
    console.log(`✓ Successfully processed ${path.basename(filePath)}`);
    
  } catch (error) {
    stats.filesSkipped++;
    stats.errors.push({
      file: path.basename(filePath),
      error: error.message
    });
    console.error(`✗ Error processing ${path.basename(filePath)}: ${error.message}`);
  }
};

/**
 * Main seed function
 */
const seedDatabase = async () => {
  console.log('='.repeat(60));
  console.log('Test Cricket Universe - Database Seeding');
  console.log('='.repeat(60));
  
  try {
    // Connect to database
    await connectDB();
    
    // Get YAML files directory
    const yamlDir = path.join(__dirname, 'cricsheet');
    
    if (!fs.existsSync(yamlDir)) {
      console.error(`✗ Directory not found: ${yamlDir}`);
      console.log('Please create the directory and add YAML files:');
      console.log(`  mkdir -p ${yamlDir}`);
      process.exit(1);
    }
    
    // Read all YAML files
    const files = fs.readdirSync(yamlDir)
      .filter(file => file.endsWith('.yaml') || file.endsWith('.yml'))
      .map(file => path.join(yamlDir, file));
    
    if (files.length === 0) {
      console.log('✗ No YAML files found in cricsheet directory');
      console.log(`  Add .yaml files to: ${yamlDir}`);
      process.exit(1);
    }
    
    console.log(`\nFound ${files.length} YAML file(s) to process\n`);
    
    // Process each file
    for (const file of files) {
      await processYAMLFile(file);
    }
    
    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('Seeding Summary');
    console.log('='.repeat(60));
    console.log(`Files processed: ${stats.filesProcessed}`);
    console.log(`Files skipped: ${stats.filesSkipped}`);
    console.log(`Venues inserted: ${stats.venuesInserted}`);
    console.log(`Teams inserted: ${stats.teamsInserted}`);
    console.log(`Matches inserted: ${stats.matchesInserted}`);
    console.log(`Innings inserted: ${stats.inningsInserted}`);
    console.log(`Players inserted: ${stats.playersInserted}`);
    
    if (stats.errors.length > 0) {
      console.log(`\nErrors (${stats.errors.length}):`);
      stats.errors.forEach(err => {
        console.log(`  - ${err.file}: ${err.error}`);
      });
    }
    
    console.log('\n✓ Seeding completed!');
    
  } catch (error) {
    console.error('\n✗ Fatal error during seeding:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ Database connection closed');
  }
};

// Run seeding if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
