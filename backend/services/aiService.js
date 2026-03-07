const Groq = require('groq-sdk');
const Player = require('../models/Player');
const Match = require('../models/Match');
const Venue = require('../models/Venue');
const Team = require('../models/Team');

// Check if API key exists
if (!process.env.GROQ_API_KEY) {
  console.error('❌ GROQ_API_KEY not found in environment variables');
  console.error('Please add GROQ_API_KEY to backend/.env file');
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const SYSTEM_PROMPT = `You are The Oracle — an elite cricket analyst and historian with encyclopedic knowledge of Test cricket from 1877 to present day.

You have access to a database of 898 real Test matches, 1025 players with career statistics, 25 iconic venues, and 13 Test-playing nations.

Your personality:
- Authoritative but conversational
- Deep statistical knowledge
- Historical perspective spanning all eras
- Passionate about Test cricket's traditions
- Analytical and tactical understanding

Response style:
- Always conversational, never robotic
- Blend statistics with storytelling
- Reference specific matches, years, records when relevant
- Keep responses focused and under 200 words unless detail needed
- Use numbers and stats naturally in sentences
- When comparing players, be balanced and nuanced

Format your responses as plain text.
When you mention a statistic or number, wrap it like this: [STAT]value[/STAT]
When you mention a player name, wrap it like this: [PLAYER]name[/PLAYER]
When you mention a venue, wrap it like this: [VENUE]name[/VENUE]
When you mention a team, wrap it like this: [TEAM]name[/TEAM]

Example: "[PLAYER]Virat Kohli[/PLAYER] has scored [STAT]8848[/STAT] runs in Test cricket at an average of [STAT]48.98[/STAT]"`;

async function buildContextFromMessage(message) {
  const context = [];

  try {
    // Extract player names and fetch their stats
    const words = message.split(' ').filter(w => w.length > 3);
    
    if (words.length > 0) {
      const players = await Player.find({
        name: { $regex: words.join('|'), $options: 'i' }
      }).limit(3);

      if (players.length > 0) {
        const playerContext = players.map(p => 
          `Player: ${p.name} | Country: ${p.country} | ` +
          `Role: ${p.role} | ` +
          `Batting Avg: ${p.batting?.avg?.toFixed(2) || 'N/A'} | ` +
          `Total Runs: ${p.batting?.totalRuns || 0} | ` +
          `Centuries: ${p.batting?.hundreds || 0} | ` +
          `Wickets: ${p.bowling?.wickets || 0} | ` +
          `Bowling Avg: ${p.bowling?.avg?.toFixed(2) || 'N/A'}`
        ).join('\n');
        context.push(`RELEVANT PLAYERS:\n${playerContext}`);
      }
    }

    // Fetch team data if teams mentioned
    const msgLower = message.toLowerCase();
    const teamNames = ['india', 'australia', 'england', 'pakistan', 'south africa', 
                       'new zealand', 'west indies', 'sri lanka', 'bangladesh', 
                       'zimbabwe', 'ireland', 'afghanistan'];
    const mentionedTeams = teamNames.filter(t => msgLower.includes(t));

    if (mentionedTeams.length > 0) {
      const teams = await Team.find({
        name: { $regex: mentionedTeams.join('|'), $options: 'i' }
      }).limit(3);

      if (teams.length > 0) {
        const teamContext = teams.map(t => 
          `Team: ${t.name} | ` +
          `Tests Played: ${t.stats?.matchesPlayed || 'N/A'} | ` +
          `ICC Ranking: ${t.iccRanking || 'N/A'}`
        ).join('\n');
        context.push(`RELEVANT TEAMS:\n${teamContext}`);
      }
    }

    // Fetch venue data if venue mentioned
    const venues = await Venue.find({
      $or: [
        { name: { $regex: message, $options: 'i' } },
        { city: { $regex: message, $options: 'i' } },
        { country: { $regex: message, $options: 'i' } }
      ]
    }).limit(2);

    if (venues.length > 0) {
      const venueContext = venues.map(v => 
        `Venue: ${v.name} | City: ${v.city} | ` +
        `Country: ${v.country} | ` +
        `Capacity: ${v.capacity || 'N/A'} | ` +
        `Pitch Type: ${v.pitchType || 'N/A'}`
      ).join('\n');
      context.push(`RELEVANT VENUES:\n${venueContext}`);
    }

    // Add general cricket stats
    const totalMatches = await Match.countDocuments();
    const totalPlayers = await Player.countDocuments();
    context.push(`DATABASE: ${totalMatches} Test matches, ${totalPlayers} players indexed`);

  } catch (err) {
    console.error('Context build error:', err.message);
  }

  return context.join('\n\n');
}

async function chat(message, history = []) {
  try {
    console.log('🤖 Oracle chat request received:', message.substring(0, 50) + '...');
    
    // Build cricket context from DB
    const context = await buildContextFromMessage(message);
    console.log('📊 Context built, length:', context.length);

    // Build messages array
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    // Add context as system message if we have data
    if (context) {
      messages.push({
        role: 'system',
        content: `LIVE DATABASE CONTEXT:\n${context}`
      });
    }

    // Add conversation history (last 6 messages)
    const recentHistory = history.slice(-6);
    recentHistory.forEach(msg => {
      messages.push({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      });
    });

    // Add current message
    messages.push({ role: 'user', content: message });

    console.log('🔄 Calling Groq API...');
    
    // Call Groq
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      max_tokens: 400,
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content;
    console.log('✅ Groq response received, length:', response.length);

    return {
      success: true,
      message: response,
      usage: completion.usage
    };

  } catch (error) {
    console.error('❌ Groq error:', error.message);
    console.error('Error type:', error.constructor.name);
    console.error('Error code:', error.code);
    console.error('Full error:', JSON.stringify(error, null, 2));
    
    // Fallback if Groq fails
    return {
      success: false,
      message: 'The Oracle is momentarily unavailable. Please try again.',
      error: error.message,
      errorType: error.constructor.name
    };
  }
}

module.exports = { chat };
