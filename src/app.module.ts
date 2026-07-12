import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CompaniesModule } from './companies/companies.module';
import { ContactsModule } from './contacts/contacts.module';
import { NotesModule } from './notes/notes.module';
import { TagsModule } from './tags/tags.module';

@Module({
  imports: [PrismaModule, CompaniesModule, ContactsModule, NotesModule, TagsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
