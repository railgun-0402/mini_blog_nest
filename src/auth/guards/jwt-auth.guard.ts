import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { CurrentUser } from '../types/current-user.type';

type JwtPayload = {
  sub: string;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // request情報を取得
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | undefined>;
      user?: CurrentUser;
    }>();

    // 2. Bearer tokenを取り出す
    const token = this.extractTokenFromHeader(request.headers.authorization);
    if (!token) {
      throw new UnauthorizedException('認証が必要です');
    }

    try {
      // 3. JWTを検証(自分たちのサーバーが発行した？期限切れではない？改竄されてない？)
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
      });

      // 4. payload.sub(JWTから取得したuserId) からUserをDB検索する
      // JWTが正しくても、Userが削除されてたり、所属が変わってたり・権限が変わる可能性を考慮
      const user = await this.prisma.users.findUnique({
        where: {
          id: payload.sub,
        },
        select: {
          id: true,
          email: true,
          organizationId: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('ユーザーが見つかりません');
      }

      // 5. request.user にログインユーザー情報を詰める
      // このリクエストはこのユーザーからきたものという情報を送る
      request.user = {
        id: user.id,
        email: user.email,
        organizationId: user.organizationId,
      };

      return true;
    } catch {
      throw new UnauthorizedException('認証に失敗しました');
    }
  }

  private extractTokenFromHeader(authorization?: string): string | undefined {
    // 1. Authorization headerを見る
    if (!authorization) return undefined;
    const [type, token] = authorization.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
