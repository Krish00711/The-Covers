import api from './api';

const venueService = {
  getVenues: async (country = null) => {
    const params = country ? { country } : {};
    const response = await api.get('/venues', { params });
    return response.data;
  },

  getVenueById: async (id) => {
    const response = await api.get(`/venues/${id}`);
    return response.data;
  },
};

export default venueService;
