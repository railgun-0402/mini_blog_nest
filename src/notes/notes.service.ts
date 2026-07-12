import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';

@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    organizationId: string,
    userId: string,
    companyId: string,
    dto: CreateNoteDto,
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

    return this.prisma.notes.create({
      data: {
        organizationId,
        userId,
        companyId,
        body: dto.body,
      },
    });
  }
}
