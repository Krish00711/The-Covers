const axios = require('axios');

const BASE_URL = 'https://api.cricapi.com/v1';
const API_KEY = process.env.CRICAPI_KEY;

// Simple in-memory cache
const cache = {
  liveMatches: { data: null, timestamp: 0 },
  upcomingMatches: { data: null, timestamp: 0 },
  rankings: { data: null, timestamp: 0 },
  scorecards: {}
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper to check if cache is valid
const isCacheValid = (cacheEntry) => {
  return cacheEntry.data && (Date.now() - cacheEntry.timestamp) < CACHE_DURATION;
};

/**
 * Get current live Test matches
 */
const getLiveMatches = async () => {
  try {
    // Check cache
    if (isCacheValid(cache.liveMatches)) {
      return cache.liveMatches.data;
    }

    const response = await axios.get(`${BASE_URL}/currentMatches`, {
      params: { apikey: API_KEY, offset: 0 }
    });

    if (response.data && response.data.data) {
      // Filter to only Test matches
      const testMatches = response.data.data.filter(match => 
        match.matchType === 'test' || 
        match.matchType === 'Test' ||
        (match.name && match.name.toLowerCase().includes('test'))
      );

      // Cache the result
      cache.liveMatches = {
        data: testMatches,
        timestamp: Date.now()
      };

      return testMatches;
    }

    return [];
  } catch (error) {
    console.error('CricAPI getLiveMatches error:', error.message);
    return cache.liveMatches.data || [];
  }
};

/**
 * Get upcoming Test matches
 */
const getUpcomingMatches = async () => {
  try {
    // Check cache
    if (isCacheValid(cache.upcomingMatches)) {
      return cache.upcomingMatches.data;
    }

    const response = await axios.get(`${BASE_URL}/matches`, {
      params: { apikey: API_KEY, offset: 0 }
    });

    if (response.data && response.data.data) {
      // Filter to only upcoming Test matches
      const testMatches = response.data.data.filter(match => 
        (match.matchType === 'test' || match.matchType === 'Test' ||
        (match.name && match.name.toLowerCase().includes('test'))) &&
        match.matchStarted === false
      );

      // Cache the result
      cache.upcomingMatches = {
        data: testMatches,
        timestamp: Date.now()
      };

      return testMatches;
    }

    return [];
  } catch (error) {
    console.error('CricAPI getUpcomingMatches error:', error.message);
    return cache.upcomingMatches.data || [];
  }
};

/**
 * Get match scorecard by ID
 */
const getMatchScorecard = async (matchId) => {
  try {
    // Check cache
    if (cache.scorecards[matchId] && isCacheValid(cache.scorecards[matchId])) {
      return cache.scorecards[matchId].data;
    }

    const response = await axios.get(`${BASE_URL}/match_info`, {
      params: { apikey: API_KEY, id: matchId }
    });

    if (response.data && response.data.data) {
      // Cache the result
      cache.scorecards[matchId] = {
        data: response.data.data,
        timestamp: Date.now()
      };

      return response.data.data;
    }

    return null;
  } catch (error) {
    console.error('CricAPI getMatchScorecard error:', error.message);
    return cache.scorecards[matchId]?.data || null;
  }
};

/**
 * Get current ICC Test rankings
 */
const getCurrentRankings = async () => {
  try {
    // Check cache
    if (isCacheValid(cache.rankings)) {
      return cache.rankings.data;
    }

    const response = await axios.get(`${BASE_URL}/rankings`, {
      params: { apikey: API_KEY, type: 'teams' }
    });

    if (response.data && response.data.data) {
      // Filter to Test rankings only
      const testRankings = response.data.data.filter(ranking => 
        ranking.format === 'test' || ranking.format === 'Test'
      );

      // Cache the result
      cache.rankings = {
        data: testRankings,
        timestamp: Date.now()
      };

      return testRankings;
    }

    return [];
  } catch (error) {
    console.error('CricAPI getCurrentRankings error:', error.message);
    return cache.rankings.data || [];
  }
};

module.exports = {
  getLiveMatches,
  getUpcomingMatches,
  getMatchScorecard,
  getCurrentRankings
};
