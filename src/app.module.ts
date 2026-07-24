import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CompaniesModule } from './companies/companies.module';
import { ContactsModule } from './contacts/contacts.module';
import { NotesModule } from './notes/notes.module';
import { TagsModule } from './tags/tags.module';
import { AuthModule } from './auth/auth.module';
import { AnalysesModule } from './analyses/analyses.module';

@Module({
  imports: [
    PrismaModule,
    CompaniesModule,
    ContactsModule,
    NotesModule,
    TagsModule,
    AuthModule,
    AnalysesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
