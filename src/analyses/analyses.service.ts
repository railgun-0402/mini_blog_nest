import { Injectable, NotFoundException } from '@nestjs/common';
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

    // Tavilyにて企業情報をWeb検索APIを実行
    const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY });
    const searchResult = await tavilyClient.search(
      `${company.name} ${keywords}`,
      { includeAnswer: true },
    );

    // WebAPIの検索結果をGeminiに渡して解析
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
    以下の情報をもとに企業分析を行い、JSON形式で返してください。
  
    企業名: ${company.name}
    収集情報: ${searchResult.results.map((r) => r.content).join('\n')}
  
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

    // ex: { overview, businessChallenges, managementPolicy }
    const parsed = JSON.parse(text) as AnalysisResult;

    return this.prisma.companyAnalyses.update({
      where: {
        id: analysis.id,
      },
      data: {
        status: 'COMPLETED',
        overview: parsed.overview,
        businessChallenges: parsed.businessChallenges,
        managementPolicy: parsed.managementPolicy,
      },
    });
  }
}
