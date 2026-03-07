import api from './api';

const liveService = {
  getLiveMatches: async () => {
    const response = await api.get('/live/matches');
    return response.data;
  },

  getUpcomingMatches: async () => {
    const response = await api.get('/live/upcoming');
    return response.data;
  },

  getCurrentRankings: async () => {
    const response = await api.get('/live/rankings');
    return response.data;
  },

  getMatchScorecard: async (matchId) => {
    const response = await api.get(`/live/scorecard/${matchId}`);
    return response.data;
  }
};

export default liveService;
