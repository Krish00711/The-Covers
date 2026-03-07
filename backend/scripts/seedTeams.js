const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Team = require('../models/Team');

dotenv.config({ path: path.join(__dirname, '../.env') });

const teams = [
  {
    name: 'India',
    country: 'India',
    iccRanking: 1,
    founded: 1932,
    stats: { matchesPlayed: 576, won: 178, lost: 178, drawn: 217, tied: 3, winPercentage: 30.9 }
  },
  {
    name: 'Australia',
    country: 'Australia',
    iccRanking: 2,
    founded: 1877,
    stats: { matchesPlayed: 856, won: 411, lost: 232, drawn: 210, tied: 3, winPercentage: 48.0 }
  },
  {
    name: 'England',
    country: 'England',
    iccRanking: 3,
    founded: 1877,
    stats: { matchesPlayed: 1067, won: 398, lost: 327, drawn: 339, tied: 3, winPercentage: 37.3 }
  },
  {
    name: 'South Africa',
    country: 'South Africa',
    iccRanking: 4,
    founded: 1889,
    stats: { matchesPlayed: 462, won: 173, lost: 162, drawn: 126, tied: 1, winPercentage: 37.4 }
  },
  {
    name: 'New Zealand',
    country: 'New Zealand',
    iccRanking: 5,
    founded: 1930,
    stats: { matchesPlayed: 471, won: 113, lost: 194, drawn: 163, tied: 1, winPercentage: 24.0 }
  },
  {
    name: 'Pakistan',
    country: 'Pakistan',
    iccRanking: 6,
    founded: 1952,
    stats: { matchesPlayed: 449, won: 148, lost: 138, drawn: 162, tied: 1, winPercentage: 33.0 }
  },
  {
    name: 'West Indies',
    country: 'West Indies',
    iccRanking: 7,
    founded: 1928,
    stats: { matchesPlayed: 553, won: 188, lost: 199, drawn: 164, tied: 2, winPercentage: 34.0 }
  },
  {
    name: 'Sri Lanka',
    country: 'Sri Lanka',
    iccRanking: 8,
    founded: 1982,
    stats: { matchesPlayed: 299, won: 98, lost: 117, drawn: 84, tied: 0, winPercentage: 32.8 }
  },
  {
    name: 'Bangladesh',
    country: 'Bangladesh',
    iccRanking: 9,
    founded: 2000,
    stats: { matchesPlayed: 145, won: 17, lost: 104, drawn: 24, tied: 0, winPercentage: 11.7 }
  },
  {
    name: 'Zimbabwe',
    country: 'Zimbabwe',
    iccRanking: 10,
    founded: 1992,
    stats: { matchesPlayed: 117, won: 13, lost: 75, drawn: 29, tied: 0, winPercentage: 11.1 }
  },
  {
    name: 'Ireland',
    country: 'Ireland',
    iccRanking: 11,
    founded: 2017,
    stats: { matchesPlayed: 8, won: 0, lost: 7, drawn: 1, tied: 0, winPercentage: 0.0 }
  },
  {
    name: 'Afghanistan',
    country: 'Afghanistan',
    iccRanking: 12,
    founded: 2017,
    stats: { matchesPlayed: 9, won: 1, lost: 7, drawn: 1, tied: 0, winPercentage: 11.1 }
  },
  {
    name: 'ICC World XI',
    country: 'International',
    iccRanking: null,
    founded: null,
    stats: { matchesPlayed: 0, won: 0, lost: 0, drawn: 0, tied: 0, winPercentage: 0.0 }
  }
];

const seedTeams = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding teams...');

    let count = 0;
    for (const teamData of teams) {
      await Team.findOneAndUpdate(
        { name: teamData.name },
        teamData,
        { upsert: true, new: true }
      );
      count++;
    }

    console.log(`✓ Seeded ${count} teams`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding teams:', error);
    process.exit(1);
  }
};

seedTeams();
