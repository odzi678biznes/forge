import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTutorHandler } from '../../../server/tutor/http';
import { SqliteTutorStore } from '../../../server/tutor/store';
import { authenticate } from '../../../server/tutor/auth';
import type { TutorProvider } from '../../../server/tutor/provider';
import type { SolutionAnalysis, TutorSnapshot, TutorWorkspace } from './types';
import { TEST_PHOTO, testAnalysis, testProvider } from './test-support';

const accessCode = 'test-forge-access-code-at-least-24';
let store: SqliteTutorStore, provider: TutorProvider, handle: ReturnType<typeof createTutorHandler>;
beforeEach(() => {
  vi.stubEnv('FORGE_TEACHER_ACCESS_CODE', accessCode);
  store = new SqliteTutorStore(':memory:'); provider = testProvider();
  handle = createTutorHandler({ store: () => store, provider, availability: () => true, kind: () => 'sqlite' });
});
afterEach(() => { store.close(); vi.unstubAllEnvs(); vi.restoreAllMocks(); });
async function call(token: string, action?: string, data: Record<string, unknown> = {}, query = '') {
  const r = await handle(new Request(`http://localhost/api/tutor${query}`, { method: action ? 'POST' : 'GET',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, ...(action ? { body: JSON.stringify({ ...data, action }) } : {}) }));
  return { status: r.status, body: await r.json() };
}
async function setup(mode = 'learn') {
  const registered = await call(accessCode, 'register'), token = registered.body.token as string;
  const started = await call(token, 'start', { mode });
  const snapshot = started.body as TutorSnapshot;
  const context = { sessionId: snapshot.session!.id, exerciseId: snapshot.session!.exercises[0]!.id };
  return { token, context, snapshot };
}
const photo = { data: TEST_PHOTO, mime: 'image/png' };
describe('desktop → phone → durable image → analysis → student → next exercise', () => {
  it('runs the whole authenticated flow and never exposes answers to the scanner', async () => {
    const { token, context } = await setup();
    const pair = await call(token, 'pair'), phone = pair.body.token as string;
    const scanner = await call(phone);
    expect(scanner.body.role).toBe('scanner'); expect(scanner.body.student).toBeNull();
    expect(scanner.body.session.exercises[0]).not.toHaveProperty('answer');
    expect(scanner.body.session.exercises[0].id).toBe(context.exerciseId);
    expect((await call(phone, 'hint', context)).status).toBe(403);
    const received = await call(phone, 'upload', { ...context, requestId: 'upload-00001', image: photo });
    expect(received.status).toBe(200);
    const desktop = await call(token), id = desktop.body.session.submissions[0].id as string;
    const spy = vi.spyOn(provider, 'analyze');
    const graded = await call(token, 'analyze', { submissionId: id });
    expect(graded.status).toBe(200); expect(spy).toHaveBeenCalledOnce();
    expect(graded.body.student.skills['num-order'].state.totalAttempts).toBe(1);
    expect(graded.body.session.submissions[0].analysis.reasoning).toBe('sound');
    const same = await call(phone, 'upload', { ...context, requestId: 'upload-00002', image: photo });
    expect(same.body.session.submissions).toHaveLength(1);
    const next = await call(token, 'next', context);
    expect(next.body.session.currentIndex).toBe(1);
    const synced = await call(phone);
    expect(synced.body.session.exercises[1].id).toBe(next.body.session.exercises[1].id);
    expect((await call(phone, 'upload', { ...context, requestId: 'upload-stale', image: photo })).status).toBe(409);
    const savedImage = await call(token, undefined, {}, `?imageId=${encodeURIComponent(graded.body.session.submissions[0].imageIds[0])}`);
    expect(savedImage.body.image.data).toBe(TEST_PHOTO);
    expect((await call(phone, undefined, {}, `?imageId=${encodeURIComponent(graded.body.session.submissions[0].imageIds[0])}`)).status).toBe(403);
  });
  it('keeps photos after timeout and allows retry without double mastery updates', async () => {
    const { token, context } = await setup();
    const received = await call(token, 'upload', { ...context, requestId: 'upload-timeout', image: photo });
    const id = received.body.session.submissions[0].id as string;
    vi.spyOn(provider, 'analyze').mockRejectedValueOnce(new Error('timeout'));
    expect((await call(token, 'analyze', { submissionId: id })).status).toBe(502);
    const persisted = await call(token); expect(persisted.body.session.submissions[0].status).toBe('error');
    expect(persisted.body.student.appliedSubmissionIds).toHaveLength(0);
    expect((await call(token, 'analyze', { submissionId: id })).status).toBe(200);
    expect((await call(token, 'analyze', { submissionId: id })).status).toBe(409);
    expect((await call(token)).body.student.appliedSubmissionIds).toHaveLength(1);
  });
  it('asks for a clearer photo without judging the student', async () => {
    const { token, context } = await setup();
    vi.spyOn(provider, 'analyze').mockResolvedValue(testAnalysis({ complete: false, clarification: 'Pokaż dolny wiersz równania.' }));
    const received = await call(token, 'upload', { ...context, requestId: 'upload-partial', image: photo });
    const result = await call(token, 'analyze', { submissionId: received.body.session.submissions[0].id });
    expect(result.body.session.submissions[0]).toMatchObject({ status: 'clarify', analysis: { verdict: 'uncertain', points: null } });
    expect(result.body.student.skills).toEqual({});
    expect((await call(token, 'next', context)).status).toBe(409);
  });
  it('acknowledges an already saved upload after moving to the next task or closing an exam', async () => {
    const { token, context } = await setup();
    const request = { ...context, requestId: 'saved-before-next', image: photo };
    const uploaded = await call(token, 'upload', request);
    await call(token, 'analyze', { submissionId: uploaded.body.session.submissions[0].id });
    await call(token, 'next', context);
    const retried = await call(token, 'upload', request);
    expect(retried.status).toBe(200); expect(retried.body.session.submissions).toHaveLength(1);
    await call(token, 'finish');
    const exam = await call(token, 'start', { mode: 'exam' });
    const examRequest = { sessionId: exam.body.session.id, exerciseId: exam.body.session.exercises[0].id,
      requestId: 'saved-before-end', image: photo };
    await call(token, 'upload', examRequest); await call(token, 'finish');
    expect((await call(token, 'upload', examRequest)).status).toBe(200);
  });
  it('completes the repair loop only after an independent checkpoint solution', async () => {
    const { token, context } = await setup();
    const analyze = vi.spyOn(provider, 'analyze').mockResolvedValueOnce(testAnalysis({ verdict: 'incorrect', reasoning: 'unsound', points: 0,
      errors: [{ category: 'fractions', skillId: 'num-order', step: '1', explanation: 'Dodano mianowniki.' }] }));
    const generate = vi.spyOn(provider, 'generate');
    const uploaded = await call(token, 'upload', { ...context, requestId: 'repair-error-photo', image: photo });
    await call(token, 'analyze', { submissionId: uploaded.body.session.submissions[0].id });
    await call(token, 'lesson', context);
    for (let i = 0; i < 3; i++) await call(token, 'lesson-step');
    expect((await call(token, 'lesson-step')).status).toBe(409);
    expect((await call(token, 'lesson-dismiss')).status).toBe(409);
    const checkpoint = await call(token, 'next', context);
    expect(generate.mock.calls[0]?.[3]).toBe('num-order');
    const answer = await call(token, 'upload', { sessionId: context.sessionId, exerciseId: checkpoint.body.session.exercises[1].id,
      requestId: 'repair-checkpoint-photo', image: photo });
    const passed = await call(token, 'analyze', { submissionId: answer.body.session.submissions[1].id });
    expect(analyze).toHaveBeenCalledTimes(2);
    expect(passed.body.session.lesson).toMatchObject({ step: 4, checked: true });
    await call(token, 'lesson-step');
    expect((await call(token, 'lesson-dismiss')).body.session.lesson).toBeNull();
  });
  it('blocks concurrent provider work with a durable lease and recovers an interrupted call', async () => {
    const { token, context } = await setup();
    const auth = (await authenticate(store, `Bearer ${token}`))!;
    const received = await call(token, 'upload', { ...context, requestId: 'upload-recover', image: photo });
    const record = (await store.read<TutorWorkspace>(`learner/${auth.ownerId}`))!;
    record.value.operation = { id: 'interrupted', kind: 'analyze', expiresAt: Date.now() + 50_000 };
    record.value.sessions[0]!.submissions[0]!.status = 'analyzing';
    await store.compareAndSet(`learner/${auth.ownerId}`, record.version, record.value);
    expect((await call(token, 'analyze', { submissionId: received.body.session.submissions[0].id })).status).toBe(409);
    const expired = (await store.read<TutorWorkspace>(`learner/${auth.ownerId}`))!;
    expired.value.operation!.expiresAt = Date.now() - 1;
    await store.compareAndSet(`learner/${auth.ownerId}`, expired.version, expired.value);
    expect((await call(token, 'analyze', { submissionId: received.body.session.submissions[0].id })).status).toBe(200);
  });
  it('ignores an old failed provider call after a new worker has reclaimed its lease', async () => {
    const { token, context } = await setup();
    const auth = (await authenticate(store, `Bearer ${token}`))!;
    const uploaded = await call(token, 'upload', { ...context, requestId: 'lease-photo-retry', image: photo });
    const submissionId = uploaded.body.session.submissions[0].id;
    let rejectOld!: (reason: Error) => void, completeNew!: (value: SolutionAnalysis) => void;
    const analyze = vi.spyOn(provider, 'analyze')
      .mockImplementationOnce(() => new Promise((_, reject) => { rejectOld = reject; }))
      .mockImplementationOnce(() => new Promise(resolve => { completeNew = resolve; }));
    const old = call(token, 'analyze', { submissionId });
    await vi.waitFor(() => expect(analyze).toHaveBeenCalledOnce());
    const expired = (await store.read<TutorWorkspace>(`learner/${auth.ownerId}`))!;
    expired.value.operation!.expiresAt = Date.now() - 1;
    await store.compareAndSet(`learner/${auth.ownerId}`, expired.version, expired.value);
    const fresh = call(token, 'analyze', { submissionId });
    await vi.waitFor(() => expect(analyze).toHaveBeenCalledTimes(2));
    const newLease = (await store.read<TutorWorkspace>(`learner/${auth.ownerId}`))!.value.operation!.id;
    rejectOld(new Error('old worker timeout')); expect((await old).status).toBe(502);
    const protectedState = (await store.read<TutorWorkspace>(`learner/${auth.ownerId}`))!.value;
    expect(protectedState.operation?.id).toBe(newLease);
    expect(protectedState.sessions[0]!.submissions[0]!.status).toBe('analyzing');
    completeNew(testAnalysis()); expect((await fresh).status).toBe(200);
  });
});
describe('assessment rules, pairing and API boundaries', () => {
  it.each(['exam', 'quiz'])('withholds help, analysis and answers until finishing %s', async mode => {
    const { token, context } = await setup(mode);
    expect((await call(token, 'hint', context)).status).toBe(403);
    expect((await call(token, 'chat', { ...context, message: 'Daj wynik' })).status).toBe(403);
    expect((await call(token, 'pause')).status).toBe(403);
    const received = await call(token, 'upload', { ...context, requestId: 'upload-assess', image: photo });
    const id = received.body.session.submissions[0].id;
    expect((await call(token, 'analyze', { submissionId: id })).status).toBe(403);
    const history = await call(token, undefined, {}, `?sessionId=${context.sessionId}`);
    expect(history.body.session.exercises[0]).not.toHaveProperty('answer');
    await call(token, 'finish');
    expect((await call(token, 'analyze', { submissionId: id })).status).toBe(200);
    const plan = await call(token, 'plan');
    expect(plan.body.student.plan.skillId).toBe('num-order');
    expect(plan.body.session.report).toMatchObject({ earned: 2, unanswered: 1, ungraded: 0 });
  });
  it('enforces deadline on the server independently of the client clock', async () => {
    const { token, context } = await setup('exam');
    const auth = (await authenticate(store, `Bearer ${token}`))!;
    const record = (await store.read<TutorWorkspace>(`learner/${auth.ownerId}`))!;
    record.value.sessions[0]!.deadlineAt = Date.now() - 1;
    await store.compareAndSet(`learner/${auth.ownerId}`, record.version, record.value);
    expect((await call(token, 'upload', { ...context, requestId: 'late-upload-1', image: photo })).status).toBe(409);
    expect((await call(token, 'finish')).body.session.report.timedOut).toBe(true);
  });
  it('can clarify an unreadable exam photo after finishing, without accepting new exam answers', async () => {
    const { token, context } = await setup('exam');
    const analysis = vi.spyOn(provider, 'analyze').mockResolvedValueOnce(testAnalysis({ readable: false }));
    const uploaded = await call(token, 'upload', { ...context, requestId: 'unclear-photo', image: photo });
    await call(token, 'finish');
    await call(token, 'analyze', { submissionId: uploaded.body.session.submissions[0].id });
    // The PNG's bytes differ; in a real request this is a clearer photograph of the same saved work.
    const clearer = { data: TEST_PHOTO.slice(0, -4) + 'AAAA', mime: 'image/png' };
    const clarified = await call(token, 'upload', { ...context, requestId: 'clearer-photo', image: clearer });
    expect(clarified.status).toBe(200);
    expect((await call(token, 'analyze', { submissionId: clarified.body.session.submissions[1].id })).status).toBe(200);
    expect(analysis).toHaveBeenCalledTimes(2);
    const result = await call(token);
    expect(result.body.student.appliedSubmissionIds).toHaveLength(1);
    expect(result.body.session.report.ungraded).toBe(0);
    await call(token, 'select', { index: 1 });
    const second = { sessionId: context.sessionId, exerciseId: result.body.session.exercises[1].id };
    expect((await call(token, 'upload', { ...second, requestId: 'late-new-task', image: photo })).status).toBe(409);
  });
  it('grades only the final photograph sent for an exam task before the deadline', async () => {
    const { token, context } = await setup('exam');
    await call(token, 'upload', { ...context, requestId: 'first-exam-photo', image: photo });
    const newer = { data: TEST_PHOTO.slice(0, -4) + 'AAAA', mime: 'image/png' };
    const result = await call(token, 'upload', { ...context, requestId: 'final-exam-photo', image: newer });
    expect(result.body.session.submissions[0].status).toBe('superseded');
    await call(token, 'finish');
    expect((await call(token, 'analyze', { submissionId: result.body.session.submissions[0].id })).status).toBe(409);
    expect((await call(token, 'analyze', { submissionId: result.body.session.submissions[1].id })).status).toBe(200);
    expect((await call(token)).body.student.appliedSubmissionIds).toHaveLength(1);
  });
  it('compares exam results only within the same PP or PR level', async () => {
    const { token } = await setup('exam');
    await call(token, 'finish');
    await call(token, 'start', { mode: 'exam', level: 'PR' });
    const extended = await call(token, 'finish');
    expect(extended.body.session.report.previousPercent).toBeNull();
    await call(token, 'start', { mode: 'exam', level: 'PP' });
    const basic = await call(token, 'finish');
    expect(basic.body.session.report.previousPercent).toBe(0);
    expect(basic.body.student.recentExams).toHaveLength(3);
  });
  it('revokes the old scanner and isolates two learner profiles', async () => {
    const a = await setup(), b = await setup();
    const old = (await call(a.token, 'pair')).body.token;
    const phone = (await call(a.token, 'pair')).body.token;
    expect((await call(old)).status).toBe(401);
    const other = await call(b.token, 'upload', { ...a.context, requestId: 'wrong-profile', image: photo });
    expect(other.status).toBe(409);
    await call(a.token, 'revoke'); expect((await call(phone)).status).toBe(401);
  });
  it('enforces all five hints and persists chat assistance', async () => {
    const { token, context } = await setup();
    for (let i = 0; i < 5; i++) expect((await call(token, 'hint', context)).status).toBe(200);
    expect((await call(token, 'hint', context)).status).toBe(409);
    expect((await call(token)).body.session.assistance[context.exerciseId]).toBe(6);
  });
  it('preserves pause/resume, historical tasks and can start a repeat session', async () => {
    const { token, context } = await setup();
    await call(token, 'pause'); expect((await call(token)).body.session.pausedAt).not.toBeNull();
    expect((await call(token, 'upload', { ...context, requestId: 'paused-upload', image: photo })).status).toBe(409);
    await call(token, 'resume'); await call(token, 'finish');
    const repeated = await call(token, 'repeat', context);
    expect(repeated.body.session.mode).toBe('review');
    expect(repeated.body.session.exercises[0].id).not.toBe(context.exerciseId);
    expect(repeated.body.history).toHaveLength(2);
  });
  it('excludes paused time when a session is finished during a pause', async () => {
    let now = 10_000;
    vi.spyOn(Date, 'now').mockImplementation(() => now);
    const { token } = await setup();
    now += 2000; await call(token, 'pause');
    now += 60_000; const finished = await call(token, 'finish');
    const s = finished.body.session;
    expect(s.endedAt - s.startedAt - s.pausedMs).toBe(2000);
  });
  it('requires access, blocks cross-site calls, validates files and rejects oversize requests', async () => {
    expect((await call('bad', 'register')).status).toBe(401);
    const { token, context } = await setup();
    expect((await call(token, 'upload', { ...context, requestId: 'invalid-image', image: { data: 'aGVsbG8=', mime: 'image/jpeg' } })).status).toBe(415);
    expect((await call(token, 'upload', { ...context, requestId: 'big-image-001', image: { data: 'x'.repeat(3_900_000), mime: 'image/jpeg' } })).status).toBe(413);
    const forbidden = await handle(new Request('http://localhost/api/tutor', { headers: { Origin: 'https://other.example' } })); expect(forbidden.status).toBe(403);
    const unavailable = createTutorHandler({ store: () => store, provider, availability: () => false, kind: () => 'sqlite' });
    const status = await unavailable(new Request('http://localhost/api/tutor?action=status'));
    expect(await status.json()).toMatchObject({ available: false });
  });
});
