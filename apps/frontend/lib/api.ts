import axios from 'axios';
import { ProcessedReport, ApiError } from './types';
import { ReportFormData } from './validation';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError: ApiError = {
      message: error.response?.data?.message || error.message || 'Erro inesperado',
      statusCode: error.response?.status,
    };
    return Promise.reject(apiError);
  }
);

export class ReportService {
  static async createReport(data: ReportFormData): Promise<ProcessedReport> {
    const response = await api.post<ProcessedReport>('/report', data);
    return response.data;
  }

  static async getReports(): Promise<ProcessedReport[]> {
    const response = await api.get<ProcessedReport[]>('/report');
    return response.data;
  }

  static async getReportById(id: string): Promise<ProcessedReport> {
    const response = await api.get<ProcessedReport>(`/report/${id}`);
    return response.data;
  }
}

export default api;