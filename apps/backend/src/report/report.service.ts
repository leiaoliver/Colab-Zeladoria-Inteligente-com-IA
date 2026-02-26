import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { AIService } from '../ai/ai.service';

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  constructor(
    private prisma: PrismaService,
    private aiService: AIService,
  ) {}

  /**
   * Cria um novo relatório com processamento automático de IA
   */
  async create(data: CreateReportDto) {
    this.logger.log(`📝 Criando relatório: "${data.title}"`);

    // Processar com IA (obrigatório)
    const aiAnalysis = await this.aiService.analyzeReport({
      title: data.title,
      description: data.description,
      location: data.location,
    });

    // Criar relatório no banco com dados enriquecidos pela IA
    const report = await this.prisma.report.create({
      data: {
        title: data.title,
        description: data.description,
        location: data.location,
        category: aiAnalysis.category,
        priority: aiAnalysis.priority,
        technicalSummary: aiAnalysis.technicalSummary,
      },
    });

    this.logger.log(`✅ Relatório criado: ${report.id}`);
    return report;
  }

  findAll() {
    return this.prisma.report.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findOne(id: string) {
    return this.prisma.report.findUnique({
      where: { id },
    });
  }

  update(id: string, data: UpdateReportDto) {
    return this.prisma.report.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.report.delete({
      where: { id },
    });
  }
}
