'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reportSchema, ReportFormData } from '@/lib/validation';
import { ReportService } from '@/lib/api';
import { ProcessedReport, FormState } from '@/lib/types';
import { Loader2, MapPin, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ReportFormProps {
  onSuccess?: (report: ProcessedReport) => void;
}

export default function ReportForm({ onSuccess }: ReportFormProps) {
  const [formState, setFormState] = useState<FormState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [submittedReport, setSubmittedReport] = useState<ProcessedReport | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
  });

  const onSubmit = async (data: ReportFormData) => {
    try {
      setFormState('loading');
      setError(null);

      const report = await ReportService.createReport(data);

      setSubmittedReport(report);
      setFormState('success');
      onSuccess?.(report);
      reset();
    } catch (err: unknown) {
      let message = 'Erro ao processar solicitação';

      if (
        typeof err === 'object' &&
        err !== null &&
        'message' in err &&
        typeof (err as { message: unknown }).message === 'string'
      ) {
        message = (err as { message: string }).message;
      }

      setError(message);
      setFormState('error');
    }
  };

  const resetForm = () => {
    setFormState('idle');
    setError(null);
    setSubmittedReport(null);
    reset();
  };

  // Estado de loading
  if (formState === 'loading') {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Processando seu relato...
          </h2>
          <p className="text-gray-600">
            Nossa IA está analisando e categorizando seu problema. Isso pode levar alguns segundos.
          </p>
        </div>
      </div>
    );
  }

  // Estado de sucesso
  if (formState === 'success' && submittedReport) {
    return (
      <div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Relato enviado com sucesso!
            </h2>
            <p className="text-gray-600">
              Seu problema foi registrado e priorizado automaticamente.
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm">
            <div className="grid gap-2">
              <div>
                <span className="font-semibold text-gray-700">Protocolo:</span>
                <span className="ml-2 text-gray-900 font-mono">#{submittedReport.id.slice(-8).toUpperCase()}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Status:</span>
                <span className="ml-2 text-orange-600 font-semibold">{submittedReport.status}</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={resetForm}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Fazer novo relato
          </button>
        </div>
      </div>
    );
  }

  // Formulário principal
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Colab Zeladoria
          </h1>
          <p className="text-lg text-gray-600">
            Relate problemas urbanos e ajude a melhorar sua cidade
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-800">Erro ao enviar relato</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Título */}
            <div>
              <label htmlFor="title" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4" />
                Título do problema
              </label>
              <input
                {...register('title')}
                type="text"
                id="title"
                placeholder="Ex: Semáforo quebrado na Rua das Flores"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Descrição */}
            <div>
              <label htmlFor="description" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4" />
                Descrição detalhada
              </label>
              <textarea
                {...register('description')}
                id="description"
                rows={5}
                placeholder="Descreva o problema com o máximo de detalhes possível. Quanto mais informações você fornecer, melhor será a análise e priorização do seu relato."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Localização */}
            <div>
              <label htmlFor="location" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4" />
                Localização
              </label>
              <input
                {...register('location')}
                type="text"
                id="location"
                placeholder="Ex: Rua das Flores, 123 - Centro - São Paulo/SP"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-medium text-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Enviando relato...
                </>
              ) : (
                'Enviar relato'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}