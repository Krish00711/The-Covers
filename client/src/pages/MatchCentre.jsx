import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import matchService from '../services/matchService';
import liveService from '../services/liveService';

function MatchCentre() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featured, setFeatured] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [liveMatches, setLiveMatches] = useState([]);
  const [h2h, setH2h] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerTarget = useRef(null);

  // Scramble text effect for team names
  const [displayTeam1, setDisplayTeam1] = useState('');
  const [displayTeam2, setDisplayTeam2] = useState('');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  useEffect(() => {
    if (!featured) return;
    const team1Name = featured.team1?.name || featured.teams?.[0] || '';
    const team2Name = featured.team2?.name || featured.teams?.[1] || '';
    
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayTeam1(
        team1Name.split('').map((letter, index) => {
          if (index < iteration) return team1Name[index];
          return chars[Math.floor(Math.random() * chars.length)];
        }).join('')
      );
      setDisplayTeam2(
        team2Name.split('').map((letter, index) => {
          if (index < iteration) return team2Name[index];
          return chars[Math.floor(Math.random() * chars.length)];
        }).join('')
      );
      if (iteration >= Math.max(team1Name.length, team2Name.length)) clearInterval(interval);
      iteration += 1 / 3;
    }, 30);
    return () => clearInterval(interval);
  }, [featured]);

  // Fetch matches based on active tab
  const fetchMatches = useCallback(async (pageNum = 1, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    
    try {
      let response;
      if (activeTab === 'live') {
        response = await liveService.getLiveMatches();
        const liveData = response.data || [];
        setMatches(liveData);
        setLiveMatches(liveData);
        setHasMore(false);
        
        if (!featured && liveData.length > 0) {
          setFeatured(liveData[0]);
        }
      } else if (activeTab === 'completed') {
        response = await matchService.getMatches({ status: 'completed' }, pageNum);
        const matchData = response.data || [];
        
        if (append) {
          setMatches(prev => [...prev, ...matchData]);
        } else {
          setMatches(matchData);
          if (!featured && matchData.length > 0) {
            setFeatured(matchData[0]);
          }
        }
        setHasMore(matchData.length === 20);
      } else if (activeTab === 'upcoming') {
        response = await matchService.getMatches({ status: 'upcoming' }, pageNum);
        const matchData = response.data || [];
        
        if (append) {
          setMatches(prev => [...prev, ...matchData]);
        } else {
          setMatches(matchData);
          if (!featured && matchData.length > 0) {
            setFeatured(matchData[0]);
          }
        }
        setHasMore(matchData.length === 20);
      } else {
        // all
        response = await matchService.getMatches({}, pageNum);
        const matchData = response.data || [];
        
        if (append) {
          setMatches(prev => [...prev, ...matchData]);
        } else {
          setMatches(matchData);
          if (!featured && matchData.length > 0) {
            setFeatured(matchData[0]);
          }
        }
        setHasMore(matchData.length === 20);
      }
    } catch (err) {
      console.error('Failed to load matches');
      if (!append) setMatches([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeTab, featured]);

  useEffect(() => {
    setPage(1);
    fetchMatches(1, false);
  }, [activeTab]);

  // Fetch live matches for top bar indicator
  useEffect(() => {
    const fetchLive = async () => {
      try {
        const response = await liveService.getLiveMatches();
        setLiveMatches(response.data || []);
      } catch (err) {
        console.error('Failed to fetch live matches');
      }
    };
    fetchLive();
    const interval = setInterval(fetchLive, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // Auto-refresh featured match if it's live
  useEffect(() => {
    if (!featured || activeTab !== 'live') return;
    
    const refreshLive = async () => {
      try {
        const response = await liveService.getLiveMatches();
        const liveData = response.data || [];
        const updatedMatch = liveData.find(m => m.id === featured.id);
        if (updatedMatch) {
          setFeatured(updatedMatch);
        }
      } catch (err) {
        console.error('Failed to refresh live match');
      }
    };
    
    const interval = setInterval(refreshLive, 30000);
    return () => clearInterval(interval);
  }, [featured, activeTab]);

  // Infinite scroll observer
  useEffect(() => {
    if (activeTab === 'live') return; // No infinite scroll for live
    
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchMatches(nextPage, true);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loadingMore, page, fetchMatches, activeTab]);

  // Mock H2H data (replace with actual API call)
  const getH2HData = () => {
    return [
      { name: 'Team 1 Wins', value: 12, color: '#C9A84C' },
      { name: 'Draws', value: 8, color: 'rgba(255,255,255,0.1)' },
      { name: 'Team 2 Wins', value: 10, color: 'rgba(232,213,176,0.3)' },
    ];
  };

  // Mock result breakdown data
  const getResultBreakdown = () => {
    return [
      { type: 'By Runs', count: 15 },
      { type: 'By Wickets', count: 12 },
      { type: 'Draws', count: 8 },
    ];
  };

  // Get team abbreviation (first 3 letters uppercase)
  const getTeamAbbr = (teamName) => {
    if (!teamName) return 'TBD';
    return teamName.substring(0, 3).toUpperCase();
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      {/* Background Image */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: 'url(https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1920)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 0,
        }}
      />
      
      {/* Gradient Overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'linear-gradient(to right, rgba(10,10,15,0.97) 0%, rgba(10,10,15,0.85) 50%, rgba(10,10,15,0.4) 100%)',
          zIndex: 1,
        }}
      />

      {/* Top Bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: '24px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10,
        }}
      >
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(232,213,176,0.5)',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'color 0.3s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#E8D5B0'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(232,213,176,0.5)'}
        >
          ← The Covers
        </button>
        
        <span style={{ fontSize: '13px', color: '#E8D5B0', letterSpacing: '0.3em', fontFamily: 'Source Serif 4, serif' }}>
          MATCH CENTRE
        </span>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {liveMatches.length > 0 ? (
            <>
              <div className="pulse-gold" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff4444' }} />
              <span className="mono" style={{ fontSize: '11px', color: '#C9A84C', letterSpacing: '0.1em', fontWeight: 600 }}>
                {liveMatches.length} MATCHES LIVE
              </span>
            </>
          ) : (
            <span className="mono" style={{ fontSize: '11px', color: 'rgba(232,213,176,0.5)', letterSpacing: '0.1em' }}>
              NO LIVE MATCHES
            </span>
          )}
        </div>
      </div>

      {/* Left Side - Featured Match Display */}
      <div
        style={{
          position: 'absolute',
          left: '40px',
          top: '80px',
          bottom: '60px',
          width: '55%',
          zIndex: 10,
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollbarWidth: 'thin',
          scrollbarColor: '#C9A84C rgba(255,255,255,0.05)',
          paddingRight: '20px',
        }}
        className="custom-scrollbar"
      >
        <AnimatePresence mode="wait">
          {featured && (
            <motion.div
              key={featured._id || featured.id}
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -30, opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                justifyContent: 'space-between',
              }}
            >
              {/* Top Section - Match Header */}
              <div>
                {/* Featured Label */}
                <div style={{ marginBottom: '20px' }}>
                  {activeTab === 'live' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="pulse-gold" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff4444' }} />
                      <span className="mono" style={{ fontSize: '10px', color: '#ff4444', letterSpacing: '0.2em', fontWeight: 600 }}>
                        LIVE NOW
                      </span>
                    </div>
                  ) : (
                    <span className="mono" style={{ fontSize: '10px', color: '#C9A84C', letterSpacing: '0.2em', fontWeight: 600 }}>
                      FEATURED MATCH
                    </span>
                  )}
                </div>

                {/* Team 1 */}
                <h1 className="display" style={{ 
                  fontSize: '68px', 
                  lineHeight: '1', 
                  color: '#E8D5B0', 
                  fontWeight: 700, 
                  marginBottom: '16px',
                  textShadow: '0 2px 20px rgba(201,168,76,0.3)'
                }}>
                  {displayTeam1 || featured.team1?.name || featured.teams?.[0] || 'Team 1'}
                </h1>

                {/* VS */}
                <div style={{ fontSize: '24px', color: 'rgba(232,213,176,0.5)', fontStyle: 'italic', marginBottom: '16px', textAlign: 'center' }}>
                  vs
                </div>

                {/* Team 2 */}
                <h1 className="display" style={{ 
                  fontSize: '68px', 
                  lineHeight: '1', 
                  color: '#E8D5B0', 
                  fontWeight: 700, 
                  marginBottom: '24px',
                  textShadow: '0 2px 20px rgba(201,168,76,0.3)'
                }}>
                  {displayTeam2 || featured.team2?.name || featured.teams?.[1] || 'Team 2'}
                </h1>

                {/* Live Score or Result */}
                {activeTab === 'live' && featured.status && (
                  <div style={{ marginBottom: '20px' }}>
                    <div className="mono" style={{ fontSize: '42px', color: '#C9A84C', lineHeight: '1', fontWeight: 700, marginBottom: '12px' }}>
                      {featured.score || 'Score updating...'}
                    </div>
                    <div style={{ fontSize: '15px', color: 'rgba(232,213,176,0.6)' }}>
                      {featured.status}
                    </div>
                  </div>
                )}

                {featured.result && featured.winningTeam && (
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '18px', color: '#C9A84C', fontWeight: 600, marginBottom: '8px' }}>
                      {featured.winningTeam.name || 'Winner'}
                    </div>
                    <div style={{ fontSize: '15px', color: 'rgba(232,213,176,0.6)' }}>
                      {featured.result}
                    </div>
                  </div>
                )}

                {/* Venue + Date Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={13} color="rgba(232,213,176,0.5)" />
                    <span style={{ fontSize: '13px', color: 'rgba(232,213,176,0.6)', fontFamily: 'Source Serif 4, serif' }}>
                      {featured.venue?.name || featured.venue || 'Venue TBD'}
                    </span>
                  </div>
                </div>

                {/* Toss Info */}
                {featured.toss && (
                  <div style={{
                    display: 'inline-block',
                    padding: '8px 18px',
                    border: '1px solid rgba(201,168,76,0.3)',
                    borderRadius: '20px',
                    fontSize: '11px',
                    color: '#C9A84C',
                    letterSpacing: '0.1em',
                  }}>
                    TOSS: {featured.toss.winner} chose to {featured.toss.decision}
                  </div>
                )}
              </div>

              {/* Section 2 - Scorecard Preview */}
              {featured.innings && featured.innings.length > 0 && (
                <div style={{ marginBottom: '48px' }}>
                  <div style={{ 
                    fontSize: '9px', 
                    color: '#C9A84C', 
                    letterSpacing: '0.2em', 
                    marginBottom: '20px',
                    fontWeight: 600,
                    borderBottom: '1px solid rgba(201,168,76,0.2)',
                    paddingBottom: '8px'
                  }}>
                    SCORECARD PREVIEW
                  </div>
                  
                  {/* Batting Table */}
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '2fr 1fr 1fr 1fr', 
                      gap: '12px',
                      padding: '8px 0',
                      fontSize: '9px',
                      color: '#C9A84C',
                      letterSpacing: '0.1em',
                      fontWeight: 600
                    }}>
                      <div>BATSMAN</div>
                      <div style={{ textAlign: 'right' }}>RUNS</div>
                      <div style={{ textAlign: 'right' }}>BALLS</div>
                      <div style={{ textAlign: 'right' }}>SR</div>
                    </div>
                    {featured.innings[0]?.batting?.slice(0, 3).map((bat, i) => (
                      <div 
                        key={i}
                        style={{ 
                          display: 'grid', 
                          gridTemplateColumns: '2fr 1fr 1fr 1fr', 
                          gap: '12px',
                          padding: '12px 0',
                          fontSize: '13px',
                          color: '#E8D5B0',
                          background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'
                        }}
                      >
                        <div style={{ fontFamily: 'Source Serif 4, serif' }}>{bat.name}</div>
                        <div className="mono" style={{ textAlign: 'right', color: '#C9A84C' }}>{bat.runs}</div>
                        <div className="mono" style={{ textAlign: 'right' }}>{bat.balls}</div>
                        <div className="mono" style={{ textAlign: 'right' }}>{bat.strikeRate?.toFixed(1)}</div>
                      </div>
                    ))}
                  </div>

                  {/* Bowling Figures */}
                  {featured.innings[0]?.bowling && (
                    <div>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', 
                        gap: '12px',
                        padding: '8px 0',
                        fontSize: '9px',
                        color: '#C9A84C',
                        letterSpacing: '0.1em',
                        fontWeight: 600
                      }}>
                        <div>BOWLER</div>
                        <div style={{ textAlign: 'right' }}>O</div>
                        <div style={{ textAlign: 'right' }}>M</div>
                        <div style={{ textAlign: 'right' }}>R</div>
                        <div style={{ textAlign: 'right' }}>W</div>
                      </div>
                      {featured.innings[0].bowling.slice(0, 2).map((bowl, i) => (
                        <div 
                          key={i}
                          style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', 
                            gap: '12px',
                            padding: '12px 0',
                            fontSize: '13px',
                            color: '#E8D5B0',
                            background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'
                          }}
                        >
                          <div style={{ fontFamily: 'Source Serif 4, serif' }}>{bowl.name}</div>
                          <div className="mono" style={{ textAlign: 'right' }}>{bowl.overs}</div>
                          <div className="mono" style={{ textAlign: 'right' }}>{bowl.maidens}</div>
                          <div className="mono" style={{ textAlign: 'right' }}>{bowl.runs}</div>
                          <div className="mono" style={{ textAlign: 'right', color: '#C9A84C' }}>{bowl.wickets}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Section 3 - Match Visualizations */}
              <div style={{ marginBottom: '48px' }}>
                {/* Chart 1 - Head to Head Donut */}
                <div style={{ marginBottom: '40px' }}>
                  <div style={{ 
                    fontSize: '10px', 
                    color: '#C9A84C', 
                    letterSpacing: '0.2em', 
                    marginBottom: '24px',
                    fontWeight: 600
                  }}>
                    HEAD TO HEAD
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <ResponsiveContainer width={300} height={240}>
                      <PieChart>
                        <Pie
                          data={getH2HData()}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          dataKey="value"
                          isAnimationActive={true}
                        >
                          {getH2HData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{
                            background: 'rgba(10,10,15,0.95)',
                            border: '1px solid rgba(201,168,76,0.3)',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            color: '#E8D5B0',
                            fontSize: '12px',
                            fontFamily: 'Source Serif 4, serif'
                          }}
                          itemStyle={{ color: '#C9A84C' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    gap: '24px', 
                    fontSize: '12px', 
                    color: 'rgba(232,213,176,0.6)',
                    marginTop: '16px'
                  }}>
                    <span>Team1 12 wins</span>
                    <span>|</span>
                    <span>Draws 8</span>
                    <span>|</span>
                    <span>Team2 10 wins</span>
                  </div>
                </div>

                {/* Chart 2 - Result Breakdown Bar */}
                <div style={{ marginBottom: '40px' }}>
                  <div style={{ 
                    fontSize: '10px', 
                    color: '#C9A84C', 
                    letterSpacing: '0.2em', 
                    marginBottom: '24px',
                    fontWeight: 600
                  }}>
                    RESULT TYPES
                  </div>
                  <ResponsiveContainer width="100%" height={140}>
                    <BarChart data={getResultBreakdown()} layout="vertical">
                      <XAxis type="number" hide />
                      <YAxis 
                        type="category" 
                        dataKey="type" 
                        tick={{ fill: 'rgba(232,213,176,0.6)', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Bar 
                        dataKey="count" 
                        fill="#C9A84C" 
                        isAnimationActive={true}
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Chart 3 - Win Probability */}
                <div>
                  <div style={{ 
                    fontSize: '10px', 
                    color: '#C9A84C', 
                    letterSpacing: '0.2em', 
                    marginBottom: '24px',
                    fontWeight: 600
                  }}>
                    WIN PROBABILITY
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div>
                      <div style={{ fontSize: '13px', color: 'rgba(232,213,176,0.6)', marginBottom: '6px' }}>
                        {featured.team1?.name || featured.teams?.[0] || 'Team 1'}
                      </div>
                      <div className="mono" style={{ fontSize: '28px', color: '#C9A84C', fontWeight: 700 }}>
                        55%
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '13px', color: 'rgba(232,213,176,0.6)', marginBottom: '6px' }}>
                        {featured.team2?.name || featured.teams?.[1] || 'Team 2'}
                      </div>
                      <div className="mono" style={{ fontSize: '28px', color: '#C9A84C', fontWeight: 700 }}>
                        45%
                      </div>
                    </div>
                  </div>
                  <div style={{ position: 'relative', width: '100%', height: '8px', background: 'rgba(232,213,176,0.2)', borderRadius: '4px' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '55%' }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                      style={{ 
                        position: 'absolute', 
                        left: 0, 
                        top: 0, 
                        height: '100%', 
                        background: '#C9A84C',
                        borderRadius: '4px 0 0 4px'
                      }}
                    />
                    <div style={{ 
                      position: 'absolute', 
                      left: '55%', 
                      top: '50%', 
                      transform: 'translate(-50%, -50%)',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: 'white',
                      boxShadow: '0 0 10px rgba(255,255,255,0.6)'
                    }} />
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(232,213,176,0.4)', marginTop: '12px', textAlign: 'center' }}>
                    Draw probability: 10%
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!loading && !featured && (
          <div style={{ textAlign: 'center', padding: '100px 0', color: 'rgba(232,213,176,0.5)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏏</div>
            <div style={{ fontSize: '16px' }}>No matches available</div>
          </div>
        )}
      </div>

      {/* Right Panel - Match List */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        style={{
          position: 'absolute',
          right: '32px',
          top: '80px',
          bottom: '32px',
          width: '320px',
          zIndex: 10,
          backdropFilter: 'blur(20px)',
          background: 'rgba(10,10,15,0.85)',
          border: '1px solid rgba(201,168,76,0.2)',
          borderRadius: '20px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        {/* Tabs */}
        <div style={{ padding: '16px 20px 0' }}>
          <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            {['all', 'live', 'completed', 'upcoming'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '12px',
                  fontFamily: 'Source Serif 4, serif',
                  color: activeTab === tab ? '#E8D5B0' : 'rgba(232,213,176,0.5)',
                  paddingBottom: '12px',
                  cursor: 'pointer',
                  borderBottom: activeTab === tab ? '2px solid #C9A84C' : '2px solid transparent',
                  transition: 'all 0.3s',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Match List */}
        <div
          style={{
            flexGrow: 1,
            overflowY: 'auto',
            scrollbarWidth: 'thin',
            scrollbarColor: '#C9A84C rgba(255,255,255,0.05)',
          }}
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(232,213,176,0.5)', fontSize: '13px' }}>
              Loading...
            </div>
          ) : matches.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(232,213,176,0.5)', fontSize: '13px' }}>
              {activeTab === 'live' ? 'No live Test matches at the moment' : 'No matches found'}
            </div>
          ) : (
            <>
              {matches.map((match, index) => {
                const isLive = activeTab === 'live';
                const isFeatured = featured && (featured._id === match._id || featured.id === match.id);
                
                return (
                  <div
                    key={match._id || match.id || index}
                    onClick={() => setFeatured(match)}
                    style={{
                      padding: '14px 20px',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      cursor: 'pointer',
                      background: isFeatured ? 'rgba(201,168,76,0.08)' : 'transparent',
                      borderLeft: isFeatured ? '2px solid #C9A84C' : isLive ? '2px solid #ff4444' : '2px solid transparent',
                      transition: 'all 0.15s',
                      position: 'relative',
                    }}
                    onMouseEnter={(e) => {
                      if (!isFeatured) {
                        e.currentTarget.style.backgroundd = 'rgba(255,255,255,0.03)';
                        e.currentTarget.style.borderLeft = isLive ? '2px solid #ff4444' : '2px solid rgba(201,168,76,0.3)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isFeatured) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderLeft = isLive ? '2px solid #ff4444' : '2px solid transparent';
                      }
                    }}
                  >
                    {/* Row 1: Date and Status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span className="mono" style={{ fontSize: '10px', color: 'rgba(232,213,176,0.5)' }}>
                        {formatDate(match.startDate || match.date)}
                      </span>
                      {isLive && (
                        <div style={{
                          padding: '2px 8px',
                          background: '#ff4444',
                          borderRadius: '10px',
                          fontSize: '9px',
                          color: 'white',
                          fontWeight: 600,
                          letterSpacing: '0.05em',
                        }}>
                          ● LIVE
                        </div>
                      )}
                      {activeTab === 'completed' && (
                        <div style={{
                          padding: '2px 8px',
                          background: 'rgba(232,213,176,0.1)',
                          borderRadius: '10px',
                          fontSize: '9px',
                          color: 'rgba(232,213,176,0.6)',
                          fontWeight: 600,
                        }}>
                          COMPLETED
                        </div>
                      )}
                      {activeTab === 'upcoming' && (
                        <div style={{
                          padding: '2px 8px',
                          background: 'rgba(201,168,76,0.2)',
                          borderRadius: '10px',
                          fontSize: '9px',
                          color: '#C9A84C',
                          fontWeight: 600,
                        }}>
                          UPCOMING
                        </div>
                      )}
                    </div>

                    {/* Row 2: Teams and Scores */}
                    <div style={{ marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                        <span style={{ fontFamily: 'Source Serif 4, serif', color: '#E8D5B0', fontWeight: 500 }}>
                          {getTeamAbbr(match.team1?.name || match.teams?.[0])}
                        </span>
                        {match.score1 && (
                          <span className="mono" style={{ color: '#C9A84C', fontWeight: 600 }}>
                            {match.score1}
                          </span>
                        )}
                        <span style={{ color: 'rgba(232,213,176,0.3)' }}>:</span>
                        {match.score2 && (
                          <span className="mono" style={{ color: '#C9A84C', fontWeight: 600 }}>
                            {match.score2}
                          </span>
                        )}
                        <span style={{ fontFamily: 'Source Serif 4, serif', color: '#E8D5B0', fontWeight: 500 }}>
                          {getTeamAbbr(match.team2?.name || match.teams?.[1])}
                        </span>
                      </div>
                    </div>

                    {/* Row 3: Venue and Result */}
                    <div style={{ fontSize: '10px', color: 'rgba(232,213,176,0.4)' }}>
                      {match.venue?.name || match.venue || 'Venue TBD'}
                      {match.result && (
                        <>
                          <span style={{ margin: '0 6px' }}>•</span>
                          <span>{match.result}</span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {/* Infinite Scroll Observer Target */}
              {activeTab !== 'live' && <div ref={observerTarget} style={{ height: '20px' }} />}
              
              {/* Loading More Indicator */}
              {loadingMore && (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid rgba(201,168,76,0.2)',
                      borderTop: '2px solid #C9A84C',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      margin: '0 auto',
                    }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default MatchCentre;
