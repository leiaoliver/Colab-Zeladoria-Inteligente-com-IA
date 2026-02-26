import { IsString, MinLength, IsOptional } from 'class-validator';

export class CreateReportDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  location?: string;
}
