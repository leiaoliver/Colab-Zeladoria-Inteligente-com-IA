import { IsString, IsEnum, MinLength, MaxLength } from 'class-validator';

export enum ReportCategory {
  ILUMINACAO = 'Iluminação Pública',
  VIA_PUBLICA = 'Manutenção de Vias',
  SANEAMENTO = 'Saneamento',
  LIMPEZA = 'Limpeza Urbana',
  SINALIZACAO = 'Sinalização de Trânsito',
  CALCADA = 'Calçadas',
  AREA_VERDE = 'Áreas Verdes',
  OUTROS = 'Outros',
}

export enum ReportPriority {
  BAIXA = 'BAIXA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
}

export class AIAnalysisDto {
  @IsEnum(ReportCategory)
  category: ReportCategory;

  @IsEnum(ReportPriority)
  priority: ReportPriority;

  @IsString()
  @MinLength(10)
  @MaxLength(500)
  technicalSummary: string;
}

export class AnalyzeReportInputDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsString()
  location?: string;
}
