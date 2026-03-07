import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';

const usePlayerStore = create((set) => ({
  players: [],
  currentPlayer: null,
  similarPlayers: [],
  filters: {},
  pagination: { page: 1, limit: 20, total: 0, pages: 0 },
  loading: false,
  error: null,

  fetchPlayers: async (filters = {}, page = 1) => {
    set({ loading: true, error: null });
    try {
      const params = { ...filters, page, limit: 20 };
      const response = await axios.get(`${API_URL}/players`, { params });
      set({
        players: response.data.data,
        pagination: {
          page: response.data.page,
          limit: 20,
          total: response.data.total,
          pages: response.data.pages,
        },
        filters,
        loading: false,
      });
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch players', loading: false });
    }
  },

  fetchPlayerById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/players/${id}`);
      set({ currentPlayer: response.data.data, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch player', loading: false });
    }
  },

  fetchSimilarPlayers: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/players/${id}/similar`);
      set({ similarPlayers: response.data.data, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch similar players', loading: false });
    }
  },

  setFilters: (filters) => set({ filters }),

  clearCurrentPlayer: () => set({ currentPlayer: null, similarPlayers: [] }),
}));

export default usePlayerStore;
