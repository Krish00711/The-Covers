import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import liveService from '../../services/liveService';
import SkeletonLoader from '../ui/SkeletonLoader';

function RankingsSnapshot() {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const response = await liveService.getCurrentRankings();
        setRankings(response.data || []);
      } catch (error) {
        console.error('Failed to fetch rankings:', error);
        setRankings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, []);

  if (loading) {
    return (
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <SkeletonLoader variant="title" className="mb-8" />
          <div className="grid md:grid-cols-1 gap-8">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <SkeletonLoader key={i} className="h-16" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!rankings || rankings.length === 0) {
    return (
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-4xl font-display font-bold text-primary mb-4">
            ICC Test Rankings
          </h2>
          <p className="text-primary/60">Rankings data not available</p>
        </div>
      </section>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <section className="py-16 px-4 bg-primary/5">
      <div className="container mx-auto max-w-4xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-display font-bold text-primary mb-12 text-center"
        >
          ICC Test Rankings
        </motion.h2>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="space-y-3">
            {rankings.slice(0, 10).map((team, index) => (
              <motion.div
                key={team.team || index}
                variants={itemVariants}
                className="flex items-center justify-between p-4 bg-background/50 border border-primary/10 rounded hover:border-accent/30 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <span className="text-2xl font-mono font-bold text-accent w-8">
                    {team.rank || index + 1}
                  </span>
                  <span className="text-lg text-primary font-body">
                    {team.team}
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-sm text-primary/60">Rating</div>
                    <div className="text-xl font-mono font-bold text-primary">
                      {team.rating || 'N/A'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-primary/60">Points</div>
                    <div className="text-xl font-mono font-bold text-primary">
                      {team.points || 'N/A'}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default RankingsSnapshot;
