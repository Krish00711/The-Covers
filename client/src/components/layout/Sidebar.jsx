import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Activity, MapPin, FlaskConical, BookOpen, Bot, Newspaper, Calendar } from 'lucide-react';

function Sidebar() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (e.clientX <= 20) {
        setVisible(true);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleMouseLeave = () => {
    setVisible(false);
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/players', icon: Users, label: 'Players' },
    { path: '/matches', icon: Activity, label: 'Matches' },
    { path: '/venues', icon: MapPin, label: 'Venues' },
    { path: '/stats-lab', icon: FlaskConical, label: 'Stats Lab' },
    { path: '/history', icon: BookOpen, label: 'History' },
    { path: '/ai-analyst', icon: Bot, label: 'AI Analyst' },
    { path: '/editorial', icon: Newspaper, label: 'Editorial' },
    { path: '/schedule', icon: Calendar, label: 'Schedule' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Invisible trigger zone */}
      <div
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: '20px',
          height: '100vh',
          zIndex: 199,
          background: 'transparent',
          pointerEvents: 'all',
        }}
        onMouseEnter={() => setVisible(true)}
      />

      {/* Active indicator */}
      <div
        style={{
          position: 'fixed',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          width: '3px',
          height: '48px',
          background: 'linear-gradient(to bottom, transparent, rgba(201,168,76,0.4), transparent)',
          borderRadius: '0 2px 2px 0',
          zIndex: 198,
          pointerEvents: 'none',
          opacity: visible ? 0 : 1,
          transition: 'opacity 0.3s',
          animation: 'pulse-indicator 2s ease-in-out infinite',
        }}
      />

      {/* Sidebar */}
      <aside
        onMouseLeave={handleMouseLeave}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          height: '100vh',
          width: '56px',
          background: 'rgba(10,10,15,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRight: '1px solid var(--border)',
          zIndex: 200,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '20px 0',
          transform: visible ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Logo - The Covers */}
        <div
          style={{
            fontSize: '14px',
            marginBottom: '32px',
            color: 'var(--accent)',
            fontFamily: 'Playfair Display, serif',
            fontWeight: 700,
            fontStyle: 'italic',
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            letterSpacing: '2px',
          }}
        >
          TC
        </div>

        {/* Navigation Icons */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '40px',
                  color: active ? 'var(--accent)' : 'var(--muted)',
                  transition: 'color 0.2s',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.color = 'var(--text)';
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.color = 'var(--muted)';
                }}
                title={item.label}
              >
                {active && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '2px',
                      height: '20px',
                      background: 'var(--accent)',
                    }}
                  />
                )}
                <Icon size={20} />
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Keyframes for pulse animation */}
      <style>{`
        @keyframes pulse-indicator {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </>
  );
}

export default Sidebar;
