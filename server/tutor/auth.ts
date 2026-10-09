import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import type { TutorStore } from './store';

export const hash = (value: string) => createHash('sha256').update(value).digest('hex');
export const token = () => randomBytes(32).toString('base64url');
export interface Credential { ownerId: string; role: 'learner' | 'scanner'; expiresAt: number | null }
export function hasAccess(authorization: string | null): boolean {
  const secret = process.env.FORGE_TEACHER_ACCESS_CODE?.trim();
  if (!secret || secret.length < 24) return false;
  const actual = Buffer.from(authorization ?? '');
  const expected = Buffer.from(`Bearer ${secret}`);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
export async function authenticate(store: TutorStore, authorization: string | null): Promise<(Credential & { hash: string }) | null> {
  const raw = authorization?.replace(/^Bearer /, '') ?? '';
  if (!/^[A-Za-z0-9_-]{43}$/.test(raw)) return null;
  const hashed = hash(raw);
  const saved = await store.read<Credential>(`credential/${hashed}`);
  if (!saved || saved.value.expiresAt !== null && saved.value.expiresAt < Date.now()) return null;
  return { ...saved.value, hash: hashed };
}
