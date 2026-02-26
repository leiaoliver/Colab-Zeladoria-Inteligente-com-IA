export interface ProcessedReport {
  id: string;
  title: string;
  description: string;
  location?: string;
  category?: string;
  priority?: 'BAIXA' | 'MEDIA' | 'ALTA';
  technicalSummary?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export type FormState = 'idle' | 'loading' | 'success' | 'error';

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
}