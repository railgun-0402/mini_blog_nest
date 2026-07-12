import { IsString, MaxLength } from 'class-validator';

export class CreateNoteDto {
  @IsString()
  @MaxLength(2000)
  body: string;
}
