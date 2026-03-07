const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const Player = require('../models/Player');

dotenv.config({ path: path.join(__dirname, '../.env') });

// Country mapping based on player names and cricket knowledge
const countryMapping = {
  // India
  'V Kohli': 'India', 'R Sharma': 'India', 'JJ Bumrah': 'India', 'R Ashwin': 'India',
  'CA Pujara': 'India', 'AM Rahane': 'India', 'RG Sharma': 'India', 'S Dhawan': 'India',
  'KL Rahul': 'India', 'RA Jadeja': 'India', 'Mohammed Shami': 'India', 'Ishant Sharma': 'India',
  'MS Dhoni': 'India', 'SR Tendulkar': 'India', 'SC Ganguly': 'India', 'R Dravid': 'India',
  'VVS Laxman': 'India', 'Yuvraj Singh': 'India', 'Harbhajan Singh': 'India', 'Z Khan': 'India',
  'V Sehwag': 'India', 'G Gambhir': 'India',
  
  // England
  'JE Root': 'England', 'BA Stokes': 'England', 'JM Anderson': 'England', 'SCJ Broad': 'England',
  'JM Bairstow': 'England', 'MM Ali': 'England', 'CR Woakes': 'England', 'AN Cook': 'England',
  'KP Pietersen': 'England', 'AJ Strauss': 'England', 'IR Bell': 'England', 'GP Swann': 'England',
  'MJ Prior': 'England', 'A Flintoff': 'England', 'ME Trescothick': 'England', 'MP Vaughan': 'England',
  
  // Australia
  'SPD Smith': 'Australia', 'DA Warner': 'Australia', 'MA Starc': 'Australia', 'PJ Cummins': 'Australia',
  'NM Lyon': 'Australia', 'UT Khawaja': 'Australia', 'TM Head': 'Australia', 'MR Marsh': 'Australia',
  'RT Ponting': 'Australia', 'ML Hayden': 'Australia', 'AC Gilchrist': 'Australia', 'SK Warne': 'Australia',
  'GD McGrath': 'Australia', 'MEK Hussey': 'Australia', 'MJ Clarke': 'Australia', 'SR Watson': 'Australia',
  
  // Pakistan
  'Babar Azam': 'Pakistan', 'Mohammad Rizwan': 'Pakistan', 'Shaheen Shah Afridi': 'Pakistan',
  'Hasan Ali': 'Pakistan', 'Azhar Ali': 'Pakistan', 'Asad Shafiq': 'Pakistan', 'Younis Khan': 'Pakistan',
  'Misbah-ul-Haq': 'Pakistan', 'Mohammad Yousuf': 'Pakistan', 'Inzamam-ul-Haq': 'Pakistan',
  'Wasim Akram': 'Pakistan', 'Waqar Younis': 'Pakistan', 'Shoaib Akhtar': 'Pakistan',
  
  // South Africa
  'AB de Villiers': 'South Africa', 'HM Amla': 'South Africa', 'F du Plessis': 'South Africa',
  'Q de Kock': 'South Africa', 'KA Maharaj': 'South Africa', 'K Rabada': 'South Africa',
  'GC Smith': 'South Africa', 'JH Kallis': 'South Africa', 'M Morkel': 'South Africa',
  'DW Steyn': 'South Africa', 'HH Gibbs': 'South Africa', 'SM Pollock': 'South Africa',
  
  // New Zealand
  'KS Williamson': 'New Zealand', 'TG Southee': 'New Zealand', 'TA Boult': 'New Zealand',
  'TWM Latham': 'New Zealand', 'BJ Watling': 'New Zealand', 'MJ Santner': 'New Zealand',
  'BB McCullum': 'New Zealand', 'DL Vettori': 'New Zealand', 'CD McMillan': 'New Zealand',
  
  // West Indies
  'JO Holder': 'West Indies', 'KAJ Roach': 'West Indies', 'CH Gayle': 'West Indies',
  'BC Lara': 'West Indies', 'S Chanderpaul': 'West Indies', 'CA Walsh': 'West Indies',
  'CEL Ambrose': 'West Indies', 'RR Sarwan': 'West Indies',
  
  // Sri Lanka
  'AD Mathews': 'Sri Lanka', 'DPMD Jayawardene': 'Sri Lanka', 'KC Sangakkara': 'Sri Lanka',
  'TM Dilshan': 'Sri Lanka', 'WPUJC Vaas': 'Sri Lanka', 'M Muralitharan': 'Sri Lanka',
  'ST Jayasuriya': 'Sri Lanka', 'PA de Silva': 'Sri Lanka',
  
  // Bangladesh
  'Shakib Al Hasan': 'Bangladesh', 'Mushfiqur Rahim': 'Bangladesh', 'Tamim Iqbal': 'Bangladesh',
  'Mahmudullah': 'Bangladesh', 'Mehidy Hasan': 'Bangladesh', 'Mustafizur Rahman': 'Bangladesh',
  
  // Zimbabwe
  'H Masakadza': 'Zimbabwe', 'BRM Taylor': 'Zimbabwe', 'SC Williams': 'Zimbabwe',
  
  // Ireland
  'A Balbirnie': 'Ireland', 'PR Stirling': 'Ireland', 'KJ OBrien': 'Ireland',
  
  // Afghanistan
  'Rashid Khan': 'Afghanistan', 'Mohammad Nabi': 'Afghanistan', 'Rahmat Shah': 'Afghanistan'
};

