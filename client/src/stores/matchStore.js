import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';

const useMatchStore = create((set) => ({
  matches: [],
  currentMatch: null,
  filters: {},
  pagination: { page: 1, limit: 20, total: 0, pages: 0 },
  loading: false,
  error: null,

  fetchMatches: async (filters = {}, page = 1) => {
    set({ loading: true, error: null });
    try {
      const params = { ...filters, page, limit: 20 };
      const response = await axios.get(`${API_URL}/matches`, { params });
      set({
        matches: response.data.data,
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
      set({ error: error.response?.data?.error || 'Failed to fetch matches', loading: false });
    }
  },

  fetchMatchById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/matches/${id}`);
      set({ currentMatch: response.data.data, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch match', loading: false });
    }
  },

  fetchTodayInHistory: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/matches/today-in-history`);
      set({ matches: response.data.data, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch history', loading: false });
    }
  },

  setFilters: (filters) => set({ filters }),

  clearCurrentMatch: () => set({ currentMatch: null }),
}));

export default useMatchStore;
