const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Venue = require('../models/Venue');

dotenv.config({ path: path.join(__dirname, '../.env') });

const venues = [
  {
    name: "Lord's Cricket Ground",
    city: 'London',
    country: 'England',
    location: { type: 'Point', coordinates: [-0.1727, 51.5294] },
    capacity: 31100,
    established: 1814,
    pitchProfile: { spinFriendly: 40, paceFriendly: 70, avgFirstInningsScore: 350, characteristics: 'Seaming conditions, favors pace' },
    matchesPlayed: 142
  },
  {
    name: 'Melbourne Cricket Ground',
    city: 'Melbourne',
    country: 'Australia',
    location: { type: 'Point', coordinates: [144.9834, -37.8200] },
    capacity: 100024,
    established: 1853,
    pitchProfile: { spinFriendly: 30, paceFriendly: 75, avgFirstInningsScore: 380, characteristics: 'Bouncy, pace-friendly' },
    matchesPlayed: 115
  },
  {
    name: 'Eden Gardens',
    city: 'Kolkata',
    country: 'India',
    location: { type: 'Point', coordinates: [88.3432, 22.5645] },
    capacity: 66000,
    established: 1864,
    pitchProfile: { spinFriendly: 75, paceFriendly: 40, avgFirstInningsScore: 320, characteristics: 'Spin-friendly, low bounce' },
    matchesPlayed: 42
  },
  {
    name: 'Wankhede Stadium',
    city: 'Mumbai',
    country: 'India',
    location: { type: 'Point', coordinates: [72.8258, 18.9388] },
    capacity: 33108,
    established: 1974,
    pitchProfile: { spinFriendly: 60, paceFriendly: 50, avgFirstInningsScore: 340, characteristics: 'Batting-friendly, turns later' },
    matchesPlayed: 27
  },
  {
    name: 'Headingley Cricket Ground',
    city: 'Leeds',
    country: 'England',
    location: { type: 'Point', coordinates: [-1.5822, 53.8175] },
    capacity: 18350,
    established: 1890,
    pitchProfile: { spinFriendly: 35, paceFriendly: 75, avgFirstInningsScore: 330, characteristics: 'Seaming, pace-friendly' },
    matchesPlayed: 80
  },
  {
    name: 'The Oval',
    city: 'London',
    country: 'England',
    location: { type: 'Point', coordinates: [-0.1149, 51.4839] },
    capacity: 25500,
    established: 1845,
    pitchProfile: { spinFriendly: 55, paceFriendly: 60, avgFirstInningsScore: 345, characteristics: 'Balanced, turns on day 4-5' },
    matchesPlayed: 104
  },
  {
    name: 'Sydney Cricket Ground',
    city: 'Sydney',
    country: 'Australia',
    location: { type: 'Point', coordinates: [151.2244, -33.8915] },
    capacity: 48000,
    established: 1848,
    pitchProfile: { spinFriendly: 65, paceFriendly: 50, avgFirstInningsScore: 360, characteristics: 'Spin-friendly on day 4-5' },
    matchesPlayed: 113
  },
  {
    name: 'Newlands Cricket Ground',
    city: 'Cape Town',
    country: 'South Africa',
    location: { type: 'Point', coordinates: [18.4647, -33.9775] },
    capacity: 25000,
    established: 1888,
    pitchProfile: { spinFriendly: 30, paceFriendly: 80, avgFirstInningsScore: 320, characteristics: 'Pace and bounce, seaming' },
    matchesPlayed: 61
  },
  {
    name: 'Galle International Stadium',
    city: 'Galle',
    country: 'Sri Lanka',
    location: { type: 'Point', coordinates: [80.2167, 6.0333] },
    capacity: 35000,
    established: 1998,
    pitchProfile: { spinFriendly: 85, paceFriendly: 25, avgFirstInningsScore: 300, characteristics: 'Heavily spin-friendly' },
    matchesPlayed: 35
  },
  {
    name: 'National Stadium',
    city: 'Karachi',
    country: 'Pakistan',
    location: { type: 'Point', coordinates: [67.0682, 24.8944] },
    capacity: 34228,
    established: 1955,
    pitchProfile: { spinFriendly: 70, paceFriendly: 40, avgFirstInningsScore: 310, characteristics: 'Flat, spin-friendly' },
    matchesPlayed: 44
  },
  {
    name: 'Kensington Oval',
    city: 'Bridgetown',
    country: 'Barbados',
    location: { type: 'Point', coordinates: [-59.6197, 13.0969] },
    capacity: 28000,
    established: 1882,
    pitchProfile: { spinFriendly: 45, paceFriendly: 65, avgFirstInningsScore: 340, characteristics: 'Bouncy, pace-friendly' },
    matchesPlayed: 53
  },
  {
    name: 'Basin Reserve',
    city: 'Wellington',
    country: 'New Zealand',
    location: { type: 'Point', coordinates: [174.7833, -41.2931] },
    capacity: 11600,
    established: 1868,
    pitchProfile: { spinFriendly: 35, paceFriendly: 75, avgFirstInningsScore: 310, characteristics: 'Seaming, windy conditions' },
    matchesPlayed: 64
  },
  {
    name: 'Old Trafford',
    city: 'Manchester',
    country: 'England',
    location: { type: 'Point', coordinates: [-2.2881, 53.4564] },
    capacity: 26000,
    established: 1857,
    pitchProfile: { spinFriendly: 50, paceFriendly: 60, avgFirstInningsScore: 335, characteristics: 'Balanced, can spin' },
    matchesPlayed: 84
  },
  {
    name: 'Adelaide Oval',
    city: 'Adelaide',
    country: 'Australia',
    location: { type: 'Point', coordinates: [138.5958, -34.9158] },
    capacity: 53583,
    established: 1871,
    pitchProfile: { spinFriendly: 40, paceFriendly: 70, avgFirstInningsScore: 370, characteristics: 'Batting-friendly, pace and bounce' },
    matchesPlayed: 82
  },
  {
    name: 'The Gabba',
    city: 'Brisbane',
    country: 'Australia',
    location: { type: 'Point', coordinates: [153.0378, -27.4858] },
    capacity: 42000,
    established: 1895,
    pitchProfile: { spinFriendly: 25, paceFriendly: 85, avgFirstInningsScore: 360, characteristics: 'Fast, bouncy, pace-friendly' },
    matchesPlayed: 65
  },
  {
    name: 'Wanderers Stadium',
    city: 'Johannesburg',
    country: 'South Africa',
    location: { type: 'Point', coordinates: [28.0497, -26.1956] },
    capacity: 34000,
    established: 1956,
    pitchProfile: { spinFriendly: 30, paceFriendly: 80, avgFirstInningsScore: 330, characteristics: 'High altitude, pace and bounce' },
    matchesPlayed: 52
  },
  {
    name: 'M. Chinnaswamy Stadium',
    city: 'Bangalore',
    country: 'India',
    location: { type: 'Point', coordinates: [77.5996, 12.9789] },
    capacity: 40000,
    established: 1969,
    pitchProfile: { spinFriendly: 55, paceFriendly: 55, avgFirstInningsScore: 350, characteristics: 'Batting-friendly, balanced' },
    matchesPlayed: 24
  },
  {
    name: 'Sabina Park',
    city: 'Kingston',
    country: 'Jamaica',
    location: { type: 'Point', coordinates: [-76.7833, 17.9686] },
    capacity: 20000,
    established: 1880,
    pitchProfile: { spinFriendly: 40, paceFriendly: 70, avgFirstInningsScore: 320, characteristics: 'Bouncy, pace-friendly' },
    matchesPlayed: 50
  },
  {
    name: 'Edgbaston Cricket Ground',
    city: 'Birmingham',
    country: 'England',
    location: { type: 'Point', coordinates: [-1.9022, 52.4558] },
    capacity: 25000,
    established: 1882,
    pitchProfile: { spinFriendly: 45, paceFriendly: 65, avgFirstInningsScore: 340, characteristics: 'Balanced, good for batting' },
    matchesPlayed: 53
  },
  {
    name: 'Hagley Oval',
    city: 'Christchurch',
    country: 'New Zealand',
    location: { type: 'Point', coordinates: [172.6167, -43.5289] },
    capacity: 18000,
    established: 2014,
    pitchProfile: { spinFriendly: 30, paceFriendly: 75, avgFirstInningsScore: 320, characteristics: 'Seaming, pace-friendly' },
    matchesPlayed: 12
  },
  {
    name: 'Feroz Shah Kotla',
    city: 'Delhi',
    country: 'India',
    location: { type: 'Point', coordinates: [77.2425, 28.6386] },
    capacity: 41820,
    established: 1883,
    pitchProfile: { spinFriendly: 80, paceFriendly: 30, avgFirstInningsScore: 310, characteristics: 'Heavily spin-friendly, low bounce' },
    matchesPlayed: 34
  },
  {
    name: 'SuperSport Park',
    city: 'Centurion',
    country: 'South Africa',
    location: { type: 'Point', coordinates: [28.2294, -25.8619] },
    capacity: 22000,
    established: 1986,
    pitchProfile: { spinFriendly: 35, paceFriendly: 75, avgFirstInningsScore: 340, characteristics: 'Pace and bounce, high altitude' },
    matchesPlayed: 29
  },
  {
    name: 'Trent Bridge',
    city: 'Nottingham',
    country: 'England',
    location: { type: 'Point', coordinates: [-1.1322, 52.9369] },
    capacity: 17500,
    established: 1838,
    pitchProfile: { spinFriendly: 40, paceFriendly: 65, avgFirstInningsScore: 350, characteristics: 'Batting-friendly, some seam' },
    matchesPlayed: 65
  },
  {
    name: 'MA Chidambaram Stadium',
    city: 'Chennai',
    country: 'India',
    location: { type: 'Point', coordinates: [80.2786, 13.0628] },
    capacity: 50000,
    established: 1916,
    pitchProfile: { spinFriendly: 85, paceFriendly: 25, avgFirstInningsScore: 300, characteristics: 'Heavily spin-friendly, dry' },
    matchesPlayed: 34
  },
  {
    name: 'Rawalpindi Cricket Stadium',
    city: 'Rawalpindi',
    country: 'Pakistan',
    location: { type: 'Point', coordinates: [73.0551, 33.5989] },
    capacity: 15000,
    established: 1992,
    pitchProfile: { spinFriendly: 60, paceFriendly: 45, avgFirstInningsScore: 320, characteristics: 'Flat, batting-friendly' },
    matchesPlayed: 18
  }
];

const seedVenues = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding venues...');

    let count = 0;
    for (const venueData of venues) {
      await Venue.findOneAndUpdate(
        { name: venueData.name },
        venueData,
        { upsert: true, new: true }
      );
      count++;
    }

    console.log(`✓ Seeded ${count} venues`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding venues:', error);
    process.exit(1);
  }
};

seedVenues();
