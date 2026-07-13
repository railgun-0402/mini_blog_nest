import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

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

    return {
      accessToken,
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

    return {
      accessToken,
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
}
