import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  author: string;

  @IsString()
  @IsNotEmpty()
  isbn: string;

  @IsInt()
  @Min(0)
  totalCopies: number;

  @IsInt()
  @Min(1)
  genreId: number;

  @IsOptional()
  @IsInt()
  publishedYear?: number;
}
