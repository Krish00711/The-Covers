import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import liveService from '../services/liveService';

function Home() {
  const navigate = useNavigate();
  const [liveMatches, setLiveMatches] = useState([]);
  const [liveCount, setLiveCount] = useState(0);
  const { scrollY } = useScroll();
  
  const imageOpacity = useTransform(scrollY, [0, 800], [1, 0.3]);
  const titleY = useTransform(scrollY, [0, 400], [0, -100]);

  useEffect(() => {
    const fetchLive = async () => {
      try {
        const response = await liveService.getLiveMatches();
        const live = response.data || [];
        setLiveMatches(live.slice(0, 5));
        setLiveCount(live.length);
      } catch (err) {
        console.error('Failed to fetch live matches');
      }
    };
    fetchLive();
  }, []);

  return (
    <div style={{ width: '100%', minHeight: '100vh', position: 'relative', background: 'var(--bg)' }}>
      {/* Fixed Background Image - MUCH MORE VISIBLE */}
      <motion.div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: 'url(/image.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundAttachment: 'fixed',
          filter: 'brightness(1.1) contrast(1.15) saturate(1.1)',
          opacity: imageOpacity,
          zIndex: 0,
        }}
      />
      
      {/* Lighter Gradient Overlay - Show More Image */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(10,10,15,0.3) 0%, rgba(10,10,15,0.5) 50%, rgba(10,10,15,0.8) 100%)',
          zIndex: 1,
        }}
      />

      {/* Scrollable Content */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {/* Hero Section */}
        <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 100px', position: 'relative' }}>
          <motion.div style={{ y: titleY }}>
            {/* Decorative Line */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '120px' }}
              transition={{ duration: 1, delay: 0.2 }}
              style={{
                height: '2px',
                background: 'linear-gradient(to right, var(--accent), transparent)',
                marginBottom: '32px',
              }}
            />

            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}
            >
              <span className="mono" style={{ fontSize: '11px', color: 'var(--accent)', letterSpacing: '4px', fontWeight: 600 }}>
                WELCOME TO
              </span>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, var(--accent), transparent)', maxWidth: '200px' }} />
            </motion.div>

            {/* Main Title with Glow */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="display"
              style={{
                fontSize: '160px',
                lineHeight: '0.9',
                color: 'var(--text)',
                fontWeight: 700,
                fontStyle: 'italic',
                marginBottom: '32px',
                textShadow: '0 0 80px rgba(201,168,76,0.4), 0 4px 30px rgba(0,0,0,0.8)',
                letterSpacing: '-2px',
              }}
            >
              The Covers
            </motion.h1>

            {/* Subtitle with Rich Typography */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              style={{ maxWidth: '700px', marginBottom: '56px' }}
            >
              <p style={{
                fontSize: '28px',
                color: 'var(--text)',
                lineHeight: '1.5',
                marginBottom: '16px',
                fontWeight: 300,
              }}>
                Where Test cricket lives.
              </p>
              <p style={{
                fontSize: '18px',
                color: 'var(--muted)',
                lineHeight: '1.8',
              }}>
                Explore legendary players, iconic moments, and AI-powered insights from the gentleman's game. 
                Dive deep into statistics, live matches, and the rich history of Test cricket.
              </p>
            </motion.div>

            {/* Enhanced CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
              style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}
            >
              <button
                onClick={() => navigate('/players')}
                style={{
                  background: 'var(--accent)',
                  border: 'none',
                  color: 'var(--bg)',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '18px 40px',
                  borderRadius: '4px',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 20px rgba(201,168,76,0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(201,168,76,0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(201,168,76,0.3)';
                }}
              >
                Explore Players →
              </button>
              
              <button
                onClick={() => navigate('/stats-lab')}
                style={{
                  background: 'transparent',
                  border: '2px solid var(--accent)',
                  color: 'var(--accent)',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '16px 40px',
                  borderRadius: '4px',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--accent)';
                  e.currentTarget.style.color = 'var(--bg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--accent)';
                }}
              >
                Try Stats Lab
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginLeft: '24px' }}>
                <div style={{ width: '1px', height: '40px', background: 'var(--border)' }} />
                <div>
                  <div className="mono" style={{ fontSize: '24px', color: 'var(--accent)', fontWeight: 700, lineHeight: '1' }}>
                    1,025+
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
                    Players
                  </div>
                </div>
                <div>
                  <div className="mono" style={{ fontSize: '24px', color: 'var(--accent)', fontWeight: 700, lineHeight: '1' }}>
                    898
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
                    Matches
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Live Matches - Enhanced Floating Display */}
          {liveCount > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 1.3 }}
              style={{
                position: 'absolute',
                right: '100px',
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            >
              <div style={{ textAlign: 'right', position: 'relative' }}>
                {/* Glow Effect */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  right: '50%',
                  transform: 'translate(50%, -50%)',
                  width: '300px',
                  height: '300px',
                  background: 'radial-gradient(circle, rgba(201,168,76,0.15) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }} />
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', marginBottom: '24px' }}>
                  <div className="pulse-gold" style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent)' }} />
                  <span className="mono" style={{ fontSize: '11px', color: 'var(--accent)', letterSpacing: '3px', fontWeight: 600 }}>
                    LIVE NOW
                  </span>
                </div>
                
                <div className="mono" style={{ 
                  fontSize: '140px', 
                  color: 'var(--accent)', 
                  lineHeight: '1', 
                  fontWeight: 700, 
                  marginBottom: '16px', 
                  textShadow: '0 0 60px rgba(201,168,76,0.5)',
                  position: 'relative',
                }}>
                  {liveCount}
                </div>
                
                <div style={{ fontSize: '16px', color: 'var(--text)', letterSpacing: '2px', fontWeight: 500, marginBottom: '24px' }}>
                  TESTS IN PROGRESS
                </div>

                {/* Featured Match */}
                {liveMatches.length > 0 && (
                  <div style={{ 
                    borderTop: '1px solid var(--accent)', 
                    paddingTop: '20px',
                    textAlign: 'right',
                  }}>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', letterSpacing: '2px', marginBottom: '12px' }}>
                      FEATURED
                    </div>
                    <div style={{ fontSize: '18px', color: 'var(--text)', fontWeight: 600, marginBottom: '8px' }}>
                      {liveMatches[0].teams?.[0] || 'Team 1'}
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '8px' }}>vs</div>
                    <div style={{ fontSize: '18px', color: 'var(--text)', fontWeight: 600 }}>
                      {liveMatches[0].teams?.[1] || 'Team 2'}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
            style={{
              position: 'absolute',
              bottom: '60px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <span className="mono" style={{ fontSize: '10px', color: 'var(--muted)', letterSpacing: '2px' }}>
              SCROLL
            </span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{
                width: '1px',
                height: '40px',
                background: 'linear-gradient(to bottom, var(--accent), transparent)',
              }}
            />
          </motion.div>
        </section>

        {/* Stats Section - Enhanced with Unique Animations */}
        <section style={{ minHeight: '100vh', padding: '160px 100px', display: 'flex', alignItems: 'center', background: 'transparent' }}>
          <div style={{ width: '100%' }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              style={{ marginBottom: '120px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px' }}>
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: '60px' }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                  style={{ height: '2px', background: 'var(--accent)' }}
                />
                <span className="mono" style={{ fontSize: '11px', color: 'var(--accent)', letterSpacing: '4px' }}>
                  BY THE NUMBERS
                </span>
              </div>
              <h2 className="display" style={{ fontSize: '96px', color: 'var(--text)', fontWeight: 700, fontStyle: 'italic', lineHeight: '1' }}>
                The Cricket
                <br />
                <span style={{ color: 'var(--accent)' }}>Universe</span>
              </h2>
            </motion.div>

            {/* Enhanced Stats Grid with Staggered Animations */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '100px 140px', maxWidth: '1400px' }}>
              {[
                { number: '898', label: 'Test Matches', sublabel: 'Since 1877', detail: 'Spanning 145 years of cricket history', delay: 0 },
                { number: '1,025', label: 'Players', sublabel: 'Legends & Rising Stars', detail: 'From 12 Test-playing nations', delay: 0.15 },
                { number: '25', label: 'Venues', sublabel: 'Iconic Grounds', detail: 'Across 5 continents worldwide', delay: 0.3 },
                { number: '12', label: 'Test Nations', sublabel: 'Competing Teams', detail: 'Elite cricket-playing countries', delay: 0.45 },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8, y: 50 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ 
                    duration: 0.8, 
                    delay: stat.delay,
                    type: "spring",
                    stiffness: 100
                  }}
                  viewport={{ once: true }}
                  style={{
                    position: 'relative',
                    paddingLeft: '40px',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(16px) scale(1.02)';
                    e.currentTarget.querySelector('.accent-line').style.width = '6px';
                    e.currentTarget.querySelector('.accent-line').style.boxShadow = '0 0 20px rgba(201,168,76,0.5)';
                    e.currentTarget.querySelector('.stat-number').style.transform = 'scale(1.1)';
                    e.currentTarget.querySelector('.stat-number').style.textShadow = '0 0 60px rgba(201,168,76,0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0) scale(1)';
                    e.currentTarget.querySelector('.accent-line').style.width = '2px';
                    e.currentTarget.querySelector('.accent-line').style.boxShadow = 'none';
                    e.currentTarget.querySelector('.stat-number').style.transform = 'scale(1)';
                    e.currentTarget.querySelector('.stat-number').style.textShadow = '0 0 40px rgba(201,168,76,0.3)';
                  }}
                >
                  {/* Animated Accent Line */}
                  <motion.div
                    className="accent-line"
                    initial={{ height: 0 }}
                    whileInView={{ height: '100%' }}
                    transition={{ duration: 0.8, delay: stat.delay + 0.3 }}
                    viewport={{ once: true }}
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      width: '2px',
                      background: 'linear-gradient(to bottom, var(--accent), transparent)',
                      transition: 'all 0.4s ease',
                    }}
                  />
                  
                  {/* Number with Enhanced Glow */}
                  <motion.div
                    className="stat-number mono"
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: stat.delay + 0.4 }}
                    viewport={{ once: true }}
                    style={{ 
                      fontSize: '100px', 
                      color: 'var(--accent)', 
                      lineHeight: '1', 
                      fontWeight: 700, 
                      marginBottom: '20px',
                      textShadow: '0 0 40px rgba(201,168,76,0.3)',
                      transition: 'all 0.4s ease',
                    }}
                  >
                    {stat.number}
                  </motion.div>
                  
                  {/* Label with Slide In */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: stat.delay + 0.5 }}
                    viewport={{ once: true }}
                    style={{ fontSize: '28px', color: 'var(--text)', marginBottom: '12px', fontWeight: 600 }}
                  >
                    {stat.label}
                  </motion.div>
                  
                  {/* Sublabel */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: stat.delay + 0.6 }}
                    viewport={{ once: true }}
                    style={{ fontSize: '16px', color: 'var(--muted)', marginBottom: '16px' }}
                  >
                    {stat.sublabel}
                  </motion.div>
                  
                  {/* Detail with Fade In */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 0.7 }}
                    transition={{ duration: 0.5, delay: stat.delay + 0.7 }}
                    viewport={{ once: true }}
                    style={{ fontSize: '14px', color: 'var(--muted)', fontStyle: 'italic' }}
                  >
                    {stat.detail}
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Explore Section - Unique Design with Advanced Animations */}
        <section style={{ minHeight: '100vh', padding: '160px 100px', display: 'flex', alignItems: 'center', background: 'transparent' }}>
          <div style={{ width: '100%' }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              style={{ marginBottom: '100px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px' }}>
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: '60px' }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                  style={{ height: '2px', background: 'var(--accent)' }}
                />
                <span className="mono" style={{ fontSize: '11px', color: 'var(--accent)', letterSpacing: '4px' }}>
                  EXPLORE
                </span>
              </div>
              <h2 className="display" style={{ fontSize: '96px', color: 'var(--text)', fontWeight: 700, fontStyle: 'italic', lineHeight: '1' }}>
                Discover
                <br />
                <span style={{ color: 'var(--accent)' }}>More</span>
              </h2>
            </motion.div>

            {/* Unique Navigation Links with Advanced Animations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {[
                { title: 'Players', desc: 'Explore legendary cricketers, their records, and career statistics', path: '/players', num: '01' },
                { title: 'Matches', desc: 'Live scores, match archives, and detailed scorecards', path: '/matches', num: '02' },
                { title: 'Stats Lab', desc: 'Deep dive into cricket analytics with AI-powered insights', path: '/stats-lab', num: '03' },
                { title: 'AI Analyst', desc: 'Get intelligent match predictions and player analysis', path: '/ai-analyst', num: '04' },
                { title: 'History', desc: 'Journey through cricket\'s greatest moments and milestones', path: '/history', num: '05' },
                { title: 'Editorial', desc: 'Read expert analysis, stories, and cricket commentary', path: '/editorial', num: '06' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -60 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ 
                    duration: 0.7, 
                    delay: i * 0.1,
                    type: "spring",
                    stiffness: 80
                  }}
                  viewport={{ once: true }}
                  onClick={() => navigate(item.path)}
                  style={{
                    padding: '48px 0 48px 80px',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '60px',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.paddingLeft = '100px';
                    e.currentTarget.style.borderBottomColor = 'var(--accent)';
                    e.currentTarget.querySelector('.hover-line').style.width = '100%';
                    e.currentTarget.querySelector('.arrow').style.opacity = '1';
                    e.currentTarget.querySelector('.arrow').style.transform = 'translateX(0) rotate(-45deg)';
                    e.currentTarget.querySelector('.number').style.color = 'var(--accent)';
                    e.currentTarget.querySelector('.title').style.transform = 'translateX(8px)';
                    e.currentTarget.querySelector('.bg-glow').style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.paddingLeft = '80px';
                    e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.08)';
                    e.currentTarget.querySelector('.hover-line').style.width = '0%';
                    e.currentTarget.querySelector('.arrow').style.opacity = '0';
                    e.currentTarget.querySelector('.arrow').style.transform = 'translateX(-30px) rotate(0deg)';
                    e.currentTarget.querySelector('.number').style.color = 'var(--muted)';
                    e.currentTarget.querySelector('.title').style.transform = 'translateX(0)';
                    e.currentTarget.querySelector('.bg-glow').style.opacity = '0';
                  }}
                >
                  {/* Background Glow on Hover */}
                  <div
                    className="bg-glow"
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: '100%',
                      background: 'linear-gradient(to right, rgba(201,168,76,0.05), transparent)',
                      opacity: 0,
                      transition: 'opacity 0.4s ease',
                      pointerEvents: 'none',
                    }}
                  />

                  {/* Animated Hover Line */}
                  <div
                    className="hover-line"
                    style={{
                      position: 'absolute',
                      left: 0,
                      bottom: 0,
                      height: '2px',
                      width: '0%',
                      background: 'linear-gradient(to right, var(--accent), transparent)',
                      transition: 'width 0.5s ease',
                    }}
                  />
                  
                  {/* Number with Animation */}
                  <motion.span
                    className="number mono"
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: i * 0.1 + 0.2 }}
                    viewport={{ once: true }}
                    style={{ 
                      fontSize: '20px', 
                      color: 'var(--muted)', 
                      minWidth: '60px',
                      minWidth: '60px',
                      fontWeight: 600,
                      transition: 'color 0.3s ease',
                    }}
                  >
                    {item.num}
                  </motion.span>
                  
                  {/* Content */}
                  <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                    <motion.h3
                      className="title display"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: i * 0.1 + 0.3 }}
                      viewport={{ once: true }}
                      style={{ 
                        fontSize: '56px', 
                        color: 'var(--text)', 
                        marginBottom: '12px', 
                        fontWeight: 600, 
                        lineHeight: '1',
                        transition: 'transform 0.3s ease',
                      }}
                    >
                      {item.title}
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: i * 0.1 + 0.4 }}
                      viewport={{ once: true }}
                      style={{ 
                        fontSize: '18px', 
                        color: 'var(--muted)', 
                        lineHeight: '1.6',
                        maxWidth: '600px',
                      }}
                    >
                      {item.desc}
                    </motion.p>
                  </div>
                  
                  {/* Animated Arrow */}
                  <motion.span
                    className="arrow"
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 0, x: -30 }}
                    viewport={{ once: true }}
                    style={{
                      fontSize: '48px',
                      color: 'var(--accent)',
                      transform: 'translateX(-30px) rotate(0deg)',
                      transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    →
                  </motion.span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;
