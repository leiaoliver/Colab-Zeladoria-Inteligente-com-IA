'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reportSchema, ReportFormData } from '@/lib/validation';
import { ReportService } from '@/lib/api';
import { ProcessedReport, FormState } from '@/lib/types';
import { 
  Loader2, 
  MapPin, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Send,
  Info,
  Building2
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { cn } from '@/lib/utils';

interface ReportFormProps {
  onSuccess?: (report: ProcessedReport) => void;
}

export default function ReportFormProfessional({ onSuccess }: ReportFormProps) {
  const [formState, setFormState] = useState<FormState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [submittedReport, setSubmittedReport] = useState<ProcessedReport | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, touchedFields },
    reset,
    watch,
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    mode: 'onChange',
  });

  // Monitorar valores para feedback em tempo real
  // eslint-disable-next-line react-hooks/incompatible-library
  const titleValue = watch('title');
   
  const descriptionValue = watch('description');
   
  const locationValue = watch('location');

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
      setTimeout(() => setFormState('idle'), 5000);
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
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-2xl">
          <CardContent className="pt-12 pb-12">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-25"></div>
                <div className="relative bg-linear-to-br from-blue-500 to-indigo-600 rounded-full p-6">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  Processando seu relato
                </h2>
                <p className="text-gray-600 max-w-sm">
                  Nossa inteligência artificial está analisando e categorizando seu problema automaticamente
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                </div>
                <span>Aguarde alguns instantes</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Estado de sucesso com design profissional
  if (formState === 'success' && submittedReport) {
    return (
      <div className="min-h-screen bg-linear-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg border-0 shadow-2xl overflow-hidden">
          <div className="bg-linear-to-r from-green-500 to-emerald-600 p-6 text-white">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                <CheckCircle2 className="w-12 h-12" strokeWidth={2.5} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center">
              Relato enviado com sucesso!
            </h2>
          </div>

          <CardContent className="p-6 space-y-6">
            <Alert variant="success" className="border-green-300">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Seu problema foi registrado e nossa IA já realizou a triagem automaticamente. 
                A equipe responsável foi notificada.
              </AlertDescription>
            </Alert>

            <div className="bg-linear-to-br from-gray-50 to-gray-100 rounded-lg p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Protocolo</span>
                <span className="text-lg font-bold text-gray-900 font-mono">
                  #{submittedReport.id.slice(-8).toUpperCase()}
                </span>
              </div>
              
              <div className="border-t border-gray-200 pt-3 space-y-2">
                {submittedReport.category && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Categoria</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                      {submittedReport.category}
                    </span>
                  </div>
                )}
                
                {submittedReport.priority && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Prioridade</span>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-semibold",
                      submittedReport.priority === 'ALTA' && "bg-red-100 text-red-700",
                      submittedReport.priority === 'MEDIA' && "bg-yellow-100 text-yellow-700",
                      submittedReport.priority === 'BAIXA' && "bg-green-100 text-green-700"
                    )}>
                      {submittedReport.priority}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                    {submittedReport.status}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Registrado em</span>
                  <span>{new Date(submittedReport.createdAt).toLocaleString('pt-BR')}</span>
                </div>
              </div>

              {submittedReport.technicalSummary && (
                <div className="border-t border-gray-200 pt-3">
                  <p className="text-xs font-medium text-gray-600 mb-2">Análise Técnica (IA):</p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {submittedReport.technicalSummary}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={resetForm}
                size="lg"
                className="flex-1 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Fazer novo relato
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Formulário principal
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4 sm:py-12">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header com branding */}
        <div className="text-center space-y-3 animate-fade-in">
          <div className="inline-flex items-center justify-center p-3 bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Colab Zeladoria
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Relate problemas urbanos e ajude a construir uma cidade melhor para todos
          </p>
        </div>

        {/* Card do formulário */}
        <Card className="border-0 shadow-2xl overflow-hidden">
          <div className="bg-linear-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <CardTitle className="text-white text-xl">Novo Relato</CardTitle>
            <CardDescription className="text-blue-100">
              Preencha os campos abaixo com os detalhes do problema encontrado
            </CardDescription>
          </div>

          <CardContent className="p-6 sm:p-8">
            {/* Alerta de erro */}
            {error && (
              <Alert variant="destructive" className="mb-6 animate-shake">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro ao enviar relato</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Info sobre IA */}
            <Alert className="mb-6 border-blue-200 bg-blue-50/50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Processamento Inteligente:</strong> Sua solicitação será automaticamente 
                categorizada e priorizada por inteligência artificial.
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Campo Título */}
              <div className="space-y-2">
                <Label htmlFor="title" className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-600" />
                  Título do problema *
                </Label>
                <Input
                  {...register('title')}
                  id="title"
                  placeholder="Ex: Semáforo quebrado na Av. Principal"
                  className={cn(
                    "transition-all duration-200",
                    errors.title && "border-red-500 focus:ring-red-500",
                    !errors.title && touchedFields.title && titleValue?.length >= 3 && "border-green-500"
                  )}
                />
                <div className="flex justify-between items-center min-h-5">
                  {errors.title && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.title.message}
                    </p>
                  )}
                  <span className={cn(
                    "text-xs ml-auto",
                    titleValue?.length > 100 ? "text-red-500" : "text-gray-500"
                  )}>
                    {titleValue?.length || 0}/100
                  </span>
                </div>
              </div>

              {/* Campo Descrição */}
              <div className="space-y-2">
                <Label htmlFor="description" className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-600" />
                  Descrição detalhada *
                </Label>
                <Textarea
                  {...register('description')}
                  id="description"
                  rows={6}
                  placeholder="Descreva o problema com o máximo de detalhes possível. Inclua informações como: quando começou, qual a gravidade, se há riscos à segurança, etc."
                  className={cn(
                    "transition-all duration-200",
                    errors.description && "border-red-500 focus:ring-red-500",
                    !errors.description && touchedFields.description && descriptionValue?.length >= 10 && "border-green-500"
                  )}
                />
                <div className="flex justify-between items-center min-h-5">
                  {errors.description && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.description.message}
                    </p>
                  )}
                  <span className={cn(
                    "text-xs ml-auto",
                    descriptionValue?.length > 1000 ? "text-red-500" : "text-gray-500"
                  )}>
                    {descriptionValue?.length || 0}/1000
                  </span>
                </div>
              </div>

              {/* Campo Localização */}
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-600" />
                  Localização *
                </Label>
                <Input
                  {...register('location')}
                  id="location"
                  placeholder="Ex: Rua das Flores, 123 - Centro - São Paulo/SP"
                  className={cn(
                    "transition-all duration-200",
                    errors.location && "border-red-500 focus:ring-red-500",
                    !errors.location && touchedFields.location && (locationValue?.length ?? 0) >= 5 && "border-green-500"
                  )}
                />
                {errors.location && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.location.message}
                  </p>
                )}
              </div>

              {/* Botão de envio */}
              <Button
                type="submit"
                disabled={isSubmitting}
                size="lg"
                className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Enviando relato...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Enviar relato
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer informativo */}
        <div className="text-center text-sm text-gray-600 space-y-2">
          <p>
            Seus dados serão utilizados exclusivamente para resolução do problema reportado
          </p>
          <p className="text-xs text-gray-500">
            Powered by IA Generativa • Processamento automático e inteligente
          </p>
        </div>
      </div>
    </div>
  );
}