// Function to guess country from player name patterns
function guessCountry(playerName) {
  // Check exact match first
  if (countryMapping[playerName]) {
    return countryMapping[playerName];
  }
  
  // Pattern matching for common name patterns
  const name = playerName.toLowerCase();
  
  // Indian patterns
  if (name.includes('kumar') || name.includes('singh') || name.includes('sharma') || 
      name.includes('patel') || name.includes('yadav') || name.includes('reddy') ||
      name.includes('iyer') || name.includes('pandya') || name.includes('kohli') ||
      name.includes('dhoni') || name.includes('tendulkar') || name.includes('ganguly') ||
      name.includes('dravid') || name.includes('laxman')) {
    return 'India';
  }
  
  // Pakistani patterns
  if (name.includes('khan') || name.includes('ahmed') || name.includes('ali') ||
      name.includes('azam') || name.includes('afridi') || name.includes('akram') ||
      name.includes('ul-') || name.includes('ullah') || name.includes('mohammad') ||
      name.includes('younis') || name.includes('misbah') || name.includes('inzamam')) {
    return 'Pakistan';
  }
  
  // Sri Lankan patterns
  if (name.includes('jayawardene') || name.includes('sangakkara') || name.includes('dilshan') ||
      name.includes('muralitharan') || name.includes('mendis') || name.includes('perera') ||
      name.includes('silva') || name.includes('jayasuriya') || name.includes('vaas')) {
    return 'Sri Lanka';
  }
  
  // Bangladeshi patterns
  if (name.includes('hasan') || name.includes('rahim') || name.includes('iqbal') ||
      name.includes('mahmudullah') || name.includes('shakib') || name.includes('mustafizur')) {
    return 'Bangladesh';
  }
  
  // South African patterns (Afrikaans names)
  if (name.includes('de villiers') || name.includes('du plessis') || name.includes('de kock') ||
      name.includes('steyn') || name.includes('kallis') || name.includes('amla') ||
      name.includes('rabada') || name.includes('morkel')) {
    return 'South Africa';
  }
  
  // West Indian patterns
  if (name.includes('gayle') || name.includes('lara') || name.includes('chanderpaul') ||
      name.includes('holder') || name.includes('roach') || name.includes('bravo') ||
      name.includes('ambrose') || name.includes('walsh')) {
    return 'West Indies';
  }
  
  // New Zealand patterns
  if (name.includes('williamson') || name.includes('southee') || name.includes('boult') ||
      name.includes('mccullum') || name.includes('vettori') || name.includes('latham')) {
    return 'New Zealand';
  }
  
  // Australian patterns
  if (name.includes('smith') || name.includes('warner') || name.includes('starc') ||
      name.includes('cummins') || name.includes('lyon') || name.includes('ponting') ||
      name.includes('hayden') || name.includes('gilchrist') || name.includes('warne') ||
      name.includes('mcgrath') || name.includes('clarke') || name.includes('watson')) {
    return 'Australia';
  }
  
  // Default to England for unmatched
  return 'England';
}

const parseCSV = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',');
  
  const players = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const player = {};
    headers.forEach((header, index) => {
      player[header.trim()] = values[index] ? values[index].trim() : '';
    });
    players.push(player);
  }
  
  return players;
};

const determineRole = (battingAvg, wickets) => {
  const avg = parseFloat(battingAvg) || 0;
  const wkts = parseInt(wickets) || 0;
  
  if (avg > 30 && wkts > 50) return 'allrounder';
  if (avg > 25 && wkts < 20) return 'batsman';
  if (wkts > 100) return 'bowler';
  if (avg > 20 && wkts > 20) return 'allrounder';
  if (wkts > 50) return 'bowler';
  return 'batsman';
};

const seedPlayers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding players...');

    const csvPath = path.join(__dirname, '../../ml-service/models/players_index.csv');
    const rawPlayers = parseCSV(csvPath);
    
    let count = 0;
    for (const raw of rawPlayers) {
      const playerName = raw.player_name;
      if (!playerName) continue;
      
      const battingAvg = parseFloat(raw.batting_avg) || 0;
      const totalRuns = parseInt(raw.total_runs) || 0;
      const totalInnings = parseInt(raw.total_innings) || 0;
      const hundreds = parseInt(raw.hundreds) || 0;
      const fifties = parseInt(raw.fifties) || 0;
      const highestScore = parseInt(raw.highest_score) || 0;
      const strikeRate = parseFloat(raw.strike_rate) || 0;
      
      const wickets = parseInt(raw.wickets) || 0;
      const bowlingAvg = parseFloat(raw.bowling_avg) || 0;
      const economy = parseFloat(raw.economy) || 0;
      const ballsBowled = parseInt(raw.balls_bowled) || 0;
      
      const role = determineRole(battingAvg, wickets);
      
      const playerData = {
        name: playerName,
        country: guessCountry(playerName),
        role: role,
        batting: {
          matches: totalInnings,
          innings: totalInnings,
          runs: totalRuns,
          average: battingAvg,
          strikeRate: strikeRate,
          centuries: hundreds,
          fifties: fifties,
          highScore: highestScore
        },
        bowling: {
          wickets: wickets,
          average: bowlingAvg,
          economy: economy,
          balls: ballsBowled
        },
        active: true
      };
      
      await Player.findOneAndUpdate(
        { name: playerName },
        playerData,
        { upsert: true, new: true }
      );
      count++;
    }

    console.log(`✓ Seeded ${count} players`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding players:', error);
    process.exit(1);
  }
};

seedPlayers();
