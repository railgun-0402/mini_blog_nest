import { Body, Controller, Param, Post } from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';

const TEMP_ORGANIZATION_ID = 'temp-organization-id';
const TEMP_USER_ID = 'temp-user-id';

@Controller('companies/:companyId/notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  create(@Param('companyId') companyId: string, @Body() dto: CreateNoteDto) {
    return this.notesService.create(
      TEMP_ORGANIZATION_ID,
      TEMP_USER_ID,
      companyId,
      dto,
    );
  }
}
