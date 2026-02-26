import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';

@Controller('report')
export class ReportController {
  private readonly logger = new Logger(ReportController.name);

  constructor(private readonly reportService: ReportService) {}

  @Post()
  async create(@Body() createReportDto: CreateReportDto) {
    try {
      this.logger.log(
        `Recebida requisição POST /report: ${JSON.stringify(createReportDto)}`,
      );
      const result = await this.reportService.create(createReportDto);
      this.logger.log(`Relatório criado com sucesso: ${result.id}`);
      return result;
    } catch (error) {
      // Normaliza o tipo de erro para evitar acessos inseguros
      const normalizedError = error as Error & { status?: number };

      this.logger.error(
        `Erro ao criar relatório: ${normalizedError.message}`,
        normalizedError.stack,
      );

      const status =
        typeof normalizedError.status === 'number'
          ? normalizedError.status
          : HttpStatus.INTERNAL_SERVER_ERROR;

      throw new HttpException(
        `Erro ao criar relatório: ${normalizedError.message}`,
        status,
      );
    }
  }

  @Get()
  findAll() {
    return this.reportService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportService.findOne(id);
  }
}
