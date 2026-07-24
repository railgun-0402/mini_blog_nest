import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { tavily } from '@tavily/core';
import { GoogleGenerativeAI } from '@google/generative-ai';

export type AnalysisResult = {
  overview: string;
  businessChallenges: string;
  managementPolicy: string;
};

@Injectable()
export class AnalysesService {
  constructor(private readonly prisma: PrismaService) {}

  async analyze(companyId: string, keywords: string) {
    // PENDINGレコードは処理が途中で失敗しても残すようにする
    const analysis = await this.prisma.companyAnalyses.create({
      data: {
        companyId,
        status: 'PENDING',
      },
    });

    const company = await this.prisma.companies.findUnique({
      where: {
        id: companyId,
      },
    });
    if (!company) {
      throw new NotFoundException('企業が見つかりません');
    }

    try {
      const searchResult = await this.searchWeb(company.name, keywords);
      // ex: { overview, businessChallenges, managementPolicy }
      const result = await this.generateAnalysis(company.name, searchResult);

      return this.prisma.companyAnalyses.update({
        where: {
          id: analysis.id,
        },
        data: {
          status: 'COMPLETED',
          ...result,
        },
      });
    } catch {
      await this.prisma.companyAnalyses.update({
        where: {
          id: analysis.id,
        },
        data: {
          status: 'FAILED',
        },
      });
      throw new InternalServerErrorException('解析に失敗しました');
    }
  }

  // Tavilyで検索し、結果を返す
  private async searchWeb(companyName: string, keywords: string) {
    const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY });
    const result = await tavilyClient.search(`${companyName} ${keywords}`, {
      includeAnswer: true,
    });
    return result.results.map((r) => r.content).join('\n');
  }

  // Geminiに渡して3項目を生成する
  private async generateAnalysis(companyName: string, searchContent: string) {
    // WebAPIの検索結果をGeminiに渡して解析
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
    以下の情報をもとに企業分析を行い、JSON形式で返してください。
  
    企業名: ${companyName}
    収集情報: ${searchContent}
  
    出力形式:
    {
      "overview": "企業の概要",
      "businessChallenges": "事業の課題",
      "managementPolicy": "中長期の経営方針"
    }
    `;

    // Gemini解析
    const result = await model.generateContent(prompt);
    // Markdown記法を取り除く
    const text = result.response
      .text()
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    return JSON.parse(text) as AnalysisResult;
  }
}
