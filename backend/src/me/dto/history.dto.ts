import { IsBoolean, IsISO8601, IsOptional } from 'class-validator';

export class HistoryDto {
  @IsOptional()
  @IsISO8601()
  watchedAt?: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
