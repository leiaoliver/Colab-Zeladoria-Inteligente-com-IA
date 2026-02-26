import { Injectable, Logger } from '@nestjs/common';
import Groq from 'groq-sdk';
import {
  AIAnalysisDto,
  AnalyzeReportInputDto,
  ReportCategory,
  ReportPriority,
} from './dto/ai-analysis.dto';
import {
  buildReportTriagePrompt,
  validateAIOutput,
} from './prompts/report-triage.prompt';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private readonly groq: Groq;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 segundo

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey || apiKey === 'your_groq_api_key_here') {
      throw new Error(
        '❌ GROQ_API_KEY não configurada! Obtenha sua chave gratuita em: https://console.groq.com/keys',
      );
    }

    this.groq = new Groq({
      apiKey,
    });

    this.logger.log('✅ Groq inicializado com sucesso');
  }

  async analyzeReport(input: AnalyzeReportInputDto): Promise<AIAnalysisDto> {
    this.logger.log(`🔍 Analisando: "${input.title}"`);

    const analysis = await this.analyzeWithRetry(input);
    this.logger.log(
      `✅ Classificado: ${analysis.category} | Prioridade: ${analysis.priority}`,
    );
    return analysis;
  }

  private async analyzeWithRetry(
    input: AnalyzeReportInputDto,
  ): Promise<AIAnalysisDto> {
    let lastError: Error = new Error('Falha na análise');

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        this.logger.debug(`Tentativa ${attempt} de ${this.maxRetries}`);
        return await this.callGroqAPI(input);
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(
          `Tentativa ${attempt} falhou: ${(error as Error).message}`,
        );

        if (attempt < this.maxRetries) {
          const delay = this.retryDelay * attempt; // Exponential backoff
          this.logger.debug(`Aguardando ${delay}ms antes da próxima tentativa`);
          await this.sleep(delay);
        }
      }
    }

    throw lastError;
  }

  private async callGroqAPI(
    input: AnalyzeReportInputDto,
  ): Promise<AIAnalysisDto> {
    const prompt = buildReportTriagePrompt(input);

    const completion = await this.groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content:
            'Você é um assistente especializado em triagem de solicitações de zeladoria urbana. Retorne sempre JSON válido.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error('Resposta vazia do serviço');
    }

    let parsed: {
      category?: string;
      priority?: string;
      technicalSummary?: string;
    };
    try {
      parsed = JSON.parse(content) as {
        category?: string;
        priority?: string;
        technicalSummary?: string;
      };
    } catch {
      this.logger.error('Erro ao parsear JSON', content);
      throw new Error('JSON inválido retornado');
    }

    if (!validateAIOutput(parsed)) {
      this.logger.error('Output não passa na validação', parsed);
      throw new Error('Estrutura de resposta inválida');
    }

    if (!parsed.category || !parsed.priority || !parsed.technicalSummary) {
      this.logger.error('Campos obrigatórios faltando', parsed);
      throw new Error('Dados incompletos retornados');
    }

    const categoryMap: Record<string, ReportCategory> = {
      'Iluminação Pública': ReportCategory.ILUMINACAO,
      'Manutenção de Vias': ReportCategory.VIA_PUBLICA,
      Saneamento: ReportCategory.SANEAMENTO,
      'Limpeza Urbana': ReportCategory.LIMPEZA,
      'Sinalização de Trânsito': ReportCategory.SINALIZACAO,
      Calçadas: ReportCategory.CALCADA,
      'Áreas Verdes': ReportCategory.AREA_VERDE,
      Outros: ReportCategory.OUTROS,
    };

    const priorityMap: Record<string, ReportPriority> = {
      BAIXA: ReportPriority.BAIXA,
      MEDIA: ReportPriority.MEDIA,
      ALTA: ReportPriority.ALTA,
    };

    return {
      category: categoryMap[parsed.category] || ReportCategory.OUTROS,
      priority: priorityMap[parsed.priority] || ReportPriority.MEDIA,
      technicalSummary: parsed.technicalSummary,
    };
  }

  /**
   * Helper para delay entre retries
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
