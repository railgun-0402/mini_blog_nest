import { Body, Controller, Param, Post } from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateCompanyTagDto } from './dto/create-company-tag.dto';

const TEMP_ORGANIZATION_ID = 'temp-organization-id';

@Controller('companies/:companyId/tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  addToCompany(
    @Param('companyId') companyId: string,
    @Body() dto: CreateCompanyTagDto,
  ) {
    return this.tagsService.addToCompany(
      TEMP_ORGANIZATION_ID,
      companyId,
      dto,
    );
  }
}