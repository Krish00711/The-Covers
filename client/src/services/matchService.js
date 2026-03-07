import api from './api';

const matchService = {
  getMatches: async (filters = {}, page = 1) => {
    const response = await api.get('/matches', {
      params: { ...filters, page, limit: 20 },
    });
    return response.data;
  },

  getMatchById: async (id) => {
    const response = await api.get(`/matches/${id}`);
    return response.data;
  },

  getTodayInHistory: async () => {
    const response = await api.get('/matches/today-in-history');
    return response.data;
  },
};

export default matchService;
