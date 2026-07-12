import { IsString, MaxLength } from 'class-validator';

export class CreateCompanyTagDto {
  @IsString()
  @MaxLength(50)
  name: string;
}