import { IsString } from 'class-validator';

export class CreateAnalysisDto {
  @IsString()
  keywords: string;
}
