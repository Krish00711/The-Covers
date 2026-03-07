import { useEffect, useState } from 'react';
import liveService from '../services/liveService';

function Schedule() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUpcomingMatches();
  }, []);

  const fetchUpcomingMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await liveService.getUpcomingMatches();
      setMatches(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load upcoming matches');
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-b from-accent/10 to-background border-b border-primary/10">
          <div className="container mx-auto px-4 py-12">
            <h1 className="text-5xl md:text-6xl font-display font-bold text-primary mb-4">Schedule</h1>
            <p className="text-lg text-primary/70">Upcoming Test matches from around the world</p>
          </div>
        </div>
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="inline-block w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin mb-4"></div>
          <div className="text-primary/60 font-mono">Loading schedule...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-b from-accent/10 to-background border-b border-primary/10">
          <div className="container mx-auto px-4 py-12">
            <h1 className="text-5xl md:text-6xl font-display font-bold text-primary mb-4">Schedule</h1>
            <p className="text-lg text-primary/70">Upcoming Test matches from around the world</p>
          </div>
        </div>
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-red-400 font-mono">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-b from-accent/10 to-background border-b border-primary/10">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-5xl md:text-6xl font-display font-bold text-primary mb-4">
            Schedule
          </h1>
          <p className="text-lg text-primary/70">Upcoming Test matches from around the world</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {matches.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/5 border border-primary/20 rounded-full mb-6">
              <svg className="w-10 h-10 text-primary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-xl text-primary/60 font-mono">No upcoming Test matches scheduled</div>
          </div>
        ) : (
          <div className="space-y-6">
            {matches.map((match, index) => (
              <div
                key={match.id}
                className="relative p-6 overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                <div className="absolute inset-0 border border-primary/10 rounded-2xl hover:border-accent/30 transition-colors" />
                
                {/* Glow effect on hover */}
                <div className="absolute -inset-1 bg-gradient-to-r from-accent/0 to-accent/0 hover:from-accent/10 hover:to-primary/10 rounded-2xl blur-xl opacity-0 hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="text-sm text-accent font-mono uppercase tracking-wider">
                      {match.date && new Date(match.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-2xl font-display font-bold text-primary">
                      {match.name}
                    </div>
                    <div className="flex items-center gap-4 text-lg text-primary">
                      <span className="font-semibold">{match.teams?.[0] || 'Team 1'}</span>
                      <span className="text-primary/40">vs</span>
                      <span className="font-semibold">{match.teams?.[1] || 'Team 2'}</span>
                    </div>
                    {match.venue && (
                      <div className="flex items-center gap-2 text-sm text-primary/60">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {match.venue}
                      </div>
                    )}
                  </div>
                  {match.matchType && (
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent rounded-xl" />
                      <div className="relative px-6 py-3 border border-accent/20 rounded-xl text-accent font-mono text-sm uppercase tracking-wider">
                        {match.matchType}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Schedule;
