import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import playerService from '../services/playerService';

function PlayerDetail() {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [similarPlayers, setSimilarPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlayer();
    fetchSimilarPlayers();
  }, [id]);

  const fetchPlayer = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await playerService.getPlayerById(id);
      setPlayer(response.data);
    } catch (err) {
      setError(err.message || 'Failed to load player');
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilarPlayers = async () => {
    try {
      const response = await playerService.getSimilarPlayers(id);
      setSimilarPlayers(response.data || []);
    } catch (err) {
      console.error('Failed to load similar players:', err);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12 text-primary/60">Loading player...</div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12 text-red-400">
          {error || 'Player not found'}
        </div>
        <div className="text-center">
          <Link to="/players" className="text-accent hover:underline">
            Back to Players
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/players" className="text-accent hover:underline mb-4 inline-block">
        ← Back to Players
      </Link>

      {/* Player Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-display font-bold text-primary mb-2">
          {player.name}
        </h1>
        <div className="text-xl text-primary/70">
          {player.country} • {player.role}
        </div>
        {player.active !== undefined && (
          <div className="text-sm text-primary/60 mt-2">
            {player.active ? 'Active' : 'Retired'}
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Batting Stats */}
        <div className="p-6 bg-background border border-primary/20 rounded">
          <h3 className="text-xl font-display font-bold text-accent mb-4">
            Batting
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-primary/70">Matches</span>
              <span className="font-mono text-primary">
                {player.batting?.matches || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-primary/70">Runs</span>
              <span className="font-mono text-primary">
                {player.batting?.runs || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-primary/70">Average</span>
              <span className="font-mono text-primary">
                {player.batting?.average?.toFixed(2) || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-primary/70">Strike Rate</span>
              <span className="font-mono text-primary">
                {player.batting?.strikeRate?.toFixed(2) || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-primary/70">Centuries</span>
              <span className="font-mono text-primary">
                {player.batting?.centuries || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-primary/70">Fifties</span>
              <span className="font-mono text-primary">
                {player.batting?.fifties || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-primary/70">High Score</span>
              <span className="font-mono text-primary">
                {player.batting?.highScore || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Bowling Stats */}
        <div className="p-6 bg-background border border-primary/20 rounded">
          <h3 className="text-xl font-display font-bold text-accent mb-4">
            Bowling
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-primary/70">Matches</span>
              <span className="font-mono text-primary">
                {player.bowling?.matches || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-primary/70">Wickets</span>
              <span className="font-mono text-primary">
                {player.bowling?.wickets || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-primary/70">Average</span>
              <span className="font-mono text-primary">
                {player.bowling?.average?.toFixed(2) || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-primary/70">Economy</span>
              <span className="font-mono text-primary">
                {player.bowling?.economy?.toFixed(2) || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-primary/70">Strike Rate</span>
              <span className="font-mono text-primary">
                {player.bowling?.strikeRate?.toFixed(2) || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-primary/70">5 Wickets</span>
              <span className="font-mono text-primary">
                {player.bowling?.fiveWickets || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-primary/70">Best</span>
              <span className="font-mono text-primary">
                {player.bowling?.bestInnings || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Fielding Stats */}
        <div className="p-6 bg-background border border-primary/20 rounded">
          <h3 className="text-xl font-display font-bold text-accent mb-4">
            Fielding
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-primary/70">Catches</span>
              <span className="font-mono text-primary">
                {player.fielding?.catches || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-primary/70">Stumpings</span>
              <span className="font-mono text-primary">
                {player.fielding?.stumpings || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      {player.bio && (
        <div className="mb-8 p-6 bg-background border border-primary/20 rounded">
          <h3 className="text-xl font-display font-bold text-primary mb-4">
            Biography
          </h3>
          <p className="text-primary/80">{player.bio}</p>
        </div>
      )}

      {/* Similar Players */}
      {similarPlayers.length > 0 && (
        <div>
          <h3 className="text-2xl font-display font-bold text-primary mb-4">
            Similar Players
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {similarPlayers.map((similar) => (
              <Link
                key={similar._id}
                to={`/players/${similar._id}`}
                className="p-4 bg-background border border-primary/20 rounded hover:border-accent/50"
              >
                <div className="font-bold text-primary">{similar.name}</div>
                <div className="text-sm text-primary/60">{similar.country}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PlayerDetail;
