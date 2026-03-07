/**
 * Transform parsed YAML data into Mongoose schema format
 */

/**
 * Transform venue data
 * @param {Object} matchInfo - Parsed match info
 * @returns {Object} Venue document
 */
const transformVenue = (matchInfo) => {
  return {
    name: matchInfo.venue,
    city: matchInfo.city || 'Unknown',
    country: extractCountryFromCity(matchInfo.city),
    location: {
      type: 'Point',
      coordinates: [0, 0] // Default coordinates, should be updated with actual data
    },
    matchesPlayed: 1
  };
};

/**
 * Transform team data
 * @param {string} teamName - Team name
 * @returns {Object} Team document
 */
const transformTeam = (teamName) => {
  return {
    name: teamName,
    country: teamName, // Assuming team name is country name
    stats: {
      matchesPlayed: 1,
      won: 0,
      lost: 0,
      drawn: 0,
      tied: 0,
      winPercentage: 0
    }
  };
};

/**
 * Transform match data
 * @param {Object} parsedData - Parsed YAML data
 * @param {Object} refs - Object IDs for references (venue, teams, series)
 * @returns {Object} Match document
 */
const transformMatch = (parsedData, refs) => {
  const { info } = parsedData;
  
  // Determine result
  let result = 'draw';
  let winningTeam = null;
  let winMargin = null;
  
  if (info.outcome) {
    if (info.outcome.winner) {
      const winnerIndex = info.teams.indexOf(info.outcome.winner);
      result = winnerIndex === 0 ? 'team1_won' : 'team2_won';
      winningTeam = winnerIndex === 0 ? refs.team1Id : refs.team2Id;
      
      if (info.outcome.by) {
        if (info.outcome.by.runs) {
          winMargin = `${info.outcome.by.runs} runs`;
        } else if (info.outcome.by.wickets) {
          winMargin = `${info.outcome.by.wickets} wickets`;
        }
      }
    } else if (info.outcome.result === 'tie') {
      result = 'tie';
    } else if (info.outcome.result === 'no result') {
      result = 'abandoned';
    }
  }
  
  // Determine toss winner
  let tossWinner = null;
  let tossDecision = null;
  if (info.toss && info.toss.winner) {
    const tossWinnerIndex = info.teams.indexOf(info.toss.winner);
    tossWinner = tossWinnerIndex === 0 ? refs.team1Id : refs.team2Id;
    tossDecision = info.toss.decision === 'bat' ? 'bat' : 'field';
  }
  
  return {
    matchNumber: refs.matchNumber || Date.now(),
    team1: refs.team1Id,
    team2: refs.team2Id,
    venue: refs.venueId,
    series: refs.seriesId || null,
    startDate: info.dates && info.dates.length > 0 ? new Date(info.dates[0]) : new Date(),
    endDate: info.dates && info.dates.length > 1 ? new Date(info.dates[info.dates.length - 1]) : null,
    result,
    winningTeam,
    winMargin,
    tossWinner,
    tossDecision,
    umpires: info.umpires || [],
    referee: info.referee || null,
    status: 'completed',
    narrative: null
  };
};

/**
 * Transform innings data
 * @param {Object} inning - Parsed inning data
 * @param {Object} refs - Object IDs for references (match, teams)
 * @returns {Object} Innings document
 */
