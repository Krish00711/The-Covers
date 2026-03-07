const axios = require('axios');
const Prediction = require('../models/Prediction');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

/**
 * @desc    Predict match outcome
 * @route   POST /api/v1/predictions/match
 * @access  Private
 */
exports.predictMatch = async (req, res, next) => {
  try {
    const { team1, team2, venue, toss_winner, toss_decision } = req.body;
    
    // Validate input
    if (!team1 || !team2 || !venue || !toss_winner || !toss_decision) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields. Received: team1=${team1}, team2=${team2}, venue=${venue}, toss_winner=${toss_winner}, toss_decision=${toss_decision}`
      });
    }
    
    // Call ML service
    const response = await axios.post(`${ML_SERVICE_URL}/predict/match`, {
      team1,
      team2,
      venue,
      toss_winner,
      toss_decision
    }, {
      timeout: 30000
    });
    
    // Transform ML service response to match frontend expectations
    const mlData = response.data;
    const transformedData = {
      team1_win_probability: mlData[`${team1}_win_prob`] * 100 || 0,
      team2_win_probability: mlData[`${team2}_win_prob`] * 100 || 0,
      draw_probability: mlData.draw_prob * 100 || 0,
      confidence: mlData.confidence * 100 || 0
    };
    
    // Save prediction to database (without user reference)
    await Prediction.create({
      predictionType: 'match_result',
      inputParameters: { team1, team2, venue, toss_winner, toss_decision },
      result: transformedData,
      confidence: transformedData.confidence,
      modelVersion: '1.0'
    });
    
    res.status(200).json({
      success: true,
      data: transformedData
    });
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return res.status(503).json({
        success: false,
        error: 'ML service is currently unavailable. Please try again later.'
      });
    }
    if (error.response) {
      return res.status(error.response.status || 500).json({
        success: false,
        error: error.response.data?.error || error.response.data || 'ML service error'
      });
    }
    next(error);
  }
};

/**
 * @desc    Predict player score
 * @route   POST /api/v1/predictions/score
 * @access  Private
 */
exports.predictScore = async (req, res, next) => {
  try {
    const { player_name, venue, innings_num } = req.body;
    
    // Validate input
    if (!player_name) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: player_name'
      });
    }
    
    // Call ML service
    const response = await axios.post(`${ML_SERVICE_URL}/predict/score`, {
      player_name,
      venue: venue || 'default',
      innings_num: innings_num || 1
    }, {
      timeout: 30000
    });
    
    // Log the raw ML service response for debugging
    console.log('ML Service raw response for score:', JSON.stringify(response.data, null, 2));
    
    // Transform response - ML service returns: predicted_min, predicted_median, predicted_max
    const mlData = response.data;
    const transformedData = {
      expected_score: mlData.predicted_median || mlData.predicted_score || mlData.expected_score || 0,
      min_score: mlData.predicted_min || mlData.min_score || mlData.lower_bound || 0,
      max_score: mlData.predicted_max || mlData.max_score || mlData.upper_bound || 0,
      confidence: (mlData.confidence || 0.13) * 100
    };
    
    console.log('Transformed score data:', JSON.stringify(transformedData, null, 2));
    
    // Save prediction to database (without user reference)
    await Prediction.create({
      predictionType: 'score_range',
      inputParameters: { player_name, venue, innings_num },
      result: transformedData,
      confidence: transformedData.confidence,
      modelVersion: '1.0'
    });
    
    res.status(200).json({
      success: true,
      data: transformedData
    });
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return res.status(503).json({
        success: false,
        error: 'ML service is currently unavailable. Please try again later.'
      });
    }
    if (error.response && error.response.status === 404) {
      return res.status(404).json({
        success: false,
        error: error.response.data.error || 'Player not found'
      });
    }
    next(error);
  }
};

/**
 * @desc    Predict best XI
 * @route   POST /api/v1/predictions/xi
 * @access  Public
 */
exports.predictXI = async (req, res, next) => {
  try {
    const { squad, conditions } = req.body;
    
    // Validate input
    if (!squad || !Array.isArray(squad)) {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid field: squad (must be array of player names)'
      });
    }
    
    // Call ML service
    const response = await axios.post(`${ML_SERVICE_URL}/predict/xi`, {
      squad,
      conditions: conditions || 'balanced'
    }, {
      timeout: 30000
    });
    
    // Transform response to match expected format
    const transformedData = {
      ...response.data,
      best_xi: response.data.recommended_xi || [],
      confidence: response.data.recommended_xi ? 85 : 0
    };
    
    // Save prediction to database (without user reference)
    await Prediction.create({
      predictionType: 'best_xi',
      inputParameters: { squad, conditions },
      result: transformedData,
      confidence: transformedData.confidence,
      modelVersion: '1.0'
    });
    
    res.status(200).json({
      success: true,
      data: transformedData
    });
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return res.status(503).json({
        success: false,
        error: 'ML service is currently unavailable. Please try again later.'
      });
    }
    if (error.response) {
      return res.status(error.response.status || 500).json({
        success: false,
        error: error.response.data?.error || 'ML service error'
      });
    }
    next(error);
  }
};

/**
 * @desc    Find similar players
 * @route   POST /api/v1/predictions/similar-players
 * @access  Private
 */
exports.predictSimilarPlayers = async (req, res, next) => {
  try {
    const { player_name } = req.body;
    
    // Validate input
    if (!player_name) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: player_name'
      });
    }
    
    // Call ML service
    const response = await axios.post(`${ML_SERVICE_URL}/predict/similar-players`, {
      player_name
    }, {
      timeout: 30000
    });
    
    // Log the raw ML service response for debugging
    console.log('ML Service raw response for similarity:', JSON.stringify(response.data, null, 2));
    
    // Transform response - ML service returns: { player, similar_players: [{player, similarity_score, batting_avg, wickets}] }
    const mlData = response.data;
    
    // Transform similar_players array to match frontend expectations (name instead of player)
    const transformedPlayers = (mlData.similar_players || []).map(p => ({
      name: p.player || p.name,
      similarity_score: p.similarity_score || 0,
      batting_average: p.batting_avg || p.batting_average || 0,
      wickets: p.wickets || 0
    }));
    
    // Generate a simple player profile for radar chart (mock data based on player stats)
    const playerProfile = [
      { metric: 'Batting', value: 75 },
      { metric: 'Bowling', value: 45 },
      { metric: 'Fielding', value: 60 },
      { metric: 'Experience', value: 80 }
    ];
    
    const transformedData = {
      player: mlData.player || player_name,
      similar_players: transformedPlayers,
      player_profile: playerProfile
    };
    
    console.log('Transformed similarity data:', JSON.stringify(transformedData, null, 2));
    
    // Save prediction to database (without user reference)
    await Prediction.create({
      predictionType: 'similar_players',
      inputParameters: { player_name },
      result: transformedData,
      confidence: 80,
      modelVersion: '1.0'
    });
    
    res.status(200).json({
      success: true,
      data: transformedData
    });
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return res.status(503).json({
        success: false,
        error: 'ML service is currently unavailable. Please try again later.'
      });
    }
    if (error.response && error.response.status === 404) {
      return res.status(404).json({
        success: false,
        error: error.response.data.error || 'Player not found'
      });
    }
    next(error);
  }
};
