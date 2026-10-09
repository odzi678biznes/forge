import { randomUUID } from 'node:crypto';
import type { SkillState } from '../../src/data/types';
import { applySolution, emptyEvidence, emptyStudent } from '../../src/features/tutor/student-model';
import { examReport } from '../../src/features/tutor/exam-engine';
import { TUTOR_MODES, type StudentModel, type Submission, type TutorImage, type TutorMode, type TutorSession, type TutorSnapshot, type TutorWorkspace } from '../../src/features/tutor/types';
import { curriculum } from './catalogue';
import { hash, token, type Credential } from './auth';
import { mutate, type TutorStore } from './store';
import { validateAnalysis, type TutorProvider } from './provider';

export class TutorError extends Error { constructor(public status: number, message: string) { super(message); } }
function fail(status: number, message: string): never { throw new TutorError(status, message); }
const locked = (w: TutorWorkspace) => w.operation !== null && w.operation.expiresAt > Date.now();
export const isAssessment = (s: TutorSession) => s.mode === 'exam' || s.mode === 'quiz';
const active = (w: TutorWorkspace): TutorSession => w.sessions.find(s => s.id === w.activeSessionId) ?? fail(404, 'Nie ma aktywnej sesji.');
const current = (s: TutorSession) => s.exercises[s.currentIndex] ?? fail(404, 'Nie ma aktywnego zadania.');
const expired = (s: TutorSession) => s.deadlineAt !== null && Date.now() >= s.deadlineAt;
function studying(s: TutorSession) {
  if (s.endedAt !== null || expired(s)) fail(409, 'Sesja zakończona. Przejdź do analizy wyników.');
  if (s.pausedAt !== null) fail(409, 'Wznów sesję na komputerze.');
}
function expectedExercise(s: TutorSession, body: Record<string, unknown>) {
  if (body.sessionId !== s.id || body.exerciseId !== current(s).id) fail(409, 'Zadanie zmieniło się na komputerze. Odśwież widok przed wysłaniem.');
}
function uploading(s: TutorSession) {
  const attempts = s.submissions.filter(a => a.exerciseId === current(s).id);
  const clarification = s.endedAt !== null && attempts.at(-1)?.status === 'clarify' && !attempts.some(a => a.status === 'graded');
  if (!clarification) studying(s);
}
function uploadReceipt(w: TutorWorkspace, body: Record<string, unknown>, imageHash: string): boolean {
  const receipt = w.sessions.find(s => s.id === body.sessionId)?.submissions.find(a => a.requestId === body.requestId);
  if (!receipt) return false;
  if (receipt.exerciseId !== body.exerciseId || receipt.imageHash !== imageHash) fail(409, 'Identyfikator wysłania jest już przypisany do innego zdjęcia.');
  return true;
}
const recentExercises = (w: TutorWorkspace) => w.sessions.flatMap(s => s.exercises).slice(-200);

