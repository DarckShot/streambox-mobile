import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ImportVideoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  input!: string;
}
