import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CredentialsDto {
  @IsEmail({}, { message: 'Введите корректный email.' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  email!: string;

  @IsString()
  @MinLength(10, { message: 'Пароль должен содержать не менее 10 символов.' })
  @MaxLength(128, { message: 'Пароль слишком длинный.' })
  password!: string;
}
