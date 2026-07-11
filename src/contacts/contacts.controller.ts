import { Body, Controller, Param, Post } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';

const TEMP_ORGANIZATION_ID = 'temp-organization-id';

@Controller('companies/:companyId/contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  create(@Param('companyId') companyId: string, @Body() dto: CreateContactDto) {
    return this.contactsService.create(TEMP_ORGANIZATION_ID, companyId, dto);
  }
}
