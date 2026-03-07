const fs = require('fs');
const yaml = require('js-yaml');

/**
 * Parse a cricsheet YAML file and extract structured match data
 * @param {string} filePath - Path to the YAML file
 * @returns {Object} Parsed match data with info and innings
 */
const parseYAML = (filePath) => {
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = yaml.load(fileContents);
    
    if (!data || !data.info) {
      throw new Error('Invalid YAML structure: missing info section');
    }
    
    // Extract match info
    const matchInfo = {
      teams: data.info.teams || [],
      dates: data.info.dates || [],
      venue: data.info.venue || '',
      city: data.info.city || '',
      outcome: data.info.outcome || {},
      toss: data.info.toss || {},
      gender: data.info.gender || 'male',
      matchType: data.info.match_type || 'Test',
      overs: data.info.overs || null,
      playerOfMatch: data.info.player_of_match || [],
      umpires: data.info.umpires || [],
      referee: data.info.referee || null,
      season: data.info.season || null
    };
    
    // Extract innings data
    const innings = [];
    if (data.innings && Array.isArray(data.innings)) {
      data.innings.forEach((inning, index) => {
        // Each inning is an object with keys like '1st innings', '2nd innings', etc.
        const inningKey = Object.keys(inning)[0];
        const inningData = inning[inningKey];
        
        if (!inningData) return;
        
        const parsedInning = {
          inningsNumber: index + 1,
          team: inningData.team || '',
          deliveries: []
        };
        
        // Parse deliveries
        if (inningData.deliveries && Array.isArray(inningData.deliveries)) {
          inningData.deliveries.forEach(deliveryObj => {
            // Each delivery is an object with over.ball as key
            const overBall = Object.keys(deliveryObj)[0];
            const delivery = deliveryObj[overBall];
            
            if (!delivery) return;
            
            const parsedDelivery = {
              over: parseFloat(overBall),
              batsman: delivery.batsman || delivery.batter || '',
              bowler: delivery.bowler || '',
              nonStriker: delivery.non_striker || '',
              runs: {
                batsman: delivery.runs?.batsman || delivery.runs?.batter || 0,
                extras: delivery.runs?.extras || 0,
                total: delivery.runs?.total || 0
              },
              extras: delivery.extras || null,
              wicket: delivery.wicket || null
            };
            
            parsedInning.deliveries.push(parsedDelivery);
          });
        }
        
        innings.push(parsedInning);
      });
    }
    
    return {
      info: matchInfo,
      innings: innings,
      fileName: filePath.split('/').pop()
    };
    
  } catch (error) {
    throw new Error(`Failed to parse YAML file ${filePath}: ${error.message}`);
  }
};

/**
 * Validate parsed YAML data
 * @param {Object} parsedData - Parsed match data
 * @returns {boolean} True if valid
 */
const validateParsedData = (parsedData) => {
  if (!parsedData.info) {
    throw new Error('Missing info section');
  }
  
  if (!parsedData.info.teams || parsedData.info.teams.length !== 2) {
    throw new Error('Invalid teams data: must have exactly 2 teams');
  }
  
  if (!parsedData.info.venue) {
    throw new Error('Missing venue information');
  }
  
  if (!parsedData.innings || parsedData.innings.length === 0) {
    throw new Error('No innings data found');
  }
  
  return true;
};

module.exports = {
  parseYAML,
  validateParsedData
};
