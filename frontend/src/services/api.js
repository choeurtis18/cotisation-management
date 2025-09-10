import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour gérer les erreurs globalement
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Erreur API:', error);
    return Promise.reject(error);
  }
);

// Services pour les adhérents
export const adherentsService = {
  getAll: () => api.get('/adherents'),
  getById: (id) => api.get(`/adherents/${id}`),
  create: (adherent) => api.post('/adherents', adherent),
  update: (id, adherent) => api.put(`/adherents/${id}`, adherent),
  delete: (id) => api.delete(`/adherents/${id}`),
  getCotisationsByYear: (id, annee) => api.get(`/adherents/${id}/cotisations/${annee}`),
};

// Services pour les cotisations
export const cotisationsService = {
  getAll: () => api.get('/cotisations'),
  getById: (id) => api.get(`/cotisations/${id}`),
  create: (cotisation) => api.post('/cotisations', cotisation),
  update: (id, cotisation) => api.put(`/cotisations/${id}`, cotisation),
  delete: (id) => api.delete(`/cotisations/${id}`),
  getMensuellesByYear: (id, annee) => api.get(`/cotisations/${id}/mensuelles/${annee}`),
};

// Services pour les cotisations mensuelles
export const cotisationsMensuellesService = {
  getAll: (params = {}) => api.get('/cotisations-mensuelles', { params }),
  getById: (id) => api.get(`/cotisations-mensuelles/${id}`),
  create: (cotisationMensuelle) => api.post('/cotisations-mensuelles', cotisationMensuelle),
  update: (id, cotisationMensuelle) => api.put(`/cotisations-mensuelles/${id}`, cotisationMensuelle),
  delete: (id) => api.delete(`/cotisations-mensuelles/${id}`),
};

export default api;
