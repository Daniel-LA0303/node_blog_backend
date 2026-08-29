import crypto from 'crypto';

export function hashToken(token: string) {
  return crypto
    .createHmac('sha256', process.env.TOKEN_HASH_SECRET as string)
    .update(token)
    .digest('hex');
}