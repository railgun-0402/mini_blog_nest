import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUserDecorator } from '../auth/decorators/current-user.decorator';
import type { CurrentUser } from '../auth/types/current-user.type';

@UseGuards(JwtAuthGuard)
@Controller('companies/:companyId/notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  create(
    @CurrentUserDecorator() user: CurrentUser,
    @Param('companyId') companyId: string,
    @Body() dto: CreateNoteDto,
  ) {
    return this.notesService.create(
      user.organizationId,
      user.id,
      companyId,
      dto,
    );
  }
}
