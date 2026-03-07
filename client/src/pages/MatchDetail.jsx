import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import matchService from '../services/matchService';

function MatchDetail() {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMatch();
  }, [id]);

  const fetchMatch = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await matchService.getMatchById(id);
      setMatch(response.data);
    } catch (err) {
      setError(err.message || 'Failed to load match');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12 text-primary/60">Loading match...</div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12 text-red-400">
          {error || 'Match not found'}
        </div>
        <div className="text-center">
          <Link to="/matches" className="text-accent hover:underline">
            Back to Matches
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/matches" className="text-accent hover:underline mb-4 inline-block">
        ← Back to Matches
      </Link>

      {/* Match Header */}
      <div className="mb-8 p-6 bg-background border border-primary/20 rounded">
        <div className="text-sm text-primary/60 mb-4">
          {match.startDate && new Date(match.startDate).toLocaleDateString()}
          {match.venue?.name && ` • ${match.venue.name}`}
          {match.venue?.city && `, ${match.venue.city}`}
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-2xl font-display font-bold text-primary">
              {match.team1?.name || 'Team 1'}
            </h2>
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-primary">
              {match.team2?.name || 'Team 2'}
            </h2>
          </div>
        </div>

        {match.result && match.winningTeam && (
          <div className="pt-4 border-t border-primary/10">
            <div className="text-xl text-accent font-semibold">
              {match.winningTeam.name} won
            </div>
            {match.winMargin && (
              <div className="text-primary/70">by {match.winMargin}</div>
            )}
          </div>
        )}
      </div>

      {/* Toss Info */}
      {match.tossWinner && (
        <div className="mb-6 p-4 bg-background border border-primary/20 rounded">
          <div className="text-sm text-primary/60">Toss</div>
          <div className="text-primary">
            {match.tossWinner.name} won the toss and chose to {match.tossDecision}
          </div>
        </div>
      )}

      {/* Innings */}
      {match.innings && match.innings.length > 0 && (
        <div className="mb-8">
          <h3 className="text-2xl font-display font-bold text-primary mb-4">
            Scorecard
          </h3>
          <div className="space-y-6">
            {match.innings.map((innings, index) => (
              <div key={innings._id} className="p-6 bg-background border border-primary/20 rounded">
                <h4 className="text-xl font-bold text-accent mb-4">
                  {innings.battingTeam?.name || `Innings ${innings.inningsNumber}`}
                </h4>
                <div className="text-3xl font-mono text-primary mb-4">
                  {innings.totalRuns}/{innings.totalWickets}
                  <span className="text-lg text-primary/60 ml-2">
                    ({innings.overs} overs)
                  </span>
                </div>

                {/* Batting Scorecard */}
                {innings.battingScorecard && innings.battingScorecard.length > 0 && (
                  <div className="mb-6">
                    <h5 className="text-lg font-semibold text-primary mb-3">Batting</h5>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-primary/20">
                            <th className="text-left py-2 text-primary/70">Batsman</th>
                            <th className="text-right py-2 text-primary/70">R</th>
                            <th className="text-right py-2 text-primary/70">B</th>
                            <th className="text-right py-2 text-primary/70">4s</th>
                            <th className="text-right py-2 text-primary/70">6s</th>
                            <th className="text-right py-2 text-primary/70">SR</th>
                          </tr>
                        </thead>
                        <tbody>
                          {innings.battingScorecard.map((bat, i) => (
                            <tr key={i} className="border-b border-primary/10">
                              <td className="py-2 text-primary">
                                {bat.player?.name || 'Unknown'}
                              </td>
                              <td className="text-right font-mono text-primary">{bat.runs}</td>
                              <td className="text-right font-mono text-primary/70">{bat.balls}</td>
                              <td className="text-right font-mono text-primary/70">{bat.fours}</td>
                              <td className="text-right font-mono text-primary/70">{bat.sixes}</td>
                              <td className="text-right font-mono text-primary/70">
                                {bat.strikeRate?.toFixed(1)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Bowling Scorecard */}
                {innings.bowlingScorecard && innings.bowlingScorecard.length > 0 && (
                  <div>
                    <h5 className="text-lg font-semibold text-primary mb-3">Bowling</h5>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-primary/20">
                            <th className="text-left py-2 text-primary/70">Bowler</th>
                            <th className="text-right py-2 text-primary/70">O</th>
                            <th className="text-right py-2 text-primary/70">M</th>
                            <th className="text-right py-2 text-primary/70">R</th>
                            <th className="text-right py-2 text-primary/70">W</th>
                            <th className="text-right py-2 text-primary/70">Econ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {innings.bowlingScorecard.map((bowl, i) => (
                            <tr key={i} className="border-b border-primary/10">
                              <td className="py-2 text-primary">
                                {bowl.player?.name || 'Unknown'}
                              </td>
                              <td className="text-right font-mono text-primary/70">{bowl.overs}</td>
                              <td className="text-right font-mono text-primary/70">{bowl.maidens}</td>
                              <td className="text-right font-mono text-primary/70">{bowl.runs}</td>
                              <td className="text-right font-mono text-primary">{bowl.wickets}</td>
                              <td className="text-right font-mono text-primary/70">
                                {bowl.economy?.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Match Narrative */}
      {match.narrative && (
        <div className="p-6 bg-background border border-primary/20 rounded">
          <h3 className="text-xl font-display font-bold text-primary mb-4">
            Match Summary
          </h3>
          <p className="text-primary/80">{match.narrative}</p>
        </div>
      )}
    </div>
  );
}

export default MatchDetail;
