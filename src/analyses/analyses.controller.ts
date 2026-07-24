import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { AnalysesService } from './analyses.service';
import { CreateAnalysisDto } from './dto/create-analysis.dto/create-analysis.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('companies/:companyId/analyses')
export class AnalysesController {
  constructor(private readonly analysesService: AnalysesService) {}

  @Post()
  analysis(
    @Body() dto: CreateAnalysisDto,
    @Param('companyId') companyId: string,
  ) {
    return this.analysesService.analyze(companyId, dto.keywords);
  }
}
