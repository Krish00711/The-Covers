import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import liveService from '../../services/liveService';

function LiveTicker() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  const fetchMatches = async () => {
    try {
      // Try to get live matches first
      const liveResponse = await liveService.getLiveMatches();

      if (liveResponse.data && liveResponse.data.length > 0) {
        setMatches(liveResponse.data);
        setIsLive(true);
      } else {
        // If no live matches, show upcoming
        const upcomingResponse = await liveService.getUpcomingMatches();
        setMatches(upcomingResponse.data || []);
        setIsLive(false);
      }
    } catch (error) {
      console.error('Failed to fetch matches:', error);
      setMatches([]);
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();

    // Auto refresh every 2 minutes
    const interval = setInterval(fetchMatches, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-accent/10 border-y border-accent/20 py-3 overflow-hidden">
        <div className="animate-pulse flex space-x-8">
          <div className="h-4 bg-primary/10 rounded w-64"></div>
          <div className="h-4 bg-primary/10 rounded w-64"></div>
          <div className="h-4 bg-primary/10 rounded w-64"></div>
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="bg-accent/10 border-y border-accent/20 py-3">
        <div className="text-center text-primary/60 text-sm font-mono">
          No live or upcoming Test matches
        </div>
      </div>
    );
  }

  // Duplicate matches for seamless loop
  const tickerItems = [...matches, ...matches];

  return (
    <div className="bg-accent/10 border-y border-accent/20 py-3 overflow-hidden relative">
      <motion.div
        className="flex space-x-12"
        animate={{
          x: [0, -50 + '%'],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: 'loop',
            duration: 30,
            ease: 'linear',
          },
        }}
      >
        {tickerItems.map((match, index) => (
          <div
            key={`${match.id}-${index}`}
            className="flex-shrink-0 text-primary/80 text-sm font-mono whitespace-nowrap flex items-center gap-2"
          >
            {isLive && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
            )}
            <span className="text-accent font-semibold">
              {isLive ? 'LIVE' : 'UPCOMING'}
            </span>
            {' • '}
            <span>{match.teams?.[0] || match.team1?.name || 'Team 1'}</span>
            {' vs '}
            <span>{match.teams?.[1] || match.team2?.name || 'Team 2'}</span>
            {match.venue && (
              <>
                {' at '}
                <span className="text-primary">{match.venue}</span>
              </>
            )}
            {isLive && match.status && (
              <>
                {' • '}
                <span className="text-primary/70">{match.status}</span>
              </>
            )}
            {!isLive && match.date && (
              <>
                {' • '}
                <span className="text-primary/70">{new Date(match.date).toLocaleDateString()}</span>
              </>
            )}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default LiveTicker;
