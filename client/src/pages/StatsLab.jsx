import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, TrendingUp, Users, GitBranch } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, Legend,
  BarChart, Bar,
  PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts';
import predictionService from '../services/predictionService';
import api from '../services/api';

function StatsLab() {
  const [activeTool, setActiveTool] = useState('match');
  const [teams, setTeams] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [playerSuggestions, setPlayerSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [mlServiceHealth, setMlServiceHealth] = useState(null);

  // Forms
  const [matchForm, setMatchForm] = useState({
    team1: '', team2: '', venue: '', toss_winner: '', toss_decision: 'bat'
  });
  const [matchResult, setMatchResult] = useState(null);

  const [scoreForm, setScoreForm] = useState({
    player_name: '', venue: '', innings_num: 1
  });
  const [scoreResult, setScoreResult] = useState(null);

  const [xiForm, setXiForm] = useState({
    squad: '', conditions: 'balanced'
  });
  const [xiResult, setXiResult] = useState(null);

  const [simForm, setSimForm] = useState({ player_name: '' });
  const [simResult, setSimResult] = useState(null);
  const [hoveredPlayer, setHoveredPlayer] = useState(null);

  useEffect(() => {
    fetchTeams();
    fetchVenues();
    loadPredictionHistory();
    checkMLServiceHealth();
  }, []);

  const checkMLServiceHealth = async () => {
    try {
      const response = await fetch('http://localhost:5001/health');
      const data = await response.json();
      setMlServiceHealth(data);
    } catch (err) {
      console.error('ML service health check failed:', err);
      setMlServiceHealth({ status: 'offline', players_count: 0 });
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await api.get('/teams');
      setTeams(response.data.data || []);
    } catch (err) {
      console.error('Failed to load teams:', err);
    }
  };

  const fetchVenues = async () => {
    try {
      const response = await api.get('/venues');
      setVenues(response.data.data || []);
    } catch (err) {
      console.error('Failed to load venues:', err);
    }
  };

  const loadPredictionHistory = () => {
    try {
      const stored = sessionStorage.getItem('predictionHistory');
      if (stored) {
        setPredictionHistory(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const addToPredictionHistory = (type, input, prediction, confidence) => {
    const newPrediction = {
      id: Date.now(),
      type,
      input,
      prediction,
      confidence,
      timestamp: new Date().toISOString()
    };
    const updated = [newPrediction, ...predictionHistory].slice(0, 10);
    setPredictionHistory(updated);
    sessionStorage.setItem('predictionHistory', JSON.stringify(updated));
  };

  const searchPlayers = async (searchTerm) => {
    if (searchTerm.length < 2) {
      setPlayerSuggestions([]);
      return;
    }
    try {
      const response = await api.get('/players', {
        params: { search: searchTerm, limit: 5 }
      });
      setPlayerSuggestions(response.data.data || []);
    } catch (err) {
      console.error('Failed to search players:', err);
    }
  };

  const handleMatchPredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      console.log('Sending match prediction request:', matchForm);
      const response = await predictionService.predictMatch(matchForm);
      console.log('Match prediction response:', response);
      
      // Response structure: { success: true, data: { team1_win_probability, team2_win_probability, draw_probability } }
      const data = response.data;
      console.log('Extracted data:', data);
      
      setMatchResult(data);
      
      addToPredictionHistory(
        'MATCH',
        `${matchForm.team1} vs ${matchForm.team2}`,
        `${matchForm.team1} ${data.team1_win_probability?.toFixed(0) || '??'}%`,
        data.team1_win_probability || 75
      );
    } catch (err) {
      console.error('Match prediction error:', err);
      console.error('Error response:', err.response);
      const errorMsg = err.response?.data?.error || err.message || 'Prediction failed';
      setError(errorMsg);
      
      // Show helpful message if ML service is down
      if (errorMsg.includes('unavailable') || errorMsg.includes('ECONNREFUSED')) {
        setError('ML service is not running. Please start it with: cd ml-service && ./start.sh');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleScorePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      console.log('Sending score prediction request:', scoreForm);
      const response = await predictionService.predictScore(scoreForm);
      console.log('Score prediction response:', response);
      
      // Response structure: { success: true, data: { expected_score, min_score, max_score } }
      const data = response.data;
      console.log('Extracted data:', data);
      
      setScoreResult(data);
      addToPredictionHistory(
        'SCORE',
        scoreForm.player_name,
        `${Math.round(data.expected_score || 0)} runs`,
        85
      );
    } catch (err) {
      console.error('Score prediction error:', err);
      console.error('Error response:', err.response);
      const errorMsg = err.response?.data?.error || err.message || 'Prediction failed';
      setError(errorMsg);
      
      if (errorMsg.includes('unavailable') || errorMsg.includes('ECONNREFUSED')) {
        setError('ML service is not running. Please start it with: cd ml-service && ./start.sh');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleXIPredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const squad = xiForm.squad.split(',').map(s => s.trim()).filter(Boolean);
      console.log('Sending XI prediction request:', { squad, conditions: xiForm.conditions });
      const response = await predictionService.predictXI({ squad, conditions: xiForm.conditions });
      console.log('XI prediction response:', response);
      
      // Response structure: { success: true, data: { best_xi: [...], confidence: 85 } }
      const data = response.data;
      console.log('Extracted data:', data);
      
      setXiResult(data);
      addToPredictionHistory(
        'XI',
        `${squad.length} players`,
        '11 players selected',
        90
      );
    } catch (err) {
      console.error('XI prediction error:', err);
      console.error('Error response:', err.response);
      const errorMsg = err.response?.data?.error || err.message || 'Prediction failed';
      setError(errorMsg);
      
      if (errorMsg.includes('unavailable') || errorMsg.includes('ECONNREFUSED')) {
        setError('ML service is not running. Please start it with: cd ml-service && ./start.sh');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSimilarPredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      console.log('Sending similarity prediction request:', simForm);
      const response = await predictionService.predictSimilarPlayers(simForm);
      console.log('Similarity prediction response:', response);
      
      // Response structure: { success: true, data: { similar_players: [...], player_profile: [...] } }
      const data = response.data;
      console.log('Extracted data:', data);
      
      setSimResult(data);
      addToPredictionHistory(
        'SIM',
        simForm.player_name,
        `${data.similar_players?.length || 0} matches`,
        88
      );
    } catch (err) {
      console.error('Similarity prediction error:', err);
      console.error('Error response:', err.response);
      const errorMsg = err.response?.data?.error || err.message || 'Prediction failed';
      setError(errorMsg);
      
      if (errorMsg.includes('unavailable') || errorMsg.includes('ECONNREFUSED')) {
        setError('ML service is not running. Please start it with: cd ml-service && ./start.sh');
      }
    } finally {
      setLoading(false);
    }
  };

  const performanceData = [
    { condition: 'Home', accuracy: 78, score_mae: 21 },
    { condition: 'Away', accuracy: 69, score_mae: 26 },
    { condition: 'Neutral', accuracy: 71, score_mae: 24 },
    { condition: 'D/N', accuracy: 74, score_mae: 22 },
    { condition: 'Spin', accuracy: 76, score_mae: 20 },
    { condition: 'Pace', accuracy: 72, score_mae: 25 },
    { condition: 'High', accuracy: 68, score_mae: 28 },
    { condition: 'Low', accuracy: 75, score_mae: 19 },
  ];

  const modelBreakdownData = [
    { name: 'Match', value: 73.79 },
    { name: 'Score', value: 68.5 },
    { name: 'XI', value: 82.3 },
    { name: 'Similarity', value: 91.2 },
  ];

  const sparklineData = [65, 68, 71, 69, 73, 75, 74, 73.79];

  const generateBellCurve = (expected, min, max) => {
    const data = [];
    for (let i = 0; i <= 200; i += 10) {
      const distance = Math.abs(i - expected);
      const y = Math.exp(-Math.pow(distance / 30, 2)) * 100;
      data.push({ score: i, probability: y });
    }
    return data;
  };

  const getFieldPosition = (index) => {
    const positions = [
      { x: 50, y: 15 }, { x: 50, y: 25 }, { x: 30, y: 35 },
      { x: 70, y: 35 }, { x: 50, y: 45 }, { x: 35, y: 55 },
      { x: 65, y: 55 }, { x: 50, y: 70 }, { x: 30, y: 80 },
      { x: 50, y: 85 }, { x: 70, y: 80 }
    ];
    return positions[index] || { x: 50, y: 50 };
  };

  const getTimeAgo = (timestamp) => {
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Grid Background */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(rgba(201,168,76,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(201,168,76,0.025) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }} />

      <div className="relative z-10 px-10 py-20">
        {/* Page Header */}
        <div className="mb-8">
          <div className="text-accent font-mono text-xs tracking-[0.4em] mb-2">
            DATA OBSERVATORY
          </div>
          <div className="text-primary/60 text-sm">
            AI-Powered Cricket Analytics
          </div>
        </div>

        {/* Row 1: 3 Stat Cards */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          {/* Card 1: Match Predictor */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0 }}
            className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-7 flex items-center justify-between"
          >
            <div>
              <div className="text-primary/60 text-xs uppercase mb-2">Match Predictor Accuracy</div>
              <motion.div
                className="font-mono text-5xl text-primary mb-1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
              >
                73.79%
              </motion.div>
              <div className="text-primary/60 text-xs mb-1">Cross-validated on 898 matches</div>
              <div className="text-accent text-xs">+5.2% vs baseline</div>
            </div>
            <svg width="100" height="40" viewBox="0 0 100 40">
              <motion.polyline
                points={sparklineData.map((v, i) => `${(i / 7) * 100},${40 - (v / 100) * 40}`).join(' ')}
                fill="none"
                stroke="#C9A84C"
                strokeWidth="1.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: 0.3 }}
              />
            </svg>
          </motion.div>

          {/* Card 2: Score Predictor */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-7 flex items-center justify-between"
          >
            <div>
              <div className="text-primary/60 text-xs uppercase mb-2">Score Predictor MAE</div>
              <motion.div
                className="font-mono text-5xl text-primary mb-1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.3 }}
              >
                23.5
              </motion.div>
              <div className="text-primary/60 text-xs mb-1">runs mean absolute error</div>
              <div className="text-accent text-xs">R² score: 0.130</div>
            </div>
            <svg width="100" height="40" viewBox="0 0 100 40">
              <motion.polyline
                points="0,30 14,25 28,28 42,22 56,20 70,23 84,19 100,18"
                fill="none"
                stroke="#C9A84C"
                strokeWidth="1.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: 0.4 }}
              />
            </svg>
          </motion.div>

          {/* Card 3: Player Similarity */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-7 flex items-center justify-between"
          >
            <div>
              <div className="text-primary/60 text-xs uppercase mb-2">Players Indexed</div>
              <motion.div
                className="font-mono text-5xl text-primary mb-1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.4 }}
              >
                {mlServiceHealth?.players_count?.toLocaleString() || '1,025'}
              </motion.div>
              <div className="text-primary/60 text-xs mb-1">Similarity vectors computed</div>
              <div className="text-accent text-xs">Cosine similarity engine</div>
            </div>
            <svg width="100" height="40" viewBox="0 0 100 40">
              <motion.polyline
                points="0,35 14,32 28,30 42,28 56,25 70,22 84,20 100,18"
                fill="none"
                stroke="#C9A84C"
                strokeWidth="1.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: 0.5 }}
              />
            </svg>
          </motion.div>
        </div>

        {/* Row 2: Main Chart + Right Panel */}
        <div className="grid grid-cols-[65%_35%] gap-4 mb-4">
          {/* Main Chart Panel */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-7">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-primary text-sm mb-2">Model Performance Overview</div>
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-3xl text-accent">+73.79%</span>
                  <span className="text-primary/60 text-xs">Match prediction accuracy</span>
                </div>
              </div>
              <select className="bg-white/[0.02] border border-white/[0.06] rounded-lg px-4 py-2 text-primary text-xs outline-none">
                <option>All Models</option>
                <option>Match Predictor</option>
                <option>Score Predictor</option>
              </select>
            </div>

            <AreaChart width={750} height={280} data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C9A84C" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#C9A84C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="condition"
                stroke="rgba(107,107,122,1)"
                tick={{ fill: '#6B6B7A', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                stroke="rgba(107,107,122,1)"
                tick={{ fill: '#6B6B7A', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={35}
              />
              <Tooltip
                contentStyle={{
                  background: 'rgba(10,10,15,0.95)',
                  border: '1px solid rgba(201,168,76,0.2)',
                  borderRadius: '8px',
                  padding: '12px'
                }}
                labelStyle={{ color: '#C9A84C' }}
                itemStyle={{ color: '#E8D5B0' }}
              />
              <Area
                type="monotone"
                dataKey="accuracy"
                stroke="#C9A84C"
                strokeWidth={2}
                fill="url(#accuracyGradient)"
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="score_mae"
                stroke="rgba(232,213,176,0.3)"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fill="none"
                dot={false}
              />
            </AreaChart>

            <div className="flex items-center justify-center gap-6 mt-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent" />
                <span className="text-primary/60">Match Accuracy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary/30" />
                <span className="text-primary/60">Score MAE (inv)</span>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 flex flex-col gap-5">
            {/* Model Breakdown */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="text-primary text-xs">Model Breakdown</div>
                <div className="text-primary/60 text-[10px]">4 active models</div>
              </div>
              <div className="mb-3">
                <div className="font-mono text-4xl text-accent">4</div>
                <div className="text-primary/60 text-[10px]">ML Models Active</div>
              </div>
              <BarChart width={280} height={120} data={modelBreakdownData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: '#6B6B7A', fontSize: 9 }} axisLine={false} tickLine={false} />
                <Bar dataKey="value" fill="#C9A84C" radius={[4, 4, 0, 0]} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(10,10,15,0.95)',
                    border: '1px solid rgba(201,168,76,0.2)',
                    borderRadius: '8px',
                    padding: '8px'
                  }}
                />
              </BarChart>
              <div className="text-primary/60 text-xs italic mt-3">
                Heavier performance on home match predictions
              </div>
            </div>

            {/* Model Insights */}
            <div>
              <div className="text-primary text-xs mb-3">Model Insights</div>
              <div className="space-y-0">
                {[
                  { icon: Target, name: 'Match Predictor', insight: 'India home advantage: +8.2%', tool: 'match' },
                  { icon: TrendingUp, name: 'Score Predictor', insight: 'Avg predicted score: 287 runs', tool: 'score' },
                  { icon: Users, name: 'Similarity Engine', insight: `${mlServiceHealth?.players_count?.toLocaleString() || '1,025'} players mapped`, tool: 'similar' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-3 border-b border-white/[0.04] hover:bg-accent/[0.03] transition-colors cursor-pointer px-2 -mx-2"
                    onClick={() => setActiveTool(item.tool)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                        <item.icon size={14} className="text-accent" />
                      </div>
                      <div>
                        <div className="text-primary text-sm">{item.name}</div>
                        <div className="text-primary/60 text-[10px]">{item.insight}</div>
                      </div>
                    </div>
                    <button className="text-accent text-xs border border-accent/30 px-3 py-1 rounded hover:bg-accent/10 transition-colors">
                      View
                    </button>
                  </div>
                ))}
              </div>
              <button
                className="text-accent text-xs mt-4 hover:underline"
                onClick={() => document.getElementById('prediction-tools').scrollIntoView({ behavior: 'smooth' })}
              >
                + Run New Prediction
              </button>
            </div>
          </div>
        </div>

        {/* Row 3: Prediction Tools */}
        <div id="prediction-tools" className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-7 mb-4">
          {/* Tab Bar */}
          <div className="flex gap-6 border-b border-white/[0.06] mb-8">
            {[
              { id: 'match', label: 'Match Predictor' },
              { id: 'score', label: 'Score Predictor' },
              { id: 'xi', label: 'Best XI Builder' },
              { id: 'similar', label: 'Player Similarity' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTool(tab.id);
                  setError(null);
                  if (tab.id === 'match') setMatchResult(null);
                  if (tab.id === 'score') setScoreResult(null);
                  if (tab.id === 'xi') setXiResult(null);
                  if (tab.id === 'similar') setSimResult(null);
                }}
                className="relative pb-3 text-sm transition-colors"
                style={{ color: activeTool === tab.id ? '#E8D5B0' : 'rgba(232,213,176,0.6)' }}
              >
                {tab.label}
                {activeTool === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tool Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTool}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-[45%_55%] gap-12"
            >
              {/* LEFT: Form */}
              <div>
                {activeTool === 'match' && (
                  <div>
                    <h2 className="font-display text-4xl text-primary mb-2">MATCH PREDICTOR</h2>
                    <p className="text-primary/60 text-xs mb-6">Predict any Test match outcome</p>
                    <form onSubmit={handleMatchPredict} className="space-y-7">
                      <div>
                        <label className="block text-accent font-mono text-[9px] uppercase tracking-[0.2em] mb-2">Team 1</label>
                        <select
                          value={matchForm.team1}
                          onChange={(e) => setMatchForm({ ...matchForm, team1: e.target.value })}
                          required
                          className="w-full bg-transparent border-none border-b border-white/10 pb-2 text-primary text-sm focus:border-accent outline-none"
                        >
                          <option value="">Select Team 1</option>
                          {teams.map((team) => (
                            <option key={team._id} value={team.name}>{team.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-accent font-mono text-[9px] uppercase tracking-[0.2em] mb-2">Team 2</label>
                        <select
                          value={matchForm.team2}
                          onChange={(e) => setMatchForm({ ...matchForm, team2: e.target.value })}
                          required
                          className="w-full bg-transparent border-none border-b border-white/10 pb-2 text-primary text-sm focus:border-accent outline-none"
                        >
                          <option value="">Select Team 2</option>
                          {teams.map((team) => (
                            <option key={team._id} value={team.name}>{team.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-accent font-mono text-[9px] uppercase tracking-[0.2em] mb-2">Venue</label>
                        <select
                          value={matchForm.venue}
                          onChange={(e) => setMatchForm({ ...matchForm, venue: e.target.value })}
                          required
                          className="w-full bg-transparent border-none border-b border-white/10 pb-2 text-primary text-sm focus:border-accent outline-none"
                        >
                          <option value="">Select Venue</option>
                          {venues.map((venue) => (
                            <option key={venue._id} value={venue.name}>{venue.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-accent font-mono text-[9px] uppercase tracking-[0.2em] mb-2">Toss Winner</label>
                        <select
                          value={matchForm.toss_winner}
                          onChange={(e) => setMatchForm({ ...matchForm, toss_winner: e.target.value })}
                          required
                          className="w-full bg-transparent border-none border-b border-white/10 pb-2 text-primary text-sm focus:border-accent outline-none"
                        >
                          <option value="">Select Toss Winner</option>
                          {teams.filter(t => t.name === matchForm.team1 || t.name === matchForm.team2).map((team) => (
                            <option key={team._id} value={team.name}>{team.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-accent font-mono text-[9px] uppercase tracking-[0.2em] mb-2">Toss Decision</label>
                        <div className="flex gap-2">
                          {['bat', 'field'].map((decision) => (
                            <button
                              key={decision}
                              type="button"
                              onClick={() => setMatchForm({ ...matchForm, toss_decision: decision })}
                              className={`flex-1 py-2 rounded font-mono text-xs uppercase ${
                                matchForm.toss_decision === decision
                                  ? 'bg-accent text-background'
                                  : 'bg-primary/5 text-primary/60 border border-primary/20'
                              }`}
                            >
                              {decision}
                            </button>
                          ))}
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 bg-accent text-background font-mono text-xs tracking-[0.25em] hover:bg-[#FFD700] disabled:opacity-50 transition-all"
                      >
                        {loading ? 'PROCESSING...' : 'INITIATE PREDICTION'}
                      </button>
                    </form>
                  </div>
                )}

                {activeTool === 'score' && (
                  <div>
                    <h2 className="font-display text-4xl text-primary mb-2">SCORE PREDICTOR</h2>
                    <p className="text-primary/60 text-xs mb-6">Calculate expected score range</p>
                    <form onSubmit={handleScorePredict} className="space-y-7">
                      <div className="relative">
                        <label className="block text-accent font-mono text-[9px] uppercase tracking-[0.2em] mb-2">Player Name</label>
                        <input
                          type="text"
                          placeholder="Start typing..."
                          value={scoreForm.player_name}
                          onChange={(e) => {
                            setScoreForm({ ...scoreForm, player_name: e.target.value });
                            searchPlayers(e.target.value);
                            setShowSuggestions(true);
                          }}
                          onFocus={() => setShowSuggestions(true)}
                          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                          required
                          className="w-full bg-transparent border-none border-b border-white/10 pb-2 text-primary text-sm focus:border-accent outline-none"
                        />
                        {showSuggestions && playerSuggestions.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-background/95 backdrop-blur-sm border border-accent/30 rounded-lg shadow-2xl max-h-48 overflow-y-auto">
                            {playerSuggestions.map((player) => (
                              <div
                                key={player._id}
                                onClick={() => {
                                  setScoreForm({ ...scoreForm, player_name: player.name });
                                  setShowSuggestions(false);
                                }}
                                className="px-4 py-2 hover:bg-accent/20 cursor-pointer border-b border-primary/10 last:border-0"
                              >
                                <div className="text-primary text-sm">{player.name}</div>
                                <div className="text-primary/60 text-xs font-mono">
                                  AVG: {player.battingAverage?.toFixed(1) || 'N/A'}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-accent font-mono text-[9px] uppercase tracking-[0.2em] mb-2">Venue (Optional)</label>
                        <select
                          value={scoreForm.venue}
                          onChange={(e) => setScoreForm({ ...scoreForm, venue: e.target.value })}
                          className="w-full bg-transparent border-none border-b border-white/10 pb-2 text-primary text-sm focus:border-accent outline-none"
                        >
                          <option value="">Select Venue</option>
                          {venues.map((venue) => (
                            <option key={venue._id} value={venue.name}>{venue.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-accent font-mono text-[9px] uppercase tracking-[0.2em] mb-2">Innings</label>
                        <div className="grid grid-cols-4 gap-2">
                          {[1, 2, 3, 4].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => setScoreForm({ ...scoreForm, innings_num: num })}
                              className={`py-2 rounded font-mono text-xs ${
                                scoreForm.innings_num === num
                                  ? 'bg-accent text-background'
                                  : 'bg-primary/5 text-primary/60 border border-primary/20'
                              }`}
                            >
                              {num}{num === 1 ? 'st' : num === 2 ? 'nd' : num === 3 ? 'rd' : 'th'}
                            </button>
                          ))}
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 bg-accent text-background font-mono text-xs tracking-[0.25em] hover:bg-[#FFD700] disabled:opacity-50 transition-all"
                      >
                        {loading ? 'PROCESSING...' : 'CALCULATE RANGE'}
                      </button>
                    </form>
                  </div>
                )}

                {activeTool === 'xi' && (
                  <div>
                    <h2 className="font-display text-4xl text-primary mb-2">BEST XI BUILDER</h2>
                    <p className="text-primary/60 text-xs mb-6">Optimize team selection</p>
                    <form onSubmit={handleXIPredict} className="space-y-7">
                      <div>
                        <label className="block text-accent font-mono text-[9px] uppercase tracking-[0.2em] mb-2">Squad (15 Players)</label>
                        <textarea
                          placeholder="Enter comma-separated player names"
                          value={xiForm.squad}
                          onChange={(e) => setXiForm({ ...xiForm, squad: e.target.value })}
                          required
                          rows="5"
                          className="w-full bg-transparent border-none border-b border-white/10 pb-2 text-primary text-sm focus:border-accent outline-none font-mono resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-accent font-mono text-[9px] uppercase tracking-[0.2em] mb-2">Conditions</label>
                        <div className="flex flex-wrap gap-2">
                          {['balanced', 'spin', 'pace', 'batting', 'bowling'].map((cond) => (
                            <button
                              key={cond}
                              type="button"
                              onClick={() => setXiForm({ ...xiForm, conditions: cond })}
                              className={`px-4 py-2 rounded font-mono text-xs uppercase ${
                                xiForm.conditions === cond
                                  ? 'bg-accent text-background'
                                  : 'bg-primary/5 text-primary/60 border border-primary/20'
                              }`}
                            >
                              {cond}
                            </button>
                          ))}
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 bg-accent text-background font-mono text-xs tracking-[0.25em] hover:bg-[#FFD700] disabled:opacity-50 transition-all"
                      >
                        {loading ? 'PROCESSING...' : 'ASSEMBLE XI'}
                      </button>
                    </form>
                  </div>
                )}

                {activeTool === 'similar' && (
                  <div>
                    <h2 className="font-display text-4xl text-primary mb-2">PLAYER SIMILARITY</h2>
                    <p className="text-primary/60 text-xs mb-6">Find comparable players</p>
                    <form onSubmit={handleSimilarPredict} className="space-y-7">
                      <div className="relative">
                        <label className="block text-accent font-mono text-[9px] uppercase tracking-[0.2em] mb-2">Player Name</label>
                        <input
                          type="text"
                          placeholder="Start typing..."
                          value={simForm.player_name}
                          onChange={(e) => {
                            setSimForm({ ...simForm, player_name: e.target.value });
                            searchPlayers(e.target.value);
                            setShowSuggestions(true);
                          }}
                          onFocus={() => setShowSuggestions(true)}
                          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                          required
                          className="w-full bg-transparent border-none border-b border-white/10 pb-2 text-primary text-sm focus:border-accent outline-none"
                        />
                        {showSuggestions && playerSuggestions.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-background/95 backdrop-blur-sm border border-accent/30 rounded-lg shadow-2xl max-h-48 overflow-y-auto">
                            {playerSuggestions.map((player) => (
                              <div
                                key={player._id}
                                onClick={() => {
                                  setSimForm({ ...simForm, player_name: player.name });
                                  setShowSuggestions(false);
                                }}
                                className="px-4 py-2 hover:bg-accent/20 cursor-pointer border-b border-primary/10 last:border-0"
                              >
                                <div className="text-primary text-sm">{player.name}</div>
                                <div className="text-primary/60 text-xs">{player.country}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 bg-accent text-background font-mono text-xs tracking-[0.25em] hover:bg-[#FFD700] disabled:opacity-50 transition-all"
                      >
                        {loading ? 'PROCESSING...' : 'FIND MATCHES'}
                      </button>
                    </form>
                  </div>
                )}
              </div>

              {/* RIGHT: Results */}
              <div className="min-h-[400px] flex items-center justify-center">
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <div className="text-red-400 text-sm">{error}</div>
                  </div>
                )}

                {!error && activeTool === 'match' && matchResult && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-display text-3xl text-primary mb-2">{matchForm.team1}</div>
                        <motion.div
                          className="font-mono text-7xl text-accent"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          {matchResult.team1_win_probability?.toFixed(0)}%
                        </motion.div>
                      </div>
                      <div className="font-display text-base italic text-accent px-6 pt-8">VS</div>
                      <div className="flex-1 text-right">
                        <div className="font-display text-3xl text-primary mb-2">{matchForm.team2}</div>
                        <motion.div
                          className="font-mono text-7xl text-primary/40"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          {matchResult.team2_win_probability?.toFixed(0)}%
                        </motion.div>
                      </div>
                    </div>

                    <motion.div
                      className="relative h-1.5 bg-primary/10 rounded-full"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                    >
                      <div
                        className="absolute left-0 top-0 h-full bg-accent rounded-full"
                        style={{ width: `${matchResult.team1_win_probability}%` }}
                      />
                    </motion.div>

                    <div className="flex justify-center pt-4">
                      <PieChart width={160} height={160}>
                        <Pie
                          data={[
                            { value: matchResult.team1_win_probability || 0 },
                            { value: matchResult.team2_win_probability || 0 },
                            { value: matchResult.draw_probability || 0 },
                          ]}
                          cx={80}
                          cy={80}
                          innerRadius={45}
                          outerRadius={70}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          <Cell fill="#C9A84C" />
                          <Cell fill="rgba(232,213,176,0.25)" />
                          <Cell fill="rgba(255,255,255,0.08)" />
                        </Pie>
                      </PieChart>
                    </div>
                    <div className="text-center">
                      <div className="text-accent text-xl font-mono">{matchResult.draw_probability?.toFixed(1)}%</div>
                      <div className="text-primary/60 text-xs">Draw Probability</div>
                    </div>
                  </motion.div>
                )}

                {!error && activeTool === 'score' && scoreResult && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: 'MIN', value: scoreResult.min_score, color: 'text-primary/60' },
                        { label: 'EXPECTED', value: scoreResult.expected_score, color: 'text-accent' },
                        { label: 'MAX', value: scoreResult.max_score, color: 'text-primary/60' },
                      ].map((stat, i) => (
                        <div key={stat.label} className="text-center">
                          <div className="text-accent text-[9px] font-mono tracking-wider mb-2">{stat.label}</div>
                          <motion.div
                            className={`font-mono text-7xl ${stat.color}`}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                          >
                            {Math.round(stat.value || 0)}
                          </motion.div>
                          <div className="text-primary/40 text-sm mt-1">runs</div>
                        </div>
                      ))}
                    </div>

                    <AreaChart
                      width={550}
                      height={140}
                      data={generateBellCurve(
                        scoreResult.expected_score || 50,
                        scoreResult.min_score || 0,
                        scoreResult.max_score || 100
                      )}
                      margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                    >
                      <defs>
                        <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#C9A84C" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#C9A84C" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="probability"
                        stroke="#C9A84C"
                        strokeWidth={2}
                        fill="url(#scoreGrad)"
                      />
                    </AreaChart>
                  </motion.div>
                )}

                {!error && activeTool === 'xi' && xiResult && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-8">
                    <div className="flex items-center justify-center">
                      <div className="relative" style={{ width: 260, height: 320 }}>
                        <div
                          className="absolute inset-0 border border-primary/12"
                          style={{
                            borderRadius: '50%',
                            background: 'radial-gradient(ellipse at center, rgba(15,30,15,0.4) 0%, rgba(10,10,15,0) 70%)',
                          }}
                        >
                          <div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-primary/20"
                            style={{ width: 30, height: 90, background: 'rgba(20,30,15,0.4)' }}
                          />
                          {xiResult.best_xi?.slice(0, 11).map((player, i) => {
                            const pos = getFieldPosition(i);
                            const isBatsman = i < 6;
                            const isAllrounder = i === 7;
                            return (
                              <motion.div
                                key={i}
                                className="absolute"
                                style={{
                                  left: `${pos.x}%`,
                                  top: `${pos.y}%`,
                                  transform: 'translate(-50%, -50%)',
                                }}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: i * 0.08 }}
                              >
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{
                                    background: isBatsman
                                      ? '#C9A84C'
                                      : isAllrounder
                                      ? 'linear-gradient(135deg, #C9A84C 0%, rgba(232,213,176,0.5) 100%)'
                                      : 'rgba(232,213,176,0.5)',
                                  }}
                                />
                                <div className="absolute left-3 top-0 whitespace-nowrap text-[9px] font-mono text-primary/80">
                                  {typeof player === 'string' ? player : player.name}
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {xiResult.best_xi?.slice(0, 11).map((player, i) => (
                        <motion.div
                          key={i}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: i * 0.08 }}
                          className="flex items-center gap-3"
                        >
                          <span className="font-mono text-xl text-accent opacity-50 w-6">{i + 1}</span>
                          <span className="text-primary text-sm flex-1">
                            {typeof player === 'string' ? player : player.name}
                          </span>
                          <span className="px-2 py-1 rounded border border-accent/30 text-accent text-[9px] font-mono">
                            {typeof player === 'object' && player.role
                              ? player.role
                              : i < 6
                              ? 'BAT'
                              : i === 7
                              ? 'ALL'
                              : 'BOWL'}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {!error && activeTool === 'similar' && simResult && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                    <div className="text-center">
                      <div className="font-display text-2xl text-primary mb-4">{simForm.player_name}</div>
                      <RadarChart width={260} height={260} data={simResult.player_profile || []}>
                        <PolarGrid stroke="rgba(255,255,255,0.06)" />
                        <PolarAngleAxis dataKey="metric" tick={{ fill: 'rgba(232,213,176,0.6)', fontSize: 10 }} />
                        <Radar dataKey="value" stroke="#C9A84C" fill="rgba(201,168,76,0.15)" strokeWidth={2} />
                        {hoveredPlayer && hoveredPlayer.profile && (
                          <Radar
                            dataKey="value"
                            data={hoveredPlayer.profile}
                            stroke="rgba(232,213,176,0.3)"
                            fill="rgba(232,213,176,0.08)"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                          />
                        )}
                      </RadarChart>
                    </div>

                    <div className="flex gap-4 justify-between">
                      {simResult.similar_players?.slice(0, 5).map((player, i) => {
                        const circumference = 2 * Math.PI * 32;
                        const similarity = player.similarity_score || 0;
                        const offset = circumference - (similarity / 100) * circumference;
                        return (
                          <motion.div
                            key={i}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: i * 0.15 }}
                            className="text-center cursor-pointer"
                            onMouseEnter={() => setHoveredPlayer(player)}
                            onMouseLeave={() => setHoveredPlayer(null)}
                          >
                            <svg width="80" height="80" viewBox="0 0 80 80" className="mb-2">
                              <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                              <motion.circle
                                cx="40"
                                cy="40"
                                r="32"
                                fill="none"
                                stroke="#C9A84C"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                initial={{ strokeDashoffset: circumference }}
                                animate={{ strokeDashoffset: offset }}
                                transition={{ duration: 1, delay: i * 0.15 }}
                                transform="rotate(-90 40 40)"
                              />
                              <text x="40" y="45" textAnchor="middle" className="font-mono text-sm fill-accent">
                                {similarity.toFixed(0)}%
                              </text>
                            </svg>
                            <div className="text-primary text-sm mb-1">{player.name}</div>
                            <div className="text-primary/60 text-[10px] font-mono">
                              AVG: {player.batting_average?.toFixed(1) || 'N/A'}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {!error && !matchResult && !scoreResult && !xiResult && !simResult && !loading && (
                  <div className="h-full flex flex-col items-center justify-center">
                    <div className="text-primary/60 text-xs mb-8">AWAITING INPUT</div>
                    <div className="opacity-[0.08]">
                      <RadarChart width={150} height={150} data={[
                        { metric: 'A', value: 65 }, { metric: 'B', value: 78 },
                        { metric: 'C', value: 45 }, { metric: 'D', value: 89 },
                      ]}>
                        <PolarGrid stroke="rgba(201,168,76,0.3)" />
                        <Radar dataKey="value" stroke="rgba(201,168,76,0.5)" fill="rgba(201,168,76,0.1)" />
                      </RadarChart>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Row 4: Recent Predictions Table */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-7">
          <div className="flex items-center justify-between mb-6">
            <div className="text-primary text-sm">Recent Predictions</div>
            <input
              type="text"
              placeholder="Search predictions..."
              className="bg-white/[0.02] border border-white/[0.06] rounded-lg px-4 py-2 text-primary text-xs outline-none w-64"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left py-3 text-accent text-[9px] font-mono uppercase tracking-[0.1em]">Type</th>
                  <th className="text-left py-3 text-accent text-[9px] font-mono uppercase tracking-[0.1em]">Input</th>
                  <th className="text-left py-3 text-accent text-[9px] font-mono uppercase tracking-[0.1em]">Prediction</th>
                  <th className="text-left py-3 text-accent text-[9px] font-mono uppercase tracking-[0.1em]">Confidence</th>
                  <th className="text-right py-3 text-accent text-[9px] font-mono uppercase tracking-[0.1em]">Time</th>
                </tr>
              </thead>
              <tbody>
                {predictionHistory.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-primary/60 text-xs">
                      No predictions yet. Run a prediction above to see results here.
                    </td>
                  </tr>
                ) : (
                  predictionHistory.map((pred) => (
                    <tr
                      key={pred.id}
                      className="border-b border-white/[0.04] hover:bg-accent/[0.04] transition-colors"
                    >
                      <td className="py-3">
                        <span className={`px-3 py-1 rounded text-[10px] font-mono ${
                          pred.type === 'MATCH' ? 'bg-accent/20 text-accent' :
                          pred.type === 'SCORE' ? 'bg-primary/20 text-primary' :
                          pred.type === 'XI' ? 'bg-accent/10 text-accent' :
                          'bg-primary/10 text-primary'
                        }`}>
                          {pred.type}
                        </span>
                      </td>
                      <td className="py-3 text-primary text-sm">{pred.input}</td>
                      <td className="py-3 text-accent text-sm font-mono">{pred.prediction}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-primary/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-accent rounded-full"
                              style={{ width: `${pred.confidence}%` }}
                            />
                          </div>
                          <span className="text-primary/60 text-xs font-mono">{pred.confidence}%</span>
                        </div>
                      </td>
                      <td className="py-3 text-right text-primary/60 text-xs">{getTimeAgo(pred.timestamp)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatsLab;
