import api from './axios';
import { unwrapDataFromResponse } from './envelope';

export const dashboardApi = {
  /** Single dashboard payload: KPIs + recent subscriptions/payments + overdue list */
  getDashboard: async () => {
    const response = await api.get('/dashboard');
    return unwrapDataFromResponse(response);
  },

  /** Server-filtered reports (pagination + summary) */
  getReports: async (params) => {
    const response = await api.get('/dashboard/reports', { params });
    return unwrapDataFromResponse(response);
  },
};