const transformInnings = (inning, refs) => {
  // Determine batting and bowling teams
  const battingTeamIndex = refs.teams.indexOf(inning.team);
  const battingTeamId = battingTeamIndex === 0 ? refs.team1Id : refs.team2Id;
  const bowlingTeamId = battingTeamIndex === 0 ? refs.team2Id : refs.team1Id;
  
  // Calculate totals from deliveries
  let totalRuns = 0;
  let totalWickets = 0;
  let maxOver = 0;
  const extras = {
    byes: 0,
    legByes: 0,
    wides: 0,
    noBalls: 0,
    penalties: 0
  };
  
  const batsmanStats = {};
  const bowlerStats = {};
  const fallOfWickets = [];
  
  inning.deliveries.forEach(delivery => {
    totalRuns += delivery.runs.total;
    maxOver = Math.max(maxOver, delivery.over);
    
    // Track extras
    if (delivery.extras) {
      if (delivery.extras.byes) extras.byes += delivery.extras.byes;
      if (delivery.extras.legbyes) extras.legByes += delivery.extras.legbyes;
      if (delivery.extras.wides) extras.wides += delivery.extras.wides;
      if (delivery.extras.noballs) extras.noBalls += delivery.extras.noballs;
      if (delivery.extras.penalty) extras.penalties += delivery.extras.penalty;
    }
    
    // Track batsman stats
    if (!batsmanStats[delivery.batsman]) {
      batsmanStats[delivery.batsman] = {
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        dismissal: null
      };
    }
    batsmanStats[delivery.batsman].runs += delivery.runs.batsman;
    batsmanStats[delivery.batsman].balls += 1;
    
    if (delivery.runs.batsman === 4) batsmanStats[delivery.batsman].fours += 1;
    if (delivery.runs.batsman === 6) batsmanStats[delivery.batsman].sixes += 1;
    
    // Track wickets
    if (delivery.wicket) {
      totalWickets += 1;
      const dismissedPlayer = delivery.wicket.player_out || delivery.batsman;
      if (batsmanStats[dismissedPlayer]) {
        batsmanStats[dismissedPlayer].dismissal = delivery.wicket.kind || 'out';
      }
      
      fallOfWickets.push({
        wicket: totalWickets,
        runs: totalRuns,
        overs: delivery.over,
        player: null // Will be populated with player ObjectId later
      });
    }
    
    // Track bowler stats
    if (!bowlerStats[delivery.bowler]) {
      bowlerStats[delivery.bowler] = {
        overs: 0,
        maidens: 0,
        runs: 0,
        wickets: 0,
        balls: 0
      };
    }
    bowlerStats[delivery.bowler].runs += delivery.runs.total;
    bowlerStats[delivery.bowler].balls += 1;
    if (delivery.wicket) {
      bowlerStats[delivery.bowler].wickets += 1;
    }
  });
  
  // Convert batsman stats to array
  const battingScorecard = Object.entries(batsmanStats).map(([name, stats], index) => ({
    player: null, // Will be populated with player ObjectId later
    playerName: name,
    runs: stats.runs,
    balls: stats.balls,
    fours: stats.fours,
    sixes: stats.sixes,
    strikeRate: stats.balls > 0 ? ((stats.runs / stats.balls) * 100).toFixed(2) : 0,
    dismissal: stats.dismissal,
    position: index + 1
  }));
  
  // Convert bowler stats to array and calculate overs
  const bowlingScorecard = Object.entries(bowlerStats).map(([name, stats]) => {
    const overs = Math.floor(stats.balls / 6) + (stats.balls % 6) / 10;
    const economy = overs > 0 ? (stats.runs / overs).toFixed(2) : 0;
    
    return {
      player: null, // Will be populated with player ObjectId later
      playerName: name,
      overs: parseFloat(overs.toFixed(1)),
      maidens: 0, // Would need ball-by-ball analysis to determine
      runs: stats.runs,
      wickets: stats.wickets,
      economy: parseFloat(economy)
    };
  });
  
  return {
    match: refs.matchId,
    inningsNumber: inning.inningsNumber,
    battingTeam: battingTeamId,
    bowlingTeam: bowlingTeamId,
    totalRuns,
    totalWickets,
    overs: parseFloat(maxOver.toFixed(1)),
    declared: false,
    forfeited: false,
    extras,
    battingScorecard,
    bowlingScorecard,
    fallOfWickets,
    sessionData: []
  };
};

/**
 * Transform player data from innings
 * @param {string} playerName - Player name
 * @param {string} teamName - Team name
 * @param {Object} stats - Player stats from innings
 * @returns {Object} Player document
 */
const transformPlayer = (playerName, teamName, stats = {}) => {
  return {
    name: playerName,
    country: teamName,
    role: determineRole(stats),
    batting: {
      style: null,
      matches: 1,
      innings: stats.batted ? 1 : 0,
      runs: stats.runs || 0,
      average: stats.runs || 0,
      strikeRate: stats.strikeRate || 0,
      centuries: stats.runs >= 100 ? 1 : 0,
      fifties: stats.runs >= 50 && stats.runs < 100 ? 1 : 0,
      highScore: stats.runs || 0
    },
    bowling: {
      style: null,
      matches: 1,
      innings: stats.bowled ? 1 : 0,
      wickets: stats.wickets || 0,
      average: 0,
      economy: stats.economy || 0,
      strikeRate: 0,
      fiveWickets: stats.wickets >= 5 ? 1 : 0,
      tenWickets: 0,
      bestInnings: stats.wickets ? `${stats.wickets}/${stats.runs || 0}` : null
    },
    fielding: {
      catches: 0,
      stumpings: 0
    },
    active: true
  };
};

/**
 * Determine player role based on stats
 * @param {Object} stats - Player stats
 * @returns {string} Role
 */
const determineRole = (stats) => {
  if (stats.wickets && stats.wickets > 0 && (!stats.runs || stats.runs < 20)) {
    return 'bowler';
  }
  if (stats.runs && stats.runs > 50 && (!stats.wickets || stats.wickets === 0)) {
    return 'batsman';
  }
  if (stats.wickets && stats.runs) {
    return 'allrounder';
  }
  return 'batsman'; // Default
};

/**
 * Extract country from city name (basic implementation)
 * @param {string} city - City name
 * @returns {string} Country name
 */
const extractCountryFromCity = (city) => {
  // This is a simplified version - in production, use a proper city-to-country mapping
  const cityCountryMap = {
    'London': 'England',
    'Manchester': 'England',
    'Birmingham': 'England',
    'Mumbai': 'India',
    'Delhi': 'India',
    'Kolkata': 'India',
    'Sydney': 'Australia',
    'Melbourne': 'Australia',
    'Brisbane': 'Australia',
    'Karachi': 'Pakistan',
    'Lahore': 'Pakistan',
    'Colombo': 'Sri Lanka',
    'Dhaka': 'Bangladesh',
    'Cape Town': 'South Africa',
    'Johannesburg': 'South Africa',
    'Auckland': 'New Zealand',
    'Wellington': 'New Zealand'
  };
  
  return cityCountryMap[city] || 'Unknown';
};

module.exports = {
  transformVenue,
  transformTeam,
  transformMatch,
  transformInnings,
  transformPlayer,
  extractCountryFromCity
};
