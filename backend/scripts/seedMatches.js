const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const Match = require('../models/Match');
const Team = require('../models/Team');
const Venue = require('../models/Venue');

dotenv.config({ path: path.join(__dirname, '../.env') });

// Helper function to find team with fallback chain
const findTeam = async (teamName, teamCache) => {
  if (!teamName) return null;
  
  const cleanName = teamName.trim().replace(/^"|"$/g, '');
  
  // Check cache first
  if (teamCache[cleanName.toLowerCase()]) {
    return teamCache[cleanName.toLowerCase()];
  }
  
  // 1. Try exact match
  let team = await Team.findOne({ name: cleanName });
  if (team) {
    teamCache[cleanName.toLowerCase()] = team._id;
    return team._id;
  }
  
  // 2. Try case insensitive
  team = await Team.findOne({ name: { $regex: `^${cleanName}$`, $options: 'i' } });
  if (team) {
    teamCache[cleanName.toLowerCase()] = team._id;
    return team._id;
  }
  
  // 3. Try shortName match if it exists
  team = await Team.findOne({ shortName: { $regex: cleanName, $options: 'i' } });
  if (team) {
    teamCache[cleanName.toLowerCase()] = team._id;
    return team._id;
  }
  
  // Not found - return null but don't skip the match
  return null;
};

// Helper function to find venue with fallback chain
const findVenue = async (venueName, venueCache) => {
  if (!venueName) return null;
  
  const cleanName = venueName.trim().replace(/^"|"$/g, '');
  
  // Check cache first
  if (venueCache[cleanName.toLowerCase()]) {
    return venueCache[cleanName.toLowerCase()];
  }
  
  // 1. Try exact match
  let venue = await Venue.findOne({ name: cleanName });
  if (venue) {
    venueCache[cleanName.toLowerCase()] = venue._id;
    return venue._id;
  }
  
  // 2. Try case insensitive
  venue = await Venue.findOne({ name: { $regex: `^${cleanName}$`, $options: 'i' } });
  if (venue) {
    venueCache[cleanName.toLowerCase()] = venue._id;
    return venue._id;
  }
  
  // 3. Try partial match with first meaningful word
  const words = cleanName.split(/\s+/).filter(w => w.length > 3);
  for (const word of words) {
    venue = await Venue.findOne({ name: { $regex: word, $options: 'i' } });
    if (venue) {
      venueCache[cleanName.toLowerCase()] = venue._id;
      return venue._id;
    }
  }
  
  // Not found - return null but don't skip the match
  return null;
};

const seedMatches = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding matches...');

    const csvPath = path.join(__dirname, '../../ml-service/processed/matches.csv');
    const matches = [];
    
    // Read CSV file
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => {
          matches.push(row);
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`Found ${matches.length} matches in CSV`);
    
    const teamCache = {};
    const venueCache = {};
    let seeded = 0;
    let teamsNotFound = 0;
    let venuesNotFound = 0;
    
    for (let i = 0; i < matches.length; i++) {
      const row = matches[i];
      
      // Log progress every 100 records
      if ((i + 1) % 100 === 0) {
        console.log(`Processed ${i + 1}/${matches.length}...`);
      }
      
      // Find teams with fallback chain
      const team1Id = await findTeam(row.team1, teamCache);
      const team2Id = await findTeam(row.team2, teamCache);
      
      if (!team1Id) teamsNotFound++;
      if (!team2Id) teamsNotFound++;
      
      // Find venue with fallback chain
      const venueId = await findVenue(row.venue, venueCache);
      if (!venueId) venuesNotFound++;
      
      // Determine result
      let result = 'draw';
      let winningTeam = null;
      if (row.winner) {
        const winnerId = await findTeam(row.winner, teamCache);
        if (winnerId) {
          winningTeam = winnerId;
          if (team1Id && winnerId.equals(team1Id)) {
            result = 'team1_won';
          } else if (team2Id && winnerId.equals(team2Id)) {
            result = 'team2_won';
          }
        }
      }
      
      // Find toss winner
      let tossWinnerId = null;
      if (row.toss_winner) {
        tossWinnerId = await findTeam(row.toss_winner, teamCache);
      }
      
      // Create match document - ALWAYS create even if some fields are missing
      const matchData = {
        matchNumber: parseInt(row.match_id) || Math.floor(Math.random() * 1000000),
        team1: team1Id,
        team2: team2Id,
        venue: venueId,
        startDate: row.start_date ? new Date(row.start_date) : new Date(),
        result: result,
        winningTeam: winningTeam,
        winMargin: row.result_margin ? `${row.result_margin} ${row.result_type}` : null,
        tossWinner: tossWinnerId,
        tossDecision: row.toss_decision === 'bat' ? 'bat' : 'field',
        status: 'completed'
      };
      
      // Upsert by matchNumber
      await Match.findOneAndUpdate(
        { matchNumber: matchData.matchNumber },
        matchData,
        { upsert: true, new: true }
      );
      
      seeded++;
    }

    console.log(`\n✓ Seeded ${seeded} matches`);
    console.log(`  Teams not found: ${teamsNotFound} references`);
    console.log(`  Venues not found: ${venuesNotFound} references`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding matches:', error);
    process.exit(1);
  }
};

seedMatches();
