import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyTagDto } from './dto/create-company-tag.dto';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  async addToCompany(
    organizationId: string,
    companyId: string,
    dto: CreateCompanyTagDto,
  ) {
    const company = await this.prisma.companies.findFirst({
      where: {
        id: companyId,
        organizationId,
      },
    });

    if (!company) {
      throw new NotFoundException('企業が見つかりません');
    }

    const tag = await this.prisma.tags.upsert({
      where: { name: dto.name },
      update: {},
      create: { name: dto.name },
    });

    await this.prisma.companyTags.upsert({
      where: {
        companyId_tagId: {
          companyId,
          tagId: tag.id,
        },
      },
      update: {},
      create: {
        companyId,
        tagId: tag.id,
      },
    });

    return tag;
  }
}