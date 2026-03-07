import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import statsService from '../services/statsService';
import api from '../services/api';

function History() {
  const [activeEra, setActiveEra] = useState('2000-present');
  const [eraStats, setEraStats] = useState(null);
  const [headToHead, setHeadToHead] = useState(null);
  const [loading, setLoading] = useState(false);
  const [team1, setTeam1] = useState('India');
  const [team2, setTeam2] = useState('Australia');
  const [teams, setTeams] = useState([]);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    fetchTeams();
    fetchEraStats(activeEra);
    
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetchEraStats(activeEra);
  }, [activeEra]);

  const fetchTeams = async () => {
    try {
      const response = await api.get('/teams');
      setTeams(response.data.data || []);
    } catch (err) {
      console.error('Failed to load teams:', err);
    }
  };

  const fetchEraStats = async (era) => {
    setLoading(true);
    try {
      const response = await statsService.getEraStats(era);
      setEraStats(response.data || null);
    } catch (err) {
      console.error('Era stats error:', err);
      setEraStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleHeadToHead = async (e) => {
    e.preventDefault();
    if (!team1 || !team2) return;
    setLoading(true);
    try {
      const response = await statsService.getHeadToHead(team1, team2);
      setHeadToHead(response.data || null);
    } catch (err) {
      console.error('H2H error:', err);
      setHeadToHead(null);
    } finally {
      setLoading(false);
    }
  };

  const eras = [
    { id: '1877-1914', years: '1877–1914', name: 'Early Era' },
    { id: '1920-1950', years: '1920–1950', name: 'Golden Age' },
    { id: '1950-1980', years: '1950–1980', name: 'Post-War' },
    { id: '1980-2000', years: '1980–2000', name: 'Modern Era' },
    { id: '2000-present', years: '2000–present', name: 'Contemporary' },
  ];

  const eraContext = {
    '1877-1914': {
      description: 'The founding era of Test cricket, dominated by England and Australia in fierce Ashes battles. W.G. Grace defined batting while overarm bowling transformed the game.',
      records: [
        'W.G. Grace scores 54,896 first-class runs',
        'First Test match played (1877)',
        'Ashes rivalry begins (1882)'
      ],
      timeline: [
        { year: 1877, event: 'First Test match' },
        { year: 1882, event: 'Ashes born' },
        { year: 1895, event: 'W.G. Grace century' },
        { year: 1902, event: 'Triangular tournament' },
        { year: 1912, event: 'South Africa joins' }
      ]
    },
    '1920-1950': {
      description: 'The golden age of batting technique. Don Bradman\'s unprecedented 99.94 average redefined what was possible at the crease. England and Australia continued their dominance.',
      records: [
        'Bradman averages 99.94 (1928-1948)',
        'Highest Test score: 364 by Len Hutton (1938)',
        'Bodyline series controversy (1932-33)'
      ],
      timeline: [
        { year: 1928, event: 'Bradman debuts' },
        { year: 1932, event: 'Bodyline series' },
        { year: 1938, event: 'Hutton 364' },
        { year: 1947, event: 'India independence' },
        { year: 1948, event: 'Invincibles tour' }
      ]
    },
    '1950-1980': {
      description: 'The rise of the Caribbean giants. West Indies emerged as a cricketing superpower with fearsome pace attacks. India and Pakistan began asserting themselves on the world stage.',
      records: [
        'Garfield Sobers 365* (1958)',
        'West Indies dominate with pace',
        'India wins first World Cup (1983)'
      ],
      timeline: [
        { year: 1952, event: 'Pakistan debuts' },
        { year: 1958, event: 'Sobers 365*' },
        { year: 1970, event: 'WI pace quartet' },
        { year: 1975, event: 'First World Cup' },
        { year: 1979, event: 'Packer revolution' }
      ]
    },
    '1980-2000': {
      description: 'The professional era. West Indies dominated the 1980s before Australia\'s renaissance under Border, Taylor and Waugh. One-day cricket began influencing Test tactics.',
      records: [
        'Brian Lara 375 (1994)',
        'Shane Warne 708 wickets',
        'Australia wins 16 consecutive Tests'
      ],
      timeline: [
        { year: 1983, event: 'India World Cup' },
        { year: 1992, event: 'Colored clothing' },
        { year: 1994, event: 'Lara 375' },
        { year: 1999, event: 'Australia dominance' },
        { year: 2000, event: 'Match-fixing scandal' }
      ]
    },
    '2000-present': {
      description: 'The subcontinental century. India\'s economic might transformed cricket. Australia\'s golden generation gave way to new rivalries. Day-night Tests and technology changed the game.',
      records: [
        'Sachin Tendulkar 15,921 runs',
        'Muttiah Muralitharan 800 wickets',
        'Brian Lara 400* (2004)'
      ],
      timeline: [
        { year: 2004, event: 'Lara 400*' },
        { year: 2008, event: 'IPL begins' },
        { year: 2013, event: 'Tendulkar retires' },
        { year: 2015, event: 'First D/N Test' },
        { year: 2020, event: 'COVID era' }
      ]
    }
  };

  const greatestRecords = [
    { category: 'HIGHEST INDIVIDUAL SCORE', value: '400*', detail: 'Brian Lara, 2004' },
    { category: 'MOST RUNS', value: '15921', detail: 'Sachin Tendulkar' },
    { category: 'HIGHEST AVERAGE', value: '99.94', detail: 'Don Bradman' },
    { category: 'MOST WICKETS', value: '800', detail: 'Muttiah Muralitharan' },
    { category: 'BEST BOWLING', value: '10/53', detail: 'Jim Laker, 1956' },
    { category: 'MOST 5-WICKETS', value: '67', detail: 'Muttiah Muralitharan' },
    { category: 'MOST CATCHES', value: '210', detail: 'Rahul Dravid' },
    { category: 'MOST TESTS', value: '200', detail: 'Sachin Tendulkar' },
    { category: 'LONGEST CAREER', value: '30 years', detail: 'Wilfred Rhodes' }
  ];

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Background Image - Fixed */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=1920)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      />
      
      {/* Overlay - Lighter */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(10,10,15,0.75) 0%, rgba(10,10,15,0.70) 50%, rgba(10,10,15,0.80) 100%)'
        }}
      />

      {/* Content */}
      <div className="relative z-10 px-10 py-20">
        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-16"
        >
          <div className="ml-10">
            <div className="font-display text-[96px] font-bold leading-none text-primary">
              CRICKET
            </div>
            <div className="font-display text-[96px] font-bold italic leading-none text-accent -mt-4">
              HISTORY
            </div>
            <div className="font-mono text-xs text-primary/60 tracking-[0.3em] mt-2">
              1877 — PRESENT
            </div>
          </div>
          <div className="w-full h-px bg-accent/30 mt-8" />
        </motion.div>

        {/* Section 1: Era Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="font-mono text-[10px] text-accent tracking-[0.3em] mb-6">
            ERA STATISTICS
          </div>

          {/* Era Selector */}
          <div className="flex gap-12 mb-12">
            {eras.map((era) => (
              <button
                key={era.id}
                onClick={() => setActiveEra(era.id)}
                className="relative cursor-pointer transition-colors duration-200"
                style={{ color: activeEra === era.id ? '#E8D5B0' : 'rgba(232,213,176,0.25)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(232,213,176,0.6)'}
                onMouseLeave={(e) => e.currentTarget.style.color = activeEra === era.id ? '#E8D5B0' : 'rgba(232,213,176,0.25)'}
              >
                <div className="font-mono text-sm">{era.years}</div>
                <div className="font-serif text-lg mt-1">{era.name}</div>
                {activeEra === era.id && (
                  <motion.div
                    layoutId="eraUnderline"
                    className="absolute -bottom-2 left-0 right-0 h-0.5 bg-accent"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Era Content */}
          <AnimatePresence mode="wait">
            {eraStats && (
              <motion.div
                key={activeEra}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-[60%_40%] gap-8"
              >
                {/* Left Column */}
                <div className="space-y-8">
                  {/* Headline Stats */}
                  <div className="flex gap-8">
                    <div className="relative flex-1">
                      <div className="absolute inset-0 flex items-center justify-center opacity-[0.06] font-mono text-[80px] text-primary pointer-events-none">
                        {eraStats.matchCount}
                      </div>
                      <div className="relative z-10">
                        <div className="font-mono text-[9px] text-accent tracking-wider mb-2">MATCHES PLAYED</div>
                        <motion.div 
                          className="font-mono text-[40px] text-primary"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          {eraStats.matchCount}
                        </motion.div>
                      </div>
                    </div>
                    <div className="relative flex-1">
                      <div className="absolute inset-0 flex items-center justify-center opacity-[0.06] font-mono text-[80px] text-primary pointer-events-none">
                        {eraStats.decisive}
                      </div>
                      <div className="relative z-10">
                        <div className="font-mono text-[9px] text-accent tracking-wider mb-2">DECISIVE RESULTS</div>
                        <motion.div 
                          className="font-mono text-[40px] text-primary"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          {eraStats.decisive}
                        </motion.div>
                      </div>
                    </div>
                    <div className="relative flex-1">
                      <div className="absolute inset-0 flex items-center justify-center opacity-[0.06] font-mono text-[80px] text-primary pointer-events-none">
                        {eraStats.draws}
                      </div>
                      <div className="relative z-10">
                        <div className="font-mono text-[9px] text-accent tracking-wider mb-2">DRAWS</div>
                        <motion.div 
                          className="font-mono text-[40px] text-primary"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          {eraStats.draws}
                        </motion.div>
                      </div>
                    </div>
                  </div>

                  {/* Top Teams Chart */}
                  {eraStats.topTeams && eraStats.topTeams.length > 0 && (
                    <div>
                      <div className="font-mono text-[10px] text-accent tracking-wider mb-4">DOMINANT TEAMS</div>
                      <BarChart width={600} height={200} data={eraStats.topTeams} layout="vertical" margin={{ left: 0, right: 0 }}>
                        <XAxis type="number" stroke="rgba(107,107,122,1)" tick={{ fill: '#6B6B7A', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="team" stroke="rgba(107,107,122,1)" tick={{ fill: '#6B6B7A', fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
                        <Tooltip 
                          contentStyle={{ background: 'rgba(10,10,15,0.95)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '8px' }}
                          labelStyle={{ color: '#C9A84C' }}
                        />
                        <Bar dataKey="wins" fill="#C9A84C" radius={[0, 2, 2, 0]} isAnimationActive={true} />
                      </BarChart>
                    </div>
                  )}

                  {/* Result Types Chart */}
                  {eraStats.resultTypes && (
                    <div>
                      <div className="font-mono text-[10px] text-accent tracking-wider mb-4">RESULT BREAKDOWN</div>
                      <div className="flex items-center gap-8">
                        <PieChart width={180} height={180}>
                          <Pie
                            data={[
                              { name: 'Runs', value: eraStats.resultTypes.runs || 0 },
                              { name: 'Wickets', value: eraStats.resultTypes.wickets || 0 },
                              { name: 'Draws', value: eraStats.resultTypes.draw || 0 },
                              { name: 'Innings', value: eraStats.resultTypes.innings || 0 }
                            ]}
                            cx={90}
                            cy={90}
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            isAnimationActive={true}
                          >
                            <Cell fill="#C9A84C" />
                            <Cell fill="rgba(232,213,176,0.5)" />
                            <Cell fill="rgba(255,255,255,0.1)" />
                            <Cell fill="rgba(201,168,76,0.4)" />
                          </Pie>
                          <Tooltip />
                        </PieChart>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#C9A84C]" />
                            <span className="text-primary/60 text-xs">Wins by Runs: {eraStats.resultTypes.runs || 0}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[rgba(232,213,176,0.5)]" />
                            <span className="text-primary/60 text-xs">Wins by Wickets: {eraStats.resultTypes.wickets || 0}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[rgba(255,255,255,0.1)]" />
                            <span className="text-primary/60 text-xs">Draws: {eraStats.resultTypes.draw || 0}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[rgba(201,168,76,0.4)]" />
                            <span className="text-primary/60 text-xs">Innings: {eraStats.resultTypes.innings || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                  {/* Era Overview */}
                  <div>
                    <div className="font-mono text-[10px] text-accent tracking-wider mb-4">ERA OVERVIEW</div>
                    <div className="font-display italic text-[28px] text-accent mb-3">
                      {eras.find(e => e.id === activeEra)?.name}
                    </div>
                    <p className="font-serif text-sm text-primary/70 leading-relaxed">
                      {eraContext[activeEra]?.description}
                    </p>
                  </div>

                  {/* Notable Records */}
                  <div>
                    <div className="font-mono text-[10px] text-accent tracking-wider mb-4">NOTABLE RECORDS</div>
                    <div className="space-y-3">
                      {eraContext[activeEra]?.records.map((record, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-accent text-xs mt-1">◆</span>
                          <span className="font-serif text-sm text-primary/80">{record}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mini Timeline */}
                  <div>
                    <div className="font-mono text-[10px] text-accent tracking-wider mb-4">KEY EVENTS</div>
                    <div className="relative pl-6">
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-accent/30" />
                      {eraContext[activeEra]?.timeline.map((event, i) => (
                        <div key={i} className="relative mb-4 last:mb-0">
                          <div className="absolute -left-[26px] top-1 w-1.5 h-1.5 rounded-full bg-accent" />
                          <div className="font-mono text-[10px] text-primary/60">{event.year}</div>
                          <div className="font-serif text-xs text-primary/80">{event.event}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!eraStats && !loading && (
            <div className="text-center py-12 text-primary/60">
              No data available for this era
            </div>
          )}
        </motion.div>

        {/* Section 2: Head to Head */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="w-full h-px bg-accent/30 mb-8" />
          <div className="font-mono text-[10px] text-accent tracking-[0.3em] mb-10">
            HEAD TO HEAD
          </div>

          {/* Team Selector */}
          <form onSubmit={handleHeadToHead} className="flex items-center gap-10 mb-12">
            <select
              value={team1}
              onChange={(e) => setTeam1(e.target.value)}
              className="w-[200px] bg-transparent border-none border-b border-white/10 pb-2 text-primary text-sm focus:border-accent outline-none"
            >
              {teams.map((team) => (
                <option key={team._id} value={team.name}>{team.name}</option>
              ))}
            </select>
            <div className="font-display italic text-[32px] text-accent">VS</div>
            <select
              value={team2}
              onChange={(e) => setTeam2(e.target.value)}
              className="w-[200px] bg-transparent border-none border-b border-white/10 pb-2 text-primary text-sm focus:border-accent outline-none"
            >
              {teams.map((team) => (
                <option key={team._id} value={team.name}>{team.name}</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={loading}
              className="bg-accent text-background font-mono text-[11px] tracking-[0.2em] px-8 py-3 hover:brightness-110 transition-all disabled:opacity-50"
            >
              {loading ? 'LOADING...' : 'COMPARE'}
            </button>
          </form>

          {/* VS Result Display */}
          <AnimatePresence>
            {headToHead && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Cinematic VS Layout */}
                <div className="grid grid-cols-[1fr_auto_1fr] gap-10 items-center mb-8">
                  {/* Team 1 */}
                  <div className="text-right">
                    <motion.div 
                      className="font-display text-[64px] text-primary leading-none mb-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      {headToHead.team1}
                    </motion.div>
                    <motion.div 
                      className="font-mono text-[96px] text-accent leading-none mb-2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      {headToHead.team1Wins}
                    </motion.div>
                    <div className="font-mono text-[10px] text-accent tracking-wider mb-3">WINS</div>
                    <div className="font-serif text-lg text-primary/60">
                      {((headToHead.team1Wins / headToHead.totalMatches) * 100).toFixed(1)}%
                    </div>
                    <motion.div 
                      className="h-1 bg-accent mt-2"
                      initial={{ width: 0 }}
                      animate={{ width: `${(headToHead.team1Wins / headToHead.totalMatches) * 100}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>

                  {/* Center Divider */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-px h-12 bg-accent/30" />
                    <div className="font-display italic text-2xl text-primary/60">VS</div>
                    <div className="w-20 h-20 rounded-full border border-accent/20 flex flex-col items-center justify-center">
                      <div className="font-mono text-2xl text-accent">{headToHead.totalMatches}</div>
                      <div className="font-mono text-[9px] text-primary/60">matches</div>
                    </div>
                    <div className="w-px h-12 bg-accent/30" />
                  </div>

                  {/* Team 2 */}
                  <div className="text-left">
                    <motion.div 
                      className="font-display text-[64px] text-primary leading-none mb-2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      {headToHead.team2}
                    </motion.div>
                    <motion.div 
                      className="font-mono text-[96px] text-primary/40 leading-none mb-2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      {headToHead.team2Wins}
                    </motion.div>
                    <div className="font-mono text-[10px] text-accent tracking-wider mb-3">WINS</div>
                    <div className="font-serif text-lg text-primary/60">
                      {((headToHead.team2Wins / headToHead.totalMatches) * 100).toFixed(1)}%
                    </div>
                    <motion.div 
                      className="h-1 bg-primary/30 mt-2"
                      initial={{ width: 0 }}
                      animate={{ width: `${(headToHead.team2Wins / headToHead.totalMatches) * 100}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>

                {/* Draw Count */}
                <div className="text-center mb-10">
                  <div className="font-mono text-xl text-primary/60">
                    DRAWN: {headToHead.draws}
                  </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-3 gap-6 mb-10">
                  {/* Win Distribution */}
                  <div>
                    <div className="font-mono text-[9px] text-accent tracking-wider mb-4">WIN DISTRIBUTION</div>
                    <PieChart width={200} height={200}>
                      <Pie
                        data={[
                          { name: headToHead.team1, value: headToHead.team1Wins },
                          { name: 'Draws', value: headToHead.draws },
                          { name: headToHead.team2, value: headToHead.team2Wins }
                        ]}
                        cx={100}
                        cy={100}
                        innerRadius={60}
                        outerRadius={90}
                        dataKey="value"
                        isAnimationActive={true}
                      >
                        <Cell fill="#C9A84C" />
                        <Cell fill="rgba(255,255,255,0.08)" />
                        <Cell fill="rgba(232,213,176,0.3)" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </div>

                  {/* Win Comparison */}
                  <div>
                    <div className="font-mono text-[9px] text-accent tracking-wider mb-4">WIN COMPARISON</div>
                    <BarChart width={250} height={200} data={[
                      { category: 'Total', team1: headToHead.team1Wins, team2: headToHead.team2Wins }
                    ]}>
                      <XAxis dataKey="category" stroke="rgba(107,107,122,1)" tick={{ fill: '#6B6B7A', fontSize: 11 }} />
                      <YAxis stroke="rgba(107,107,122,1)" tick={{ fill: '#6B6B7A', fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="team1" fill="#C9A84C" isAnimationActive={true} />
                      <Bar dataKey="team2" fill="rgba(232,213,176,0.3)" isAnimationActive={true} />
                    </BarChart>
                  </div>

                  {/* Result Types */}
                  <div>
                    <div className="font-mono text-[9px] text-accent tracking-wider mb-4">HOW THEY WIN</div>
                    <div className="text-primary/60 text-xs pt-20">
                      Result breakdown data available in match details
                    </div>
                  </div>
                </div>

                {/* Recent Matches */}
                {headToHead.recentMatches && headToHead.recentMatches.length > 0 && (
                  <div>
                    <div className="font-mono text-[10px] text-accent tracking-wider mb-4">RECENT ENCOUNTERS</div>
                    <div className="space-y-0">
                      {headToHead.recentMatches.map((match, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center gap-6 py-3 border-b border-white/[0.04] hover:bg-accent/[0.03] transition-colors px-2 -mx-2"
                        >
                          <div className="font-mono text-xs text-primary/60 w-24">
                            {new Date(match.date).toLocaleDateString()}
                          </div>
                          <div className="font-serif text-xs text-primary/60 w-48">
                            {match.venue}
                          </div>
                          <div className="flex-1 font-serif text-sm text-accent">
                            {match.winner}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Section 3: Greatest Records */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="w-full h-px bg-accent/30 mb-8" />
          <div className="font-mono text-[10px] text-accent tracking-[0.3em] mb-10">
            GREATEST RECORDS
          </div>

          <div className="grid grid-cols-3 gap-x-12 gap-y-8">
            {greatestRecords.map((record, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="pb-6 border-b border-white/[0.06]"
              >
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-accent text-xs mt-1">◆</span>
                  <div className="font-mono text-[9px] text-accent tracking-wider">
                    {record.category}
                  </div>
                </div>
                <motion.div 
                  className="font-mono text-[48px] text-primary leading-none mb-2"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                >
                  {record.value}
                </motion.div>
                <div className="font-serif text-sm text-primary/60">
                  {record.detail}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default History;
