import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { createHash, randomBytes } from 'node:crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.users.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (existingUser) {
      throw new Error('このメールアドレスは既に登録されています');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.$transaction(async (tx) => {
      const organization = await tx.organizations.create({
        data: {
          name: dto.organizationName,
        },
      });

      return tx.users.create({
        data: {
          email: dto.email,
          passwordHash,
          organizationId: organization.id,
        },
        include: {
          organization: true, // 関連するorganizationsも取得する
        },
      });
    });

    const accessToken = await this.signAccessToken(user.id);
    const refreshToken = await this.createRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        organization: {
          id: user.organization.id,
          name: user.organization.name,
        },
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.users.findUnique({
      where: {
        email: dto.email,
      },
      include: {
        organization: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        'メールアドレスまたはパスワードが違います',
      );
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'メールアドレスまたはパスワードが違います',
      );
    }

    const accessToken = await this.signAccessToken(user.id);
    const refreshToken = await this.createRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        organization: {
          id: user.organization.id,
          name: user.organization.name,
        },
      },
    };
  }

  async me(userId: string) {
    const user = await this.prisma.users.findUnique({
      where: {
        id: userId,
      },
      include: {
        organization: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('ユーザーが見つかりませんでした');
    }

    return {
      id: user.id,
      email: user.email,
      organization: {
        id: user.organization.id,
        name: user.organization.name,
      },
    };
  }

  // アクセストークンにはuserIdを含める
  private async signAccessToken(userId: string) {
    return this.jwtService.signAsync({
      sub: userId,
    });
  }

  // リフレッシュトークンのDB保存
  private async createRefreshToken(userId: string) {
    // 生成・ハッシュ化
    const token = randomBytes(64).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    // 有効期限は30日
    const expiresAt = new Date(Date.now() + 1000 * 24 * 60 * 60 * 30);

    await this.prisma.refreshTokens.create({
      data: {
        tokenHash,
        userId,
        expiresAt,
      },
    });

    return token;
  }

  // Cookieのtokenを検証し、新規アクセストークンを発行
  async refresh(token: string) {
    const tokenHash = createHash('sha256').update(token).digest('hex');

    const record = await this.prisma.refreshTokens.findUnique({
      where: { tokenHash },
    });

    // リフレッシュトークンが無効であればFEに401を返し、新規で作成
    if (!record || record.expiresAt < new Date()) {
      // DBに存在しない場合 or 期限切れ
      throw new UnauthorizedException('リフレッシュトークンが無効です');
    }

    return await this.signAccessToken(record.userId);
  }

  // logoutする際はリフレッシュトークンを削除しないと情報が残ってしまう
  async logout(token?: string) {
    if (!token) return;

    const tokenHash = createHash('sha256').update(token).digest('hex');
    await this.prisma.refreshTokens
      .deleteMany({ where: { tokenHash } })
      .catch(() => {}); // 既に削除済みでもエラーにしない
  }
}
