import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { SearchCompaniesDto } from './dto/search-companies.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

const TEMP_ORGANIZATION_ID = 'temp-organization-id';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  findAll(@Query() query: SearchCompaniesDto) {
    return this.companiesService.findAll(TEMP_ORGANIZATION_ID, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(TEMP_ORGANIZATION_ID, id);
  }

  @Post()
  create(@Body() dto: CreateCompanyDto) {
    return this.companiesService.create(TEMP_ORGANIZATION_ID, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCompanyDto) {
    return this.companiesService.update(TEMP_ORGANIZATION_ID, id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.companiesService.remove(TEMP_ORGANIZATION_ID, id);
  }
}
