import { IsString, MinLength, IsOptional } from 'class-validator';

export class UpdateReportDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  description?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
