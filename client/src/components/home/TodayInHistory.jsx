import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import matchService from '../../services/matchService';
import SkeletonLoader from '../ui/SkeletonLoader';

function TodayInHistory() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await matchService.getTodayInHistory();
        setMatches(response.data || []);
      } catch (error) {
        console.error('Failed to fetch today in history:', error);
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  if (loading) {
    return (
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <SkeletonLoader variant="title" className="mb-8" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <SkeletonLoader key={i} variant="card" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (matches.length === 0) {
    return (
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-display font-bold text-primary mb-8"
          >
            On This Day in Test Cricket
          </motion.h2>
          <p className="text-primary/60 text-center py-12">
            No Test matches were played on this day in history
          </p>
        </div>
      </section>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-display font-bold text-primary mb-12"
        >
          On This Day in Test Cricket
        </motion.h2>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {matches.slice(0, 6).map((match) => (
            <motion.div
              key={match._id}
              variants={cardVariants}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <Link
                to={`/matches/${match._id}`}
                className="block h-full p-6 bg-background border border-primary/20 rounded-lg hover:border-accent/50 transition-colors"
              >
                <div className="text-3xl font-mono font-bold text-accent mb-4">
                  {new Date(match.startDate).getFullYear()}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="text-lg text-primary font-body">
                    {match.team1?.name || 'Team 1'}
                  </div>
                  <div className="text-sm text-primary/60">vs</div>
                  <div className="text-lg text-primary font-body">
                    {match.team2?.name || 'Team 2'}
                  </div>
                </div>

                {match.venue && (
                  <div className="text-sm text-primary/70 mb-3">
                    📍 {match.venue.name}
                    {match.venue.city && `, ${match.venue.city}`}
                  </div>
                )}

                {match.result && match.winningTeam && (
                  <div className="pt-3 border-t border-primary/10">
                    <div className="text-sm text-accent font-semibold">
                      {match.winningTeam.name} won
                    </div>
                    {match.winMargin && (
                      <div className="text-xs text-primary/60 mt-1">
                        by {match.winMargin}
                      </div>
                    )}
                  </div>
                )}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default TodayInHistory;
