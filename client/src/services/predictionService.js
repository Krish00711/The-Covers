import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1';

// Create separate axios instance for predictions with longer timeout
const predictionApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds for ML predictions
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
predictionApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const predictionService = {
  predictMatch: async (params) => {
    const response = await predictionApi.post('/predictions/match', params);
    return response.data;
  },

  predictScore: async (params) => {
    const response = await predictionApi.post('/predictions/score', params);
    return response.data;
  },

  predictXI: async (params) => {
    const response = await predictionApi.post('/predictions/xi', params);
    return response.data;
  },

  predictSimilarPlayers: async (params) => {
    const response = await predictionApi.post('/predictions/similar-players', params);
    return response.data;
  },
};

export default predictionService;
