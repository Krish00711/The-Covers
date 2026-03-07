import api from './api';

const aiService = {
  chat: async (message, history = []) => {
    const response = await api.post('/ai/chat', { message, history });
    return response.data;
  },
};

export default aiService;
