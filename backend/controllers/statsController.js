const Player = require('../models/Player');
const Team = require('../models/Team');
const Match = require('../models/Match');

/**
 * @desc    Get all-time records
 * @route   GET /api/v1/stats/records
 * @access  Public
 */
exports.getRecords = async (req, res, next) => {
  try {
    // Batting records
    const highestAverage = await Player.find({ 'batting.innings': { $gte: 20 } })
      .sort({ 'batting.average': -1 })
      .limit(10)
      .select('name country batting.average batting.runs batting.innings');
    
    const mostRuns = await Player.find()
      .sort({ 'batting.runs': -1 })
      .limit(10)
      .select('name country batting.runs batting.average batting.centuries');
    
    const mostCenturies = await Player.find()
      .sort({ 'batting.centuries': -1 })
      .limit(10)
      .select('name country batting.centuries batting.runs batting.average');
    
    // Bowling records
    const mostWickets = await Player.find()
      .sort({ 'bowling.wickets': -1 })
      .limit(10)
      .select('name country bowling.wickets bowling.average bowling.economy');
    
    const bestBowlingAverage = await Player.find({ 'bowling.wickets': { $gte: 100 } })
      .sort({ 'bowling.average': 1 })
      .limit(10)
      .select('name country bowling.average bowling.wickets bowling.economy');
    
    res.status(200).json({
      success: true,
      data: {
        batting: {
          highestAverage,
          mostRuns,
          mostCenturies
        },
        bowling: {
          mostWickets,
          bestBowlingAverage
        }
      }
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current ICC rankings
 * @route   GET /api/v1/stats/rankings
 * @access  Public
 */
exports.getRankings = async (req, res, next) => {
  try {
    // Team rankings
    const teams = await Team.find()
      .sort({ iccRanking: 1 })
      .limit(10)
      .select('name country iccRanking stats');
    
    // Player rankings (by batting average)
    const players = await Player.find({ active: true, 'batting.innings': { $gte: 10 } })
      .sort({ 'batting.average': -1 })
      .limit(10)
      .select('name country role batting.average batting.runs');
    
    res.status(200).json({
      success: true,
      data: {
        teams,
        players
      }
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get head-to-head statistics
 * @route   GET /api/v1/stats/head-to-head
 * @access  Public
 */
exports.getHeadToHead = async (req, res, next) => {
  try {
    const { team1, team2 } = req.query;
    
    if (!team1 || !team2) {
      return res.status(400).json({
        success: false,
        error: 'team1 and team2 are required'
      });
    }
    
    // Find teams by name (case insensitive)
    const team1Doc = await Team.findOne({ 
      name: { $regex: new RegExp(`^${team1}$`, 'i') } 
    });
    
    const team2Doc = await Team.findOne({ 
      name: { $regex: new RegExp(`^${team2}$`, 'i') } 
    });
    
    if (!team1Doc) {
      return res.status(404).json({
        success: false,
        error: `Team not found: ${team1}`
      });
    }
    
    if (!team2Doc) {
      return res.status(404).json({
        success: false,
        error: `Team not found: ${team2}`
      });
    }
    
    // Find all matches between these two teams
    const matches = await Match.find({
      $or: [
        { team1: team1Doc._id, team2: team2Doc._id },
        { team1: team2Doc._id, team2: team1Doc._id }
      ]
    })
      .populate('team1', 'name')
      .populate('team2', 'name')
      .populate('winningTeam', 'name')
      .populate('venue', 'name city')
      .sort({ startDate: -1 });
    
    // Calculate statistics
    let team1Wins = 0;
    let team2Wins = 0;
    let draws = 0;
    
    matches.forEach(match => {
      if (match.result === 'draw' || match.result === 'tie') {
        draws++;
      } else if (match.winningTeam) {
        if (match.winningTeam._id.toString() === team1Doc._id.toString()) {
          team1Wins++;
        } else if (match.winningTeam._id.toString() === team2Doc._id.toString()) {
          team2Wins++;
        }
      }
    });
    
    // Format recent matches
    const recentMatches = matches.slice(0, 10).map(m => ({
      date: m.startDate,
      venue: m.venue?.name,
      winner: m.winningTeam?.name || 'Draw',
      resultType: m.result,
      margin: m.winMargin
    }));
    
    res.status(200).json({
      success: true,
      data: {
        team1: team1Doc.name,
        team2: team2Doc.name,
        totalMatches: matches.length,
        team1Wins,
        team2Wins,
        draws,
        recentMatches
      }
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get era-based statistics
 * @route   GET /api/v1/stats/era/:era
 * @access  Public
 */
exports.getEraStats = async (req, res, next) => {
  try {
    const { era } = req.params;
    
    const eraRanges = {
      '1877-1914': { start: 1877, end: 1914 },
      '1920-1950': { start: 1920, end: 1950 },
      '1950-1980': { start: 1950, end: 1980 },
      '1980-2000': { start: 1980, end: 2000 },
      '2000-present': { start: 2000, end: 2030 }
    };
    
    const range = eraRanges[era];
    if (!range) {
      return res.status(400).json({ success: false, error: 'Invalid era' });
    }

    // Find matches in this era date range
    const matches = await Match.find({
      'dates.start': {
        $gte: new Date(`${range.start}-01-01`),
        $lte: new Date(`${range.end}-12-31`)
      }
    }).populate('teams', 'name shortName');

    // Count wins per team
    const teamWins = {};
    matches.forEach(match => {
      const winner = match.result?.winner;
      if (winner && match.result?.type !== 'draw') {
        const key = winner.toString();
        teamWins[key] = (teamWins[key] || 0) + 1;
      }
    });

    // Get top teams
    const topTeams = Object.entries(teamWins)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([team, wins]) => ({ team, wins }));

    // Count results by type
    const resultTypes = { runs: 0, wickets: 0, draw: 0, innings: 0 };
    matches.forEach(match => {
      const type = match.result?.type;
      if (type) resultTypes[type] = (resultTypes[type] || 0) + 1;
    });

    return res.json({
      success: true,
      data: {
        era,
        dateRange: { start: `${range.start}-01-01`, end: `${range.end}-12-31` },
        matchCount: matches.length,
        topTeams,
        resultTypes,
        draws: matches.filter(m => m.result?.type === 'draw').length,
        decisive: matches.filter(m => m.result?.type !== 'draw').length,
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
