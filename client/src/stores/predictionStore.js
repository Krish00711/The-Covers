import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'https://the-covers-backend.onrender.com/api/v1';

const usePredictionStore = create((set) => ({
  matchPrediction: null,
  scorePrediction: null,
  xiPrediction: null,
  similarityPrediction: null,
  loading: false,
  error: null,

  predictMatch: async (params, token) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/predictions/match`, params, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ matchPrediction: response.data.data, loading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Prediction failed';
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  predictScore: async (params, token) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/predictions/score`, params, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ scorePrediction: response.data.data, loading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Prediction failed';
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  predictXI: async (params, token) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/predictions/xi`, params, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ xiPrediction: response.data.data, loading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Prediction failed';
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  predictSimilarPlayers: async (params, token) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/predictions/similar-players`, params, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ similarityPrediction: response.data.data, loading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Prediction failed';
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  clearPredictions: () => set({
    matchPrediction: null,
    scorePrediction: null,
    xiPrediction: null,
    similarityPrediction: null,
  }),

  clearError: () => set({ error: null }),
}));

export default usePredictionStore;
