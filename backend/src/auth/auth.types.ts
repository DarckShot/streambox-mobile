import type { Request } from 'express';

export interface AuthIdentity {
  userId: string;
  sessionId: string;
}

export type AuthRequest = Request & { auth: AuthIdentity };
