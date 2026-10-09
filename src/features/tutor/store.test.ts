import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { RedisTutorStore, SqliteTutorStore, mutate } from '../../../server/tutor/store';
import { TutorEngine } from '../../../server/tutor/engine';
import { authenticate } from '../../../server/tutor/auth';
import { TEST_PHOTO, testProvider } from './test-support';
import type { TutorImage } from './types';

describe('durable tutor storage', () => {
  it('recovers credentials, active task, photo and model after a server restart', async () => {
    mkdirSync(resolve('.forge-test'), { recursive: true });
    const path = resolve(`.forge-test/persistence-${crypto.randomUUID()}.sqlite`);
    const first = new SqliteTutorStore(path), engine = new TutorEngine(first, testProvider());
    const registered = await engine.register([]);
    const auth = (await authenticate(first, `Bearer ${registered.token}`))!;
    const active = await engine.start(auth.ownerId, { mode: 'learn' });
    const s = active.sessions[0]!;
    const uploaded = await engine.upload(auth.ownerId, { sessionId: s.id, exerciseId: s.exercises[0]!.id,
      requestId: 'persistent-photo', image: { data: TEST_PHOTO, mime: 'image/png' } });
    await engine.analyze(auth.ownerId, { submissionId: uploaded.sessions[0]!.submissions[0]!.id });
    first.close();
    const second = new SqliteTutorStore(path);
    try {
      const restarted = new TutorEngine(second, testProvider()), saved = await restarted.load(auth.ownerId);
      expect(await authenticate(second, `Bearer ${registered.token}`)).toMatchObject({ ownerId: auth.ownerId });
      expect(saved.activeSessionId).toBe(s.id);
      expect(saved.student.skills['num-order']?.state.totalAttempts).toBe(1);
      const imageId = saved.sessions[0]!.submissions[0]!.imageIds[0]!;
      expect((await second.read<TutorImage>(`image/${imageId}`))?.value.data).toBe(TEST_PHOTO);
    } finally { second.close(); }
  });
  it('merges concurrent mutations using atomic compare-and-set', async () => {
    const store = new SqliteTutorStore(':memory:');
    try {
      await store.compareAndSet('counter', null, { n: 0 });
      await Promise.all([mutate<{ n: number }>(store, 'counter', v => ({ n: v.n + 1 })), mutate<{ n: number }>(store, 'counter', v => ({ n: v.n + 1 }))]);
      expect((await store.read<{ n: number }>('counter'))?.value.n).toBe(2);
    } finally { store.close(); }
  });
  it('uses server-side atomic Lua CAS for shared Redis storage', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ result: 1 }), { status: 200 }));
    try {
      const store = new RedisTutorStore('https://redis.example', 'test-storage-credential');
      expect(await store.compareAndSet('learner/test', 4, { revision: 5 })).toBe(true);
      const request = fetch.mock.calls[0]?.[1];
      const body = JSON.parse(String(request?.body));
      expect(body[0]).toBe('EVAL'); expect(body[3]).toBe('forge:tutor:learner/test'); expect(body[4]).toBe('4');
      expect(body[5]).toContain('"version":5');
    } finally { fetch.mockRestore(); }
  });
});
