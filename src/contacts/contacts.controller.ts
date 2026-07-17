import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUserDecorator } from '../auth/decorators/current-user.decorator';
import type { CurrentUser } from '../auth/types/current-user.type';

@UseGuards(JwtAuthGuard)
@Controller('companies/:companyId/contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  create(
    @CurrentUserDecorator() user: CurrentUser,
    @Param('companyId') companyId: string,
    @Body() dto: CreateContactDto,
  ) {
    return this.contactsService.create(user.organizationId, companyId, dto);
  }
}
