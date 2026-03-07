import api from './api';

const playerService = {
  getPlayers: async (filters = {}, page = 1) => {
    const response = await api.get('/players', {
      params: { ...filters, page, limit: 20 },
    });
    return response.data;
  },

  getPlayerById: async (id) => {
    const response = await api.get(`/players/${id}`);
    return response.data;
  },

  getSimilarPlayers: async (id) => {
    const response = await api.get(`/players/${id}/similar`);
    return response.data;
  },
};

export default playerService;
