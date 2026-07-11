import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    organizationId: string,
    companyId: string,
    dto: CreateContactDto,
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

    return this.prisma.contacts.create({
      data: {
        organizationId,
        companyId,
        name: dto.name,
        email: dto.email,
        position: dto.position,
      },
    });
  }
}
