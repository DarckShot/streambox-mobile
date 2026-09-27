import { randomUUID, createHash, timingSafeEqual } from 'node:crypto';
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';

import { PrismaService } from '../prisma/prisma.service';
import type { AuthIdentity } from './auth.types';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
interface TokenClaims {
  sub: string;
  sid: string;
  kind: 'access' | 'refresh';
}
const REFRESH_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;
const hashToken = (token: string): string => createHash('sha256').update(token).digest('hex');
const sameHash = (first: string, second: string): boolean => {
  const a = Buffer.from(first, 'hex');
  const b = Buffer.from(second, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
};

@Injectable()
export class AuthService {
  private readonly accessSecret = process.env.JWT_ACCESS_SECRET;
  private readonly refreshSecret = process.env.JWT_REFRESH_SECRET;

  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) {
    if (
      !this.accessSecret ||
      !this.refreshSecret ||
      this.accessSecret.length < 32 ||
      this.refreshSecret.length < 32 ||
      this.accessSecret === this.refreshSecret
    ) {
      throw new Error(
        'Настройте разные JWT_ACCESS_SECRET и JWT_REFRESH_SECRET длиной от 32 символов.',
      );
    }
  }

  async register(emailInput: string, password: string): Promise<TokenPair> {
    const email = emailInput.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(password, 12);
    try {
      const user = await this.prisma.user.create({
        data: { email, passwordHash },
        select: { id: true },
      });
      return this.issueSession(user.id);
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Пользователь с таким email уже существует.');
      }
      throw error;
    }
  }

  async login(emailInput: string, password: string): Promise<TokenPair> {
    const user = await this.prisma.user.findUnique({
      where: { email: emailInput.trim().toLowerCase() },
    });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Неверный email или пароль.');
    }
    return this.issueSession(user.id);
  }

  async verifyAccess(token: string): Promise<AuthIdentity> {
    const claims = await this.verify(token, this.accessSecret!, 'access');
    const session = await this.prisma.refreshSession.findUnique({
      where: { id: claims.sid },
      select: { userId: true, expiresAt: true },
    });
    if (!session || session.userId !== claims.sub || session.expiresAt <= new Date())
      throw new UnauthorizedException('Сессия завершена.');
    return { userId: claims.sub, sessionId: claims.sid };
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    const claims = await this.verify(refreshToken, this.refreshSecret!, 'refresh');
    const session = await this.prisma.refreshSession.findUnique({ where: { id: claims.sid } });
    if (
      !session ||
      session.userId !== claims.sub ||
      session.expiresAt <= new Date() ||
      !sameHash(session.tokenHash, hashToken(refreshToken))
    ) {
      throw new UnauthorizedException('Refresh token недействителен.');
    }
    const next = await this.signPair(claims.sub, claims.sid);
    const changed = await this.prisma.refreshSession.updateMany({
      where: { id: claims.sid, tokenHash: session.tokenHash },
      data: {
        tokenHash: hashToken(next.refreshToken),
        expiresAt: new Date(Date.now() + REFRESH_LIFETIME_MS),
      },
    });
    if (changed.count !== 1) throw new UnauthorizedException('Refresh token уже использован.');
    return next;
  }

  async logout(sessionId: string, userId: string): Promise<void> {
    await this.prisma.refreshSession.deleteMany({ where: { id: sessionId, userId } });
  }

  private async issueSession(userId: string): Promise<TokenPair> {
    const sessionId = randomUUID();
    const pair = await this.signPair(userId, sessionId);
    await this.prisma.refreshSession.create({
      data: {
        id: sessionId,
        userId,
        tokenHash: hashToken(pair.refreshToken),
        expiresAt: new Date(Date.now() + REFRESH_LIFETIME_MS),
      },
    });
    return pair;
  }

  private async signPair(userId: string, sessionId: string): Promise<TokenPair> {
    const base = { sub: userId, sid: sessionId };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(
        { ...base, kind: 'access' },
        { secret: this.accessSecret, expiresIn: '15m' },
      ),
      this.jwt.signAsync(
        { ...base, kind: 'refresh', jti: randomUUID() },
        { secret: this.refreshSecret, expiresIn: '30d' },
      ),
    ]);
    return { accessToken, refreshToken };
  }

  private async verify(
    token: string,
    secret: string,
    kind: TokenClaims['kind'],
  ): Promise<TokenClaims> {
    let claims: TokenClaims;
    try {
      claims = await this.jwt.verifyAsync<TokenClaims>(token, { secret });
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'TokenExpiredError') {
        throw new UnauthorizedException(
          kind === 'refresh' ? 'Refresh token истёк.' : 'Access token истёк.',
        );
      }
      throw new UnauthorizedException(
        kind === 'refresh' ? 'Refresh token недействителен.' : 'Access token недействителен.',
      );
    }
    if (claims.kind !== kind || typeof claims.sub !== 'string' || typeof claims.sid !== 'string') {
      throw new UnauthorizedException('Неверный тип токена.');
    }
    return claims;
  }
}
