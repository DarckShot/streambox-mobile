import { IsISO8601, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class ProgressDto {
  @IsNumber()
  @Min(0)
  @Max(864000)
  positionSeconds!: number;

  @IsNumber()
  @Min(0)
  @Max(864000)
  durationSeconds!: number;

  @IsOptional()
  @IsISO8601()
  observedAt?: string;
}
