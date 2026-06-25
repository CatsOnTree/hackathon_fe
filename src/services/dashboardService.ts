import { api } from './axios';
import type { DashboardSummary } from '../types/dashboard';

export const dashboardService = {
  async getSummary() {
    const { data } = await api.get<DashboardSummary>('/api/dashboard/summary');
    return data;
  },
};
