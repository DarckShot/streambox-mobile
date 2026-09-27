import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ListVideosDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;
}
