import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import useAuthStore from '../../stores/authStore';
import useUIStore from '../../stores/uiStore';
import liveService from '../../services/liveService';

function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasLiveMatches, setHasLiveMatches] = useState(false);

  useEffect(() => {
    const checkLiveMatches = async () => {
      try {
        const response = await liveService.getLiveMatches();
        setHasLiveMatches(response.data && response.data.length > 0);
      } catch (error) {
        setHasLiveMatches(false);
      }
    };

    checkLiveMatches();
    // Check every 2 minutes
    const interval = setInterval(checkLiveMatches, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/players', label: 'Players' },
    { to: '/matches', label: 'Matches', hasIndicator: hasLiveMatches },
    { to: '/schedule', label: 'Schedule' },
    { to: '/venues', label: 'Venues' },
    { to: '/stats-lab', label: 'Stats Lab' },
    { to: '/history', label: 'History' },
    { to: '/ai-analyst', label: 'AI Analyst' },
    { to: '/editorial', label: 'Editorial' },
  ];

  return (
    <nav className="bg-background border-b border-primary/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-display font-bold text-primary">
            Test Cricket Universe
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-primary/80 hover:text-primary transition-colors relative flex items-center gap-2"
              >
                {link.label}
                {link.hasIndicator && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-primary/80">{user?.name}</span>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-accent text-background rounded hover:bg-accent/90 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-primary/80 hover:text-primary transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-accent text-background rounded hover:bg-accent/90 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-primary"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-primary/20">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="block py-2 text-primary/80 hover:text-primary transition-colors flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
                {link.hasIndicator && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
              </Link>
            ))}
            <div className="mt-4 pt-4 border-t border-primary/20">
              {isAuthenticated ? (
                <>
                  <div className="py-2 text-primary/80">{user?.name}</div>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full mt-2 px-4 py-2 bg-accent text-background rounded hover:bg-accent/90 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block py-2 text-primary/80 hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block mt-2 px-4 py-2 bg-accent text-background rounded hover:bg-accent/90 transition-colors text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
