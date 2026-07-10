import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { SearchCompaniesDto } from './dto/search-companies.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: string, query: SearchCompaniesDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where = {
      organizationId,
      ...(query.q
        ? {
            OR: [
              { name: { contains: query.q, mode: 'insensitive' as const } },
              {
                description: {
                  contains: query.q,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.companies.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.companies.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(organizationId: string, id: string) {
    const company = await this.prisma.companies.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        contacts: {
          orderBy: { createdAt: 'desc' },
        },
        notes: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            user: true,
          },
        },
        companyTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!company) {
      throw new NotFoundException('企業が見つかりません');
    }

    return company;
  }

  async create(organizationId: string, dto: CreateCompanyDto) {
    return this.prisma.companies.create({
      data: {
        organizationId,
        name: dto.name,
        description: dto.description,
        websiteUrl: dto.websiteUrl,
      },
    });
  }

  async update(organizationId: string, id: string, dto: UpdateCompanyDto) {
    await this.findOne(organizationId, id);

    return this.prisma.companies.update({
      where: { id },
      data: dto,
    });
  }

  async remove(organizationId: string, id: string) {
    await this.findOne(organizationId, id);

    await this.prisma.companies.delete({
      where: { id },
    });

    return { deleted: true };
  }
}
