import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis } from 'recharts';
import playerService from '../services/playerService';

function Players() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featured, setFeatured] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerTarget = useRef(null);

  // Scramble text effect
  const [displayName, setDisplayName] = useState('');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  useEffect(() => {
    if (!featured) return;
    const targetName = featured.name;
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayName(
        targetName
          .split('')
          .map((letter, index) => {
            if (index < iteration) return targetName[index];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('')
      );
      if (iteration >= targetName.length) clearInterval(interval);
      iteration += 1 / 3;
    }, 30);
    return () => clearInterval(interval);
  }, [featured]);

  // Fetch players
  const fetchPlayers = useCallback(async (pageNum = 1, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    
    try {
      const filters = {};
      if (search) filters.search = search;
      if (roleFilter && roleFilter !== 'all') filters.role = roleFilter;

      const response = await playerService.getPlayers(filters, pageNum);
      const playerList = response.data || [];
      
      if (append) {
        setPlayers(prev => [...prev, ...playerList]);
      } else {
        setPlayers(playerList);
        if (!featured && playerList.length > 0) {
          setFeatured(playerList[0]);
        }
      }
      
      setHasMore(playerList.length === 30);
    } catch (err) {
      console.error('Failed to load players');
      if (!append) setPlayers([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [search, roleFilter, featured]);

  useEffect(() => {
    fetchPlayers(1, false);
  }, [roleFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchPlayers(1, false);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchPlayers(nextPage, true);
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
  }, [hasMore, loadingMore, page, fetchPlayers]);

  const getNextPlayer = () => {
    if (players.length > 0) {
      const currentIndex = players.findIndex(p => p._id === featured?._id);
      const nextIndex = (currentIndex + 1) % players.length;
      setFeatured(players[nextIndex]);
    }
  };

  const getFirstLastName = (fullName) => {
    const parts = fullName.split(' ');
    if (parts.length === 1) return { first: '', last: fullName };
    const last = parts[parts.length - 1];
    const first = parts.slice(0, -1).join(' ');
    return { first, last };
  };

  const names = featured ? getFirstLastName(displayName || featured.name) : { first: '', last: '' };
  const playerRank = featured ? players.findIndex(p => p._id === featured._id) + 1 : 0;

  // Normalize stats for radar chart (0-100 scale)
  const getRadarData = () => {
    if (!featured) return [];
    const batting = featured.batting || {};
    const bowling = featured.bowling || {};
    const career = featured.testCareer || {};
    
    return [
      { axis: 'Batting', value: Math.min((batting.average || 0) * 1.5, 100), fullMark: 100 },
      { axis: 'Runs', value: Math.min(((batting.runs || 0) / 150), 100), fullMark: 100 },
      { axis: 'Centuries', value: Math.min((batting.centuries || 0) * 8, 100), fullMark: 100 },
      { axis: 'Strike', value: Math.min((batting.strikeRate || 50), 100), fullMark: 100 },
      { axis: 'Wickets', value: Math.min((bowling.wickets || 0) * 1.5, 100), fullMark: 100 },
      { axis: 'Caps', value: Math.min((career.caps || 0) * 1.5, 100), fullMark: 100 },
    ];
  };

  // Career trend sparkline
  const getCareerTrend = () => {
    if (!featured) return [];
    const avg = featured.batting?.average || 30;
    return [
      { index: 0, value: avg * 0.6 },
      { index: 1, value: avg * 0.75 },
      { index: 2, value: avg * 0.85 },
      { index: 3, value: avg * 0.95 },
      { index: 4, value: avg },
      { index: 5, value: avg * 1.05 },
      { index: 6, value: avg * 0.98 },
    ];
  };

  // Stat bars data
  const getStatBars = () => {
    if (!featured) return [];
    const batting = featured.batting || {};
    const bowling = featured.bowling || {};
    return [
      { label: 'BATTING AVG', value: batting.average || 0, max: 100, display: (batting.average || 0).toFixed(1) },
      { label: 'TOTAL RUNS', value: Math.min((batting.runs || 0) / 100, 100), max: 100, display: batting.runs || 0 },
      { label: 'WICKETS', value: Math.min((bowling.wickets || 0) * 0.5, 100), max: 100, display: bowling.wickets || 0 },
    ];
  };

  // Generate sparkline for stat card
  const generateSparkline = () => {
    if (!featured) return [];
    const avg = featured.batting?.average || 30;
    return Array.from({ length: 8 }, (_, i) => ({
      x: i * 25,
      y: 40 - (avg * 0.5 + Math.random() * 15)
    }));
  };

  const sparklineData = generateSparkline();

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      {/* Background Image */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: 'url(https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1920)',
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
          background: 'linear-gradient(to right, rgba(10,10,15,0.96) 0%, rgba(10,10,15,0.75) 45%, rgba(10,10,15,0.3) 100%)',
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
        
        <span style={{ fontSize: '13px', color: 'rgba(232,213,176,0.5)', letterSpacing: '0.3em', fontFamily: 'Source Serif 4, serif' }}>
          ALL PLAYERS
        </span>
        
        <button
          onClick={getNextPlayer}
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
          NEXT PLAYER →
        </button>
      </div>

      {/* Top Left - Player Name */}
      <AnimatePresence mode="wait">
        {featured && (
          <motion.div
            key={`name-${featured._id}`}
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -30, opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              position: 'absolute',
              left: '60px',
              top: '120px',
              zIndex: 10,
              width: '50%',
            }}
          >
            {/* Player Number */}
            <div style={{ marginBottom: '20px' }}>
              <span className="mono" style={{ fontSize: '11px', color: '#C9A84C', letterSpacing: '0.2em', fontWeight: 600 }}>
                NO. {playerRank}
              </span>
            </div>

            {/* Player Name */}
            {names.first && (
              <h1 className="display" style={{ 
                fontSize: '80px', 
                lineHeight: '0.95', 
                color: '#E8D5B0', 
                fontWeight: 400, 
                marginBottom: '8px',
                textShadow: '0 2px 20px rgba(201,168,76,0.3)'
              }}>
                {names.first}
              </h1>
            )}
            <h1 className="display" style={{ 
              fontSize: '110px', 
              lineHeight: '0.95', 
              color: '#E8D5B0', 
              fontWeight: 700, 
              marginBottom: '32px',
              textShadow: '0 2px 30px rgba(201,168,76,0.4)'
            }}>
              {names.last}
            </h1>

            {/* Role + Country Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  padding: '8px 18px',
                  border: '1px solid #C9A84C',
                  borderRadius: '2px',
                  fontSize: '11px',
                  color: '#C9A84C',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  background: 'rgba(201,168,76,0.05)',
                }}
              >
                TEST {featured.role?.toUpperCase()}
              </div>
              <div style={{ fontSize: '16px', color: 'rgba(232,213,176,0.7)', letterSpacing: '0.05em' }}>
                {featured.country}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Left - Charts and Stats */}
      <AnimatePresence mode="wait">
        {featured && (
          <motion.div
            key={`stats-${featured._id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              position: 'absolute',
              left: '60px',
              bottom: '60px',
              zIndex: 10,
              width: '52%',
              display: 'flex',
              gap: '50px',
            }}
          >
            {/* Radar Chart */}
            <div style={{ flex: '0 0 auto' }}>
              <div style={{ 
                fontSize: '9px', 
                color: 'rgba(232,213,176,0.5)', 
                letterSpacing: '0.15em', 
                marginBottom: '20px',
                fontWeight: 600
              }}>
                PERFORMANCE RADAR
              </div>
              <ResponsiveContainer width={320} height={320}>
                <RadarChart data={getRadarData()}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
                  <PolarAngleAxis 
                    dataKey="axis" 
                    tick={{ fill: '#6B6B7A', fontSize: 11, fontFamily: 'IBM Plex Mono' }} 
                  />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    dataKey="value"
                    stroke="#C9A84C"
                    fill="rgba(201,168,76,0.2)"
                    fillOpacity={1}
                    strokeWidth={2}
                    isAnimationActive={true}
                    animationDuration={1000}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Right Column - Trend + Bars */}
            <div style={{ flex: '1 1 auto', minWidth: '300px' }}>
              {/* Career Trend Sparkline */}
              <div style={{ marginBottom: '50px' }}>
                <div style={{ 
                  fontSize: '9px', 
                  color: 'rgba(232,213,176,0.5)', 
                  letterSpacing: '0.15em', 
                  marginBottom: '20px',
                  fontWeight: 600
                }}>
                  CAREER TREND
                </div>
                <ResponsiveContainer width="100%" height={90}>
                  <LineChart data={getCareerTrend()}>
                    <XAxis dataKey="index" hide />
                    <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#C9A84C"
                      strokeWidth={2.5}
                      dot={false}
                      isAnimationActive={true}
                      animationDuration={1500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Horizontal Stat Bars */}
              <div style={{ marginBottom: '40px' }}>
                {getStatBars().map((stat, i) => (
                  <div key={i} style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ 
                        fontSize: '9px', 
                        color: 'rgba(232,213,176,0.5)', 
                        letterSpacing: '0.15em',
                        fontWeight: 600
                      }}>
                        {stat.label}
                      </span>
                      <span className="mono" style={{ fontSize: '15px', color: '#C9A84C', fontWeight: 600 }}>
                        {stat.display}
                      </span>
                    </div>
                    <div style={{ 
                      width: '100%', 
                      height: '3px', 
                      background: 'rgba(255,255,255,0.08)', 
                      position: 'relative', 
                      overflow: 'hidden',
                      borderRadius: '2px'
                    }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(stat.value / stat.max) * 100}%` }}
                        transition={{ duration: 1.2, ease: 'easeOut', delay: i * 0.15 }}
                        style={{ 
                          height: '100%', 
                          background: 'linear-gradient(to right, #C9A84C, rgba(201,168,76,0.6))',
                          boxShadow: '0 0 10px rgba(201,168,76,0.5)'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* View Full Profile Button */}
              <button
                onClick={() => navigate(`/players/${featured._id}`)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#C9A84C',
                  fontSize: '13px',
                  cursor: 'pointer',
                  padding: 0,
                  position: 'relative',
                  letterSpacing: '0.05em',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.querySelector('.underline').style.width = '100%';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.querySelector('.underline').style.width = '0%';
                }}
              >
                VIEW FULL PROFILE →
                <div
                  className="underline"
                  style={{
                    position: 'absolute',
                    bottom: '-4px',
                    left: 0,
                    height: '1px',
                    width: '0%',
                    background: '#C9A84C',
                    transition: 'width 0.3s ease',
                  }}
                />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right Panel - Player List */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        style={{
          position: 'absolute',
          right: '40px',
          top: '100px',
          bottom: '40px',
          width: '360px',
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
        {/* Panel Header */}
        <div style={{ padding: '28px 28px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <span style={{ fontSize: '13px', color: '#C9A84C', letterSpacing: '0.15em', fontWeight: 600 }}>
              PLAYERS ({players.length})
            </span>
            <Search size={18} color="rgba(201,168,76,0.6)" />
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="Search players..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.03)',
                border: 'none',
                borderBottom: '2px solid rgba(201,168,76,0.2)',
                color: '#E8D5B0',
                padding: '12px 0',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.3s',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderBottomColor = '#C9A84C';
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderBottomColor = 'rgba(201,168,76,0.2)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
              }}
            />
          </div>

          {/* Filter Pills */}
          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            marginBottom: '24px', 
            overflowX: 'auto', 
            scrollbarWidth: 'none',
            paddingBottom: '4px'
          }}>
            {[
              { label: 'ALL', value: 'all' },
              { label: 'BAT', value: 'batsman' },
              { label: 'BOWL', value: 'bowler' },
              { label: 'ALL-ROUND', value: 'allrounder' },
              { label: 'WK', value: 'wicketkeeper' },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => {
                  setRoleFilter(filter.value);
                  setPage(1);
                }}
                style={{
                  padding: '6px 16px',
                  fontSize: '10px',
                  background: roleFilter === filter.value ? '#C9A84C' : 'rgba(201,168,76,0.1)',
                  border: `1px solid ${roleFilter === filter.value ? '#C9A84C' : 'rgba(201,168,76,0.3)'}`,
                  borderRadius: '20px',
                  color: roleFilter === filter.value ? '#0A0A0F' : '#C9A84C',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  letterSpacing: '0.1em',
                  whiteSpace: 'nowrap',
                  fontWeight: 600,
                }}
                onMouseEnter={(e) => {
                  if (roleFilter !== filter.value) {
                    e.currentTarget.style.background = 'rgba(201,168,76,0.2)';
                    e.currentTarget.style.borderColor = '#C9A84C';
                  }
                }}
                onMouseLeave={(e) => {
                  if (roleFilter !== filter.value) {
                    e.currentTarget.style.background = 'rgba(201,168,76,0.1)';
                    e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)';
                  }
                }}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Player List */}
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
          ) : players.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(232,213,176,0.5)', fontSize: '13px' }}>
              No players found
            </div>
          ) : (
            <>
              {players.map((player, index) => (
                <div
                  key={player._id}
                  onClick={() => setFeatured(player)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '44px 1fr 70px',
                    gap: '12px',
                    alignItems: 'center',
                    padding: '16px 28px',
                    cursor: 'pointer',
                    background: featured?._id === player._id ? 'rgba(201,168,76,0.12)' : 'transparent',
                    borderLeft: featured?._id === player._id ? '3px solid #C9A84C' : '3px solid transparent',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    transition: 'all 0.2s',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    if (featured?._id !== player._id) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                      e.currentTarget.style.borderLeft = '3px solid rgba(201,168,76,0.4)';
                      e.currentTarget.querySelector('.player-name').style.transform = 'translateX(6px)';
                      e.currentTarget.querySelector('.player-name').style.color = '#C9A84C';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (featured?._id !== player._id) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderLeft = '3px solid transparent';
                      e.currentTarget.querySelector('.player-name').style.transform = 'translateX(0)';
                      e.currentTarget.querySelector('.player-name').style.color = '#E8D5B0';
                    }
                  }}
                >
                  <span className="mono" style={{ fontSize: '14px', color: 'rgba(201,168,76,0.6)', fontWeight: 600 }}>
                    {index + 1}
                  </span>
                  <div>
                    <div
                      className="player-name"
                      style={{
                        fontSize: '16px',
                        color: featured?._id === player._id ? '#C9A84C' : '#E8D5B0',
                        fontFamily: 'Source Serif 4, serif',
                        transition: 'all 0.2s',
                        fontWeight: 500,
                      }}
                    >
                      {player.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(232,213,176,0.4)', marginTop: '4px' }}>
                      {player.role}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="mono" style={{ fontSize: '15px', color: '#C9A84C', fontWeight: 600 }}>
                      {player.batting?.average?.toFixed(1) || '-'}
                    </div>
                    <div style={{ fontSize: '9px', color: 'rgba(232,213,176,0.4)', marginTop: '4px', letterSpacing: '0.1em' }}>
                      AVG
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Infinite Scroll Observer Target */}
              <div ref={observerTarget} style={{ height: '20px' }} />
              
              {/* Loading More Indicator */}
              {loadingMore && (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      border: '3px solid rgba(201,168,76,0.2)',
                      borderTop: '3px solid #C9A84C',
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

export default Players;