export class TutorEngine {
  constructor(readonly store: TutorStore, readonly provider: TutorProvider) {}
  async register(initial: unknown): Promise<{ token: string; snapshot: TutorSnapshot }> {
    const id = randomUUID(), access = token();
    const w: TutorWorkspace = { version: 1, id, createdAt: Date.now(), revision: 0, student: emptyStudent(), sessions: [], activeSessionId: null, scanners: [], operation: null };
    // Migrate existing course mastery once; confidence is unknown until actual tutor evidence.
    if (Array.isArray(initial)) {
      for (const state of initial.slice(0, 300)) {
        if (!state || typeof state !== 'object' || !curriculum.skills.some(s => s.id === state.skillId) || !Number.isInteger(state.level)
          || state.level < 0 || state.level > 5) continue;
        const old = state as { skillId: string; level: number; lastAttemptAt?: unknown; totalAttempts?: unknown; reviewDueAt?: unknown; levelReachedAt?: unknown; reviewStep?: unknown; independentStreak?: unknown; recentErrors?: unknown };
        if (old.level > 0) {
          const evidence = emptyEvidence(old.skillId);
          evidence.state.level = old.level as SkillState['level'];
          evidence.state.lastAttemptAt = typeof old.lastAttemptAt === 'number' && Number.isFinite(old.lastAttemptAt) ? old.lastAttemptAt : null;
          evidence.state.totalAttempts = typeof old.totalAttempts === 'number' && Number.isInteger(old.totalAttempts) && old.totalAttempts >= 0 ? old.totalAttempts : 0;
          evidence.state.reviewDueAt = typeof old.reviewDueAt === 'number' && Number.isFinite(old.reviewDueAt) ? old.reviewDueAt : null;
          evidence.state.levelReachedAt = typeof old.levelReachedAt === 'number' && Number.isFinite(old.levelReachedAt) ? old.levelReachedAt : null;
          evidence.state.reviewStep = typeof old.reviewStep === 'number' && Number.isInteger(old.reviewStep) && old.reviewStep >= 0 && old.reviewStep <= 3 ? old.reviewStep : 0;
          evidence.state.independentStreak = typeof old.independentStreak === 'number' && Number.isInteger(old.independentStreak) && old.independentStreak >= 0 ? old.independentStreak : 0;
          evidence.state.recentErrors = Array.isArray(old.recentErrors) ? old.recentErrors.filter((s): s is string => typeof s === 'string').slice(-10) : [];
          w.student.skills[old.skillId] = evidence;
        }
        w.student.plan ??= { now: 'Zaczniemy od krótkiej rozgrzewki.', skillId: old.skillId, reason: 'Sprawdzimy spokojnie, co pamiętasz z kursu.', next: [], updatedAt: Date.now() };
      }
    }
    await this.store.compareAndSet(`learner/${id}`, null, w);
    await this.store.compareAndSet(`credential/${hash(access)}`, null, { ownerId: id, role: 'learner', expiresAt: null } satisfies Credential);
    return { token: access, snapshot: this.snapshot(w, 'learner') };
  }
  async load(ownerId: string): Promise<TutorWorkspace> {
    return (await this.store.read<TutorWorkspace>(`learner/${ownerId}`))?.value ?? fail(401, 'Profil nie istnieje. Połącz urządzenie ponownie.');
  }
  async change(ownerId: string, fn: (w: TutorWorkspace) => void): Promise<TutorWorkspace> {
    return mutate<TutorWorkspace>(this.store, `learner/${ownerId}`, w => { fn(w); w.revision++; return w; });
  }
  snapshot(w: TutorWorkspace, role: Credential['role'], sessionId?: string): TutorSnapshot {
    const s = w.sessions.find(s => s.id === (sessionId ?? w.activeSessionId));
    const hideAssessment = s && isAssessment(s) && s.endedAt === null;
    const session = s ? {
      ...s,
      exercises: s.exercises.map(e => {
        const { answer, solution, steps, ...task } = e;
        const graded = s.submissions.some(a => a.exerciseId === e.id && a.status === 'graded');
        return role === 'learner' && !hideAssessment && graded ? { ...task, answer, solution, steps } : task;
      }),
      submissions: s.submissions.map(a => role === 'scanner' || hideAssessment ? { ...a, analysis: null, error: null } : a),
      messages: role === 'scanner' || hideAssessment ? [] : s.messages,
      hints: role === 'scanner' || hideAssessment ? {} : s.hints,
      lesson: role === 'scanner' || hideAssessment ? null : s.lesson,
      report: role === 'scanner' || hideAssessment ? null : s.report,
      summary: role === 'scanner' ? null : s.summary,
    } : null;
    return { revision: w.revision, student: role === 'learner' ? w.student : null, session,
      history: role === 'learner' ? w.sessions.slice().reverse().map(x => ({ id: x.id, mode: x.mode, startedAt: x.startedAt, endedAt: x.endedAt, count: x.submissions.length, report: x.report })) : [],
      busy: locked(w), role };
  }
  /** A durable lease bounds provider work and prevents duplicate calls from two tabs/devices. */
  private async ai(ownerId: string, kind: string, prepare: (w: TutorWorkspace) => void,
    work: (w: TutorWorkspace) => Promise<(latest: TutorWorkspace) => void>, onFailure?: (w: TutorWorkspace) => void): Promise<TutorWorkspace> {
    const id = randomUUID();
    const saved = await this.change(ownerId, w => {
      if (locked(w)) fail(409, 'Trwa poprzednia operacja. Poczekaj chwilę.');
      prepare(w);
      w.operation = { id, kind, expiresAt: Date.now() + 110_000 };
    });
    try {
      const commit = await work(saved);
      return await this.change(ownerId, w => {
        if (w.operation?.id !== id) fail(409, 'Operacja wygasła. Spróbuj ponownie.');
        commit(w); w.operation = null;
      });
    } catch (error) {
      await this.change(ownerId, w => { if (w.operation?.id === id) { onFailure?.(w); w.operation = null; } }).catch(() => {});
      throw error;
    }
  }
  async start(ownerId: string, body: Record<string, unknown>): Promise<TutorWorkspace> {
    if (body.subjectId !== undefined && body.subjectId !== 'math') fail(400, 'Obecny moduł tutora obsługuje matematykę.');
    if (body.focus !== undefined && !curriculum.skills.some(s => s.id === body.focus && !s.extra)) fail(400, 'Wybierz umiejętność z mapy wiedzy.');
    if (!TUTOR_MODES.includes(body.mode as TutorMode)) fail(400, 'Wybierz tryb sesji.');
    const mode = body.mode as TutorMode;
    return this.ai(ownerId, 'start', w => {
      if (w.sessions.some(s => s.id === w.activeSessionId && s.endedAt === null)) fail(409, 'Masz rozpoczętą sesję. Wznów ją albo zakończ.');
    }, async w => {
      const sheet = mode === 'exam' || mode === 'quiz' ? await this.provider.sheet(w.student, mode, body.level === 'PR' ? 'PR' : 'PP') : null;
      const recent = recentExercises(w);
      const generated = sheet ? null : await this.provider.generate(w.student, mode, recent.map(e => e.sourceId ?? e.id), typeof body.focus === 'string' ? body.focus : undefined, recent.slice(-12));
      const now = Date.now();
      const s: TutorSession = { id: randomUUID(), subjectId: 'math', examLevel: mode === 'exam' ? body.level === 'PR' ? 'PR' : 'PP' : null,
        mode, startedAt: now, endedAt: null, pausedAt: null, pausedMs: 0, taskTimeMs: {},
        deadlineAt: mode === 'exam' ? now + 180 * 60_000 : mode === 'quiz' ? now + 15 * 60_000 : null,
        currentIndex: 0, exerciseStartedAt: now, exercises: sheet?.exercises ?? [generated!.exercise], submissions: [], messages: [], hints: {}, assistance: {},
        introduction: sheet?.introduction ?? generated!.introduction, phases: generated?.phases ?? ['Samodzielna praca', 'Zdjęcia rozwiązań', 'Analiza i plan naprawczy'],
        lesson: null, summary: null, report: null };
      return latest => { latest.sessions.push(s); latest.activeSessionId = s.id; };
    });
  }
  async next(ownerId: string, body: Record<string, unknown>): Promise<TutorWorkspace> {
    return this.ai(ownerId, 'next', w => {
      const s = active(w); studying(s); expectedExercise(s, body);
      if (isAssessment(s)) fail(400, 'W arkuszu wybierz numer zadania.');
      if (!s.submissions.some(a => a.exerciseId === current(s).id && a.status === 'graded')) fail(409, 'Najpierw prześlij czytelne rozwiązanie i sprawdź analizę.');
    }, async w => {
      const s = active(w);
      const focus = s.lesson ? s.lesson.skillId : undefined;
      const recent = recentExercises(w);
      const generated = await this.provider.generate(w.student, s.mode, recent.map(e => e.sourceId ?? e.id), focus, recent.slice(-12));
      return latest => {
        const target = active(latest);
        target.exercises.push(generated.exercise); target.currentIndex = target.exercises.length - 1; target.exerciseStartedAt = Date.now();
        if (target.lesson && !target.lesson.checked) target.lesson.step = 3;
      };
    });
  }
  async help(ownerId: string, body: Record<string, unknown>, chat: boolean): Promise<TutorWorkspace> {
    if (chat && (typeof body.message !== 'string' || !body.message.trim() || body.message.length > 2000)) fail(400, 'Wpisz krótkie pytanie.');
    return this.ai(ownerId, chat ? 'chat' : 'hint', w => {
      const s = active(w); studying(s); expectedExercise(s, body);
      if (isAssessment(s)) fail(403, 'Pomoc nauczyciela jest wyłączona do zakończenia arkusza.');
      if (!chat && (s.hints[current(s).id]?.length ?? 0) >= 5) fail(409, 'Wszystkie podpowiedzi zostały już pokazane.');
    }, async w => {
      const s = active(w), e = current(s);
      const level = chat ? Math.max(1, s.hints[e.id]?.length ?? 0) : (s.hints[e.id]?.length ?? 0) + 1;
      const response = await this.provider.help(e, s, w.student, level, chat ? String(body.message) : undefined);
      return latest => {
        const target = active(latest);
        target.assistance[e.id] = Math.max(target.assistance[e.id] ?? 0, response.helpLevel);
        if (!chat) target.hints[e.id] = [...(target.hints[e.id] ?? []), response.text];
        target.messages.push({ id: randomUUID(), exerciseId: e.id, role: 'user', text: chat ? String(body.message) : `Podpowiedź ${level}`, helpLevel: 0, at: Date.now() },
          { id: randomUUID(), exerciseId: e.id, role: 'assistant', text: response.text, helpLevel: response.helpLevel, at: Date.now() });
      };
    });
  }
  async upload(ownerId: string, body: Record<string, unknown>): Promise<TutorWorkspace> {
    const image = body.image as { data?: unknown; mime?: unknown } | null;
    if (!image || typeof image.data !== 'string' || image.data.length > 3_500_000 || !['image/jpeg', 'image/png', 'image/webp'].includes(String(image.mime))
      || !/^[A-Za-z0-9+/]+={0,2}$/.test(image.data) || image.data.length % 4 !== 0) fail(413, 'Prześlij zdjęcie JPEG, PNG lub WebP o rozmiarze do 2,5 MB.');
    const bytes = Buffer.from(image.data, 'base64');
    const png = bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
    const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
    const webp = bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
    if (!(image.mime === 'image/png' && png || image.mime === 'image/jpeg' && jpeg || image.mime === 'image/webp' && webp)) fail(415, 'Plik nie jest prawidłowym zdjęciem.');
    if (typeof body.requestId !== 'string' || !/^[a-zA-Z0-9-]{8,80}$/.test(body.requestId)) fail(400, 'Brak identyfikatora wysłania.');
    const imageHash = hash(image.data), imageId = `${ownerId}/${imageHash}`;
    // Save the photo durably before acknowledgement; retries reference the same immutable image.
    const photo: TutorImage = { id: imageId, data: image.data, mime: image.mime as TutorImage['mime'], hash: imageHash };
    // Check scope before persisting a photo from a stale/revoked device.
    const workspace = await this.load(ownerId);
    if (uploadReceipt(workspace, body, imageHash)) return workspace;
    const initial = active(workspace);
    uploading(initial); expectedExercise(initial, body);
    await this.store.compareAndSet(`image/${imageId}`, null, photo);
    return this.change(ownerId, w => {
      if (uploadReceipt(w, body, imageHash)) return;
      const s = active(w); uploading(s); expectedExercise(s, body);
      const e = current(s);
      if (s.submissions.some(a => a.requestId === body.requestId && a.imageHash !== imageHash)) fail(409, 'Identyfikator wysłania jest już przypisany do innego zdjęcia.');
      if (s.submissions.some(a => a.exerciseId === e.id && (a.requestId === body.requestId || a.imageHash === imageHash))) return;
      if (s.submissions.filter(a => a.exerciseId === e.id).length >= 8) fail(429, 'Osiągnięto limit zdjęć do tego zadania.');
      if (isAssessment(s)) s.submissions.filter(a => a.exerciseId === e.id && a.status === 'received').forEach(a => { a.status = 'superseded'; });
      s.submissions.push({ id: randomUUID(), requestId: String(body.requestId), exerciseId: e.id, imageIds: [imageId], imageHash,
        receivedAt: Date.now(), elapsedMs: s.endedAt !== null ? s.submissions.filter(a => a.exerciseId === e.id).at(-1)?.elapsedMs ?? 0
          : (s.taskTimeMs[e.id] ?? 0) + Math.max(0, Date.now() - s.exerciseStartedAt), hintsUsed: s.assistance[e.id] ?? 0,
        selfConfidence: ['guess', 'partial', 'sure'].includes(String(body.confidence)) ? body.confidence as Submission['selfConfidence'] : 'partial',
        status: 'received', analysis: null, error: null });
    });
  }
  async analyze(ownerId: string, body: Record<string, unknown>): Promise<TutorWorkspace> {
    let submissionId = '';
    return this.ai(ownerId, 'analyze', w => {
        const s = active(w);
        if (isAssessment(s) && s.endedAt === null) fail(403, 'Analiza rozpocznie się po zakończeniu arkusza.');
        const submission = s.submissions.find(a => a.id === body.submissionId) ?? fail(404, 'Nie ma tego rozwiązania.');
        if (['graded', 'clarify', 'superseded'].includes(submission.status)) fail(409, 'To rozwiązanie jest już przeanalizowane lub zastąpione nowszym zdjęciem.');
        submissionId = submission.id; submission.status = 'analyzing'; submission.error = null;
      }, async w => {
        const s = active(w), submission = s.submissions.find(a => a.id === submissionId)!;
        const e = s.exercises.find(e => e.id === submission.exerciseId)!;
        const images = await Promise.all(submission.imageIds.map(async id => (await this.store.read<TutorImage>(`image/${id}`))?.value ?? fail(404, 'Nie znaleziono zdjęcia.')));
        const analysis = validateAnalysis(await this.provider.analyze(e, images, w.student), e.maxPoints);
        return latest => {
          const target = active(latest), attempt = target.submissions.find(a => a.id === submissionId)!;
          attempt.analysis = analysis; attempt.status = analysis.verdict === 'uncertain' ? 'clarify' : 'graded';
          // Resubmitting the same task is practice, never multiple independent mastery proofs.
          if (!target.submissions.some(a => a.id !== attempt.id && a.exerciseId === e.id && a.status === 'graded')) {
            latest.student = applySolution(latest.student, attempt, e);
          }
          if (target.lesson && e.skillId === target.lesson.skillId && analysis.verdict === 'correct' && analysis.reasoning === 'sound' && attempt.hintsUsed === 0) {
            target.lesson.checked = true; target.lesson.step = 4;
          }
          if (isAssessment(target)) this.updateReport(latest, target);
        };
      }, w => {
        const a = active(w).submissions.find(a => a.id === submissionId);
        if (a?.status === 'analyzing') { a.status = 'error'; a.error = 'Analiza nie powiodła się. Zdjęcie jest zapisane — spróbuj ponownie.'; }
      });
  }
  private updateReport(w: TutorWorkspace, s: TutorSession) {
    const previous = w.sessions.filter(x => x.id !== s.id && x.mode === s.mode && x.examLevel === s.examLevel && x.report).at(-1)?.report ?? null;
    s.report = examReport(s, previous);
    if (s.mode === 'exam') {
      w.student.recentExams = [...(w.student.recentExams ?? []).filter(e => e.sessionId !== s.id), {
        sessionId: s.id, level: s.examLevel ?? 'PP', earned: s.report.earned, possible: s.report.possible,
        ungraded: s.report.ungraded, repairSkillIds: s.report.repairSkillIds, takenAt: s.startedAt,
      }].slice(-6);
    }
  }
  async lesson(ownerId: string, body: Record<string, unknown>): Promise<TutorWorkspace> {
    return this.ai(ownerId, 'lesson', w => {
      const s = active(w); studying(s); expectedExercise(s, body);
      if (isAssessment(s)) fail(403, 'Miniwykład dostępny po egzaminie w sesji naprawczej.');
      if (!s.submissions.some(a => a.exerciseId === current(s).id && a.analysis && a.status === 'graded')) fail(409, 'Najpierw sprawdź rozwiązanie.');
    }, async w => {
      const s = active(w), e = current(s);
      const analysis = s.submissions.filter(a => a.exerciseId === e.id && a.status === 'graded').at(-1)!.analysis!;
      const lesson = await this.provider.lesson(e, analysis, w.student);
      return latest => { active(latest).lesson = lesson; active(latest).assistance[e.id] = Math.max(4, active(latest).assistance[e.id] ?? 0); };
    });
  }
  async finish(ownerId: string): Promise<TutorWorkspace> {
    return this.change(ownerId, w => {
      if (locked(w)) fail(409, 'Poczekaj na zakończenie bieżącej operacji.');
      const s = active(w); s.endedAt ??= Math.min(Date.now(), s.deadlineAt ?? Infinity);
      if (s.pausedAt !== null) s.pausedMs += s.endedAt - s.pausedAt;
      s.pausedAt = null;
      if (isAssessment(s)) this.updateReport(w, s);
    });
  }
  async plan(ownerId: string): Promise<TutorWorkspace> {
    return this.ai(ownerId, 'plan', w => {
      const s = active(w);
      if (s.endedAt === null) fail(409, 'Najpierw zakończ sesję.');
      if (s.submissions.some(a => a.status === 'received' || a.status === 'analyzing' || a.status === 'error')) fail(409, 'Najpierw dokończ analizę zapisanych zdjęć.');
    }, async w => {
      const result = await this.provider.plan(w.student, active(w));
      return latest => { latest.student.plan = result.plan; active(latest).summary = result.summary; };
    });
  }
  async simple(ownerId: string, action: string, body: Record<string, unknown>): Promise<TutorWorkspace> {
    return this.change(ownerId, w => {
      if (locked(w)) fail(409, 'Poczekaj na zakończenie bieżącej operacji.');
      if (action === 'style') {
        if (!['simple', 'visual', 'formal'].includes(String(body.style))) fail(400, 'Nieprawidłowy sposób tłumaczenia.');
        w.student.explanationStyle = body.style as StudentModel['explanationStyle']; return;
      }
      const s = active(w);
      if (action === 'select') {
        if (s.endedAt === null) studying(s);
        if (!Number.isInteger(body.index) || Number(body.index) < 0 || Number(body.index) >= s.exercises.length) fail(400, 'Nieprawidłowy numer zadania.');
        if (s.endedAt === null) s.taskTimeMs[current(s).id] = (s.taskTimeMs[current(s).id] ?? 0) + Math.max(0, Date.now() - s.exerciseStartedAt);
        s.currentIndex = Number(body.index); if (s.endedAt === null) s.exerciseStartedAt = Date.now();
      } else if (action === 'pause') {
        studying(s); if (isAssessment(s)) fail(403, 'Timer arkusza działa bez przerw.'); s.pausedAt = Date.now();
      } else if (action === 'resume') {
        if (s.endedAt !== null) fail(409, 'Sesja jest już zakończona.');
        if (s.pausedAt !== null) { s.pausedMs += Date.now() - s.pausedAt; s.exerciseStartedAt += Date.now() - s.pausedAt; s.pausedAt = null; }
      } else if (action === 'lesson-dismiss') {
        studying(s);
        if (!s.lesson?.checked || s.lesson.step < 5) fail(409, 'Najpierw przejdź wyjaśnienie i rozwiąż zadanie sprawdzające.');
        s.lesson = null;
      } else if (action === 'lesson-step') {
        studying(s); if (!s.lesson) fail(404, 'Nie ma miniwykładu.');
        if (s.lesson.step >= 3 && !s.lesson.checked) fail(409, 'Teraz rozwiąż zadanie sprawdzające samodzielnie na kartce.');
        s.lesson.step = Math.min(5, s.lesson.step + 1);
      } else fail(400, 'Nieznana operacja.');
    });
  }
  async pair(ownerId: string): Promise<string> {
    const access = token(), expiresAt = Date.now() + 90 * 86_400_000;
    await this.change(ownerId, w => { w.scanners = [{ hash: hash(access), expiresAt }]; });
    await this.store.compareAndSet(`credential/${hash(access)}`, null, { ownerId, role: 'scanner', expiresAt } satisfies Credential);
    return access;
  }
  async revoke(ownerId: string): Promise<TutorWorkspace> { return this.change(ownerId, w => { w.scanners = []; }); }
  async repeat(ownerId: string, body: Record<string, unknown>): Promise<TutorWorkspace> {
    return this.change(ownerId, w => {
      if (locked(w) || w.sessions.some(s => s.id === w.activeSessionId && s.endedAt === null)) fail(409, 'Najpierw zakończ aktywną sesję.');
      const source = w.sessions.find(s => s.id === body.sessionId);
      const exercise = source?.exercises.find(e => e.id === body.exerciseId) ?? fail(404, 'Nie ma tego zadania w historii.');
      const now = Date.now();
      const s: TutorSession = { id: randomUUID(), subjectId: exercise.subjectId, examLevel: null, mode: 'review', startedAt: now, endedAt: null, pausedAt: null, pausedMs: 0, taskTimeMs: {}, deadlineAt: null,
        currentIndex: 0, exerciseStartedAt: now, exercises: [{ ...exercise, id: randomUUID(), rationale: 'Ponowne rozwiązanie zadania z historii.' }],
        submissions: [], messages: [], hints: {}, assistance: {}, introduction: 'Sprawdźmy, co pamiętasz. Rozwiąż zadanie od nowa na kartce.',
        phases: ['Powtórka', 'Samodzielne rozwiązanie', 'Sprawdzenie'], lesson: null, summary: null, report: null };
      w.sessions.push(s); w.activeSessionId = s.id;
    });
  }
}
