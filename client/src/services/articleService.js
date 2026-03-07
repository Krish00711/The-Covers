import api from './api';

const articleService = {
  getArticles: async (category = null, page = 1) => {
    const params = { page, limit: 12 };
    if (category && category !== 'all') {
      params.category = category;
    }
    const response = await api.get('/articles', { params });
    return response.data;
  },

  getArticleBySlug: async (slug) => {
    const response = await api.get(`/articles/${slug}`);
    return response.data;
  },
};

export default articleService;
