import api from './api';

const statsService = {
  getRecords: async () => {
    const response = await api.get('/stats/records');
    return response.data;
  },

  getRankings: async () => {
    const response = await api.get('/stats/rankings');
    return response.data;
  },

  getHeadToHead: async (team1, team2) => {
    const response = await api.get('/stats/head-to-head', {
      params: { team1, team2 },
    });
    return response.data;
  },

  getEraStats: async (era) => {
    const response = await api.get(`/stats/era/${era}`);
    return response.data;
  },
};

export default statsService;
