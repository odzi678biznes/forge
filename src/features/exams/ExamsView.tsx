import { useEffect, useMemo, useState } from 'react';
import type { ExamLevel, ExamResult, Skill, Topic } from '@/data/types';
import { examTitle, type ExamSheet } from '@content/exams/types';
import { Icon } from '@/components/Icon';
import { Ring } from '@/components/Ring';
import { openExternal } from '@/platform/open-external';
import { formatDay, dayKey } from '@/learning-engine/schedule';
import { count } from '@/learning-engine/polish';
import { analyze, lastResult, percent, requirementText, scoresByTopic, tasksWithSkills, totalOf } from './exam-model';
import './exams.css';

/**
 * Arkusze CKE - prawdziwe arkusze maturalne w pracy z kursem.
 *
 * Uczeń rozwiązuje arkusz na papierze (tak jak na maturze), sprawdza go
 * z oficjalnymi zasadami oceniania i wpisuje punkty. Aplikacja nie pokazuje
 * treści zadań - linkuje do PDF-ów CKE - ale z punktów wie, na których
 * umiejętnościach uciekły punkty, i dopisuje je do powtórek.
 */

interface Props {
  exams: ExamSheet[];
  results: ExamResult[];
  subjectId: string;
  skills: Skill[];
  topics: Topic[];
  hasLesson: (skillId: string) => boolean;
  onSave: (result: ExamResult, weakSkillIds: string[]) => Promise<number>;
  onDelete: (id: string) => Promise<void>;
  onPractice: (skill: Skill) => void;
  onOpenLesson: (skillId: string) => void;
}

type Mode =
  | { kind: 'list' }
  | { kind: 'entry'; exam: ExamSheet; editing?: ExamResult | undefined }
  | { kind: 'result'; exam: ExamSheet; result: ExamResult; reviews: number };

/** Informator CKE o maturze z biznesu i zarządzania (od roku szkolnego 2026/2027). */
const BIZ_INFORMATOR = 'https://cke.gov.pl/images/_EGZAMIN_MATURALNY_OD_2023/Informatory/2026/informator_BIZ.pdf';

const KIND_CHIP: Record<ExamSheet['kind'], string> = {
  main: 'matura',
  diagnostic: 'diagnostyczny',
  mock: 'próbna CKE',
};

export function ExamsView(props: Props) {
  const [mode, setMode] = useState<Mode>({ kind: 'list' });

  if (mode.kind === 'entry') {
    return (
      <ScoreEntry
        exam={mode.exam}
        editing={mode.editing}
        subjectId={props.subjectId}
        onCancel={() => setMode({ kind: 'list' })}
        onSaved={async (result) => {
          const weak = analyze(mode.exam, result.scores).weak;
          const reviews = await props.onSave(result, weak);
          setMode({ kind: 'result', exam: mode.exam, result, reviews });
        }}
      />
    );
  }

  if (mode.kind === 'result') {
    return (
      <ExamResultView
        {...props}
        exam={mode.exam}
        result={mode.result}
        reviews={mode.reviews}
        onBack={() => setMode({ kind: 'list' })}
        onEdit={() => setMode({ kind: 'entry', exam: mode.exam, editing: mode.result })}
      />
    );
  }

  return (
    <ExamList
      {...props}
      onEnter={(exam) => setMode({ kind: 'entry', exam })}
      onShow={(exam, result) => setMode({ kind: 'result', exam, result, reviews: 0 })}
    />
  );
}

// ===========================================================================
// Lista arkuszy
// ===========================================================================

function ExamList({
  exams,
  results,
  subjectId,
  onEnter,
  onShow,
  onDelete,
}: Props & { onEnter: (exam: ExamSheet) => void; onShow: (exam: ExamSheet, result: ExamResult) => void }) {
  const levels = (['PR', 'PP'] as const).filter((l) => exams.some((e) => e.level === l));
  const [chosen, setLevel] = useState<ExamLevel>(levels[0] ?? 'PR');
  // Po zmianie przedmiotu wybrany poziom może nie istnieć (informatyka ma tylko PR).
  const level: ExamLevel = levels.includes(chosen) ? chosen : (levels[0] ?? 'PR');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const cs = exams.some((e) => e.subjectId === 'cs');
  const visible = exams.filter((e) => e.level === level).sort((a, b) => b.date.localeCompare(a.date));
  const byId = new Map(exams.map((e) => [e.id, e]));
  const history = results
    .filter((r) => byId.get(r.examId)?.level === level)
    .sort((a, b) => a.takenAt - b.takenAt)
    .map((r) => {
      const exam = byId.get(r.examId)!;
      return { result: r, exam, pct: percent(totalOf(exam, r), exam.maxPoints) };
    });

  if (exams.length === 0) {
    const biz = subjectId === 'biz';
    return (
      <main className="page">
        <header>
          <p className="page__eyebrow">Arkusze CKE</p>
          <h1 className="page__title">{biz ? 'Pierwsza matura w maju 2027' : 'Arkusze w przygotowaniu'}</h1>
          <p className="page__lead">
            {biz
              ? 'Biznes i zarządzanie to nowy przedmiot maturalny — CKE nie ma jeszcze arkuszy z poprzednich lat. Egzamin trwa 180 minut, można zdobyć 50 punktów, a na egzaminie przyda się kalkulator prosty. Przykładowe zadania z rozwiązaniami CKE opublikowała w informatorze.'
              : 'Dla tego przedmiotu katalog oficjalnych arkuszy jeszcze nie jest gotowy.'}
          </p>
          {biz && (
            <button type="button" className="btn btn--small" onClick={() => void openExternal(BIZ_INFORMATOR)}>
              <Icon name="external" size={15} /> Informator CKE (PDF)
            </button>
          )}
        </header>
      </main>
    );
  }

  return (
    <main className="page">
      <header>
        <p className="page__eyebrow">Arkusze CKE</p>
        <h1 className="page__title">Prawdziwe arkusze maturalne</h1>
        <p className="page__lead">
          {cs
            ? 'Rozwiąż arkusz przy komputerze w 210 minut, tak jak na maturze — pliki z danymi do zadań praktycznych pobierzesz przyciskiem „Dane”. '
            : 'Rozwiąż arkusz na papierze w 180 minut, tak jak na maturze. '}
          Potem sprawdź się z oficjalnymi zasadami oceniania CKE i wpisz punkty — zobaczysz, na których
          umiejętnościach uciekły punkty, a one trafią do powtórek.
        </p>
      </header>

      {levels.length > 1 && (
      <div className="exams__levels" role="radiogroup" aria-label="Poziom arkuszy">
        {levels.map((l) => (
          <button
            key={l}
            type="button"
            role="radio"
            aria-checked={level === l}
            className={level === l ? 'exams__level exams__level--on' : 'exams__level'}
            onClick={() => setLevel(l)}
          >
            {l === 'PR' ? 'Rozszerzenie' : 'Podstawa'}
            <span>{count(exams.filter((e) => e.level === l).length, ['arkusz', 'arkusze', 'arkuszy'])}</span>
          </button>
        ))}
      </div>
      )}

      {history.length > 0 && (
        <section className="card" aria-labelledby="exams-history">
          <h2 className="card__title" id="exams-history">
            Twoje wyniki — {level === 'PR' ? 'rozszerzenie' : 'podstawa'}
          </h2>
          <HistoryChart points={history.map((h) => ({ pct: h.pct, label: `${formatDay(dayKey(h.result.takenAt))}: ${h.pct}%` }))} />
          <ul className="exams__history">
            {[...history].reverse().map((h) => (
              <li key={h.result.id}>
                <button type="button" className="exams__history-open" onClick={() => onShow(h.exam, h.result)}>
                  <strong>{h.pct}%</strong>
                  <span>
                    {examTitle(h.exam)} · {formatDay(dayKey(h.result.takenAt))}
                  </span>
                </button>
                {confirmDelete === h.result.id ? (
                  <span className="exams__confirm">
                    Usunąć ten wynik?
                    <button type="button" className="btn btn--small" onClick={() => void onDelete(h.result.id).then(() => setConfirmDelete(null))}>
                      Usuń
                    </button>
                    <button type="button" className="btn btn--small" onClick={() => setConfirmDelete(null)}>
                      Anuluj
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    className="exams__icon-btn"
                    aria-label="Usuń wynik"
                    onClick={() => setConfirmDelete(h.result.id)}
                  >
                    <Icon name="close" size={16} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <ul className="exams__list">
        {visible.map((exam) => {
          const last = lastResult(results, exam.id);
          return (
            <li key={exam.id} className="card exams__item">
              <div className="exams__item-head">
                <div>
                  <h2 className="exams__item-title">{examTitle(exam)}</h2>
                  <p className="exams__item-meta">
                    <span className={exam.level === 'PP' ? 'chip chip--pp' : 'chip chip--pr'}>{KIND_CHIP[exam.kind]}</span>
                    <span>{exam.tasks.length} zadań · {exam.maxPoints} pkt · {exam.minutes} min</span>
                    {exam.era === 2018 && (
                      <span className="chip" title="Arkusz ułożony według podstawy obowiązującej do maja 2024 r. Większość zadań pasuje do obecnych wymagań.">
                        starsza podstawa
                      </span>
                    )}
                  </p>
                </div>
                {last && (
                  <button type="button" className="exams__score" onClick={() => onShow(exam, last)}>
                    {percent(totalOf(exam, last), exam.maxPoints)}%
                    <span>ostatni wynik</span>
                  </button>
                )}
              </div>
              <div className="exams__actions">
                <button type="button" className="btn btn--small" onClick={() => void openExternal(exam.sheetUrl)}>
                  <Icon name="external" size={15} /> Arkusz (PDF)
                </button>
                <button type="button" className="btn btn--small" onClick={() => void openExternal(exam.keyUrl)}>
                  <Icon name="external" size={15} /> Zasady oceniania
                </button>
                {exam.dataUrl && (
                  <button type="button" className="btn btn--small" onClick={() => void openExternal(exam.dataUrl!)}>
                    <Icon name="external" size={15} /> Dane (ZIP)
                  </button>
                )}
                <button type="button" className="btn btn--small btn--primary" onClick={() => onEnter(exam)}>
                  <Icon name="exam" size={15} /> Wpisz wynik
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="exams__source">
        Arkusze i zasady oceniania otwierają się na stronie Centralnej Komisji Egzaminacyjnej (cke.gov.pl). FORGE nie
        kopiuje treści zadań — zna tylko numery zadań, punkty i wymagania, które sprawdzają.
      </p>
    </main>
  );
}

function HistoryChart({ points }: { points: Array<{ pct: number; label: string }> }) {
  const w = 600;
  const h = 150;
  const pad = 24;
  const x = (i: number) => (points.length === 1 ? w / 2 : pad + (i * (w - 2 * pad)) / (points.length - 1));
  const y = (pct: number) => h - pad - (pct / 100) * (h - 2 * pad);
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)} ${y(p.pct).toFixed(1)}`).join(' ');
  return (
    <svg className="exams__chart" viewBox={`0 0 ${w} ${h}`} role="img" aria-label={`Wyniki: ${points.map((p) => p.label).join(', ')}`}>
      {[0, 50, 100].map((g) => (
        <g key={g}>
          <line x1={pad} x2={w - pad} y1={y(g)} y2={y(g)} className={g === 100 ? 'exams__chart-goal' : 'exams__chart-grid'} />
          <text x={4} y={y(g) + 4} className="exams__chart-label">
            {g}
          </text>
        </g>
      ))}
      <path d={path} className="exams__chart-line" />
      {points.map((p, i) => (
        <circle key={i} cx={x(i)} cy={y(p.pct)} r={5} className="exams__chart-dot">
          <title>{p.label}</title>
        </circle>
      ))}
    </svg>
  );
}

// ===========================================================================
// Wpisywanie punktów
// ===========================================================================

function ScoreEntry({
  exam,
  editing,
  subjectId,
  onCancel,
  onSaved,
}: {
  exam: ExamSheet;
  editing?: ExamResult | undefined;
  subjectId: string;
  onCancel: () => void;
  onSaved: (result: ExamResult) => Promise<void>;
}) {
  const [scores, setScores] = useState<Record<string, number>>(editing?.scores ?? {});
  const [date, setDate] = useState(dayKey(editing?.takenAt ?? Date.now()));
  const [minutes, setMinutes] = useState<string>(editing?.minutes != null ? String(editing.minutes) : '');
  const [timerStart, setTimerStart] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (timerStart === null) return undefined;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [timerStart]);

  const elapsedMin = timerStart === null ? 0 : Math.floor((now - timerStart) / 60_000);
  const total = exam.tasks.reduce((s, t) => s + (scores[t.no] ?? 0), 0);
  const filled = exam.tasks.filter((t) => scores[t.no] !== undefined).length;
  const analysis = useMemo(() => analyze(exam, scores), [exam, scores]);

  const save = async () => {
    setSaving(true);
    const takenAt = new Date(`${date}T12:00:00`).getTime();
    const parsed = Number.parseInt(minutes, 10);
    await onSaved({
      id: editing?.id ?? crypto.randomUUID(),
      examId: exam.id,
      subjectId,
      takenAt: Number.isFinite(takenAt) ? takenAt : Date.now(),
      scores,
      minutes: Number.isFinite(parsed) && parsed > 0 ? parsed : timerStart !== null ? elapsedMin : null,
    });
  };

  return (
    <main className="page">
      <header>
        <p className="page__eyebrow">Arkusze CKE · wpisywanie wyniku</p>
        <h1 className="page__title">{examTitle(exam)}</h1>
        <p className="page__lead">
          Sprawdź rozwiązania z zasadami oceniania CKE i zaznacz punkty za każde zadanie. Bądź dla siebie tak
          surowy jak egzaminator — zawyżony wynik ukryje umiejętności, które trzeba powtórzyć.
        </p>
      </header>

      <section className="card exams__entry-tools">
        <div className="exams__actions">
          <button type="button" className="btn btn--small" onClick={() => void openExternal(exam.sheetUrl)}>
            <Icon name="external" size={15} /> Arkusz (PDF)
          </button>
          <button type="button" className="btn btn--small" onClick={() => void openExternal(exam.keyUrl)}>
            <Icon name="external" size={15} /> Zasady oceniania
          </button>
          {exam.dataUrl && (
            <button type="button" className="btn btn--small" onClick={() => void openExternal(exam.dataUrl!)}>
              <Icon name="external" size={15} /> Dane (ZIP)
            </button>
          )}
        </div>
        <div className="exams__fields">
          <label>
            Data rozwiązania
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label>
            Czas pracy (min)
            <input
              type="number"
              min={1}
              max={400}
              inputMode="numeric"
              placeholder={timerStart !== null ? String(elapsedMin) : 'np. 175'}
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
            />
          </label>
          <div className="exams__timer">
            {timerStart === null ? (
              <button type="button" className="btn btn--small" onClick={() => { setTimerStart(Date.now()); setNow(Date.now()); }}>
                <Icon name="clock" size={15} /> Mierz czas
              </button>
            ) : (
              <span className={elapsedMin >= exam.minutes ? 'exams__timer-over' : ''}>
                <Icon name="clock" size={15} /> {elapsedMin} min z {exam.minutes}
              </span>
            )}
          </div>
        </div>
      </section>

      <ol className="exams__tasks">
        {exam.tasks.map((task) => {
          const value = scores[task.no];
          return (
            <li key={task.no} className="exams__task">
              <div className="exams__task-head">
                <strong>Zad. {task.no}</strong>
                <span className="exams__task-max">0–{task.points} pkt</span>
                <span className="exams__codes">
                  {task.codes.map((c) => {
                    const text = requirementText(c, exam);
                    return (
                      <span key={c} className="chip" title={text ?? `Wymaganie ${c}`}>
                        {c}
                      </span>
                    );
                  })}
                </span>
              </div>
              <div className="exams__points" role="radiogroup" aria-label={`Punkty za zadanie ${task.no}`}>
                {Array.from({ length: task.points + 1 }, (_, p) => (
                  <button
                    key={p}
                    type="button"
                    role="radio"
                    aria-checked={value === p}
                    className={value === p ? 'exams__point exams__point--on' : 'exams__point'}
                    onClick={() => setScores((prev) => ({ ...prev, [task.no]: p }))}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </li>
          );
        })}
      </ol>

      <section className="card exams__sum" aria-live="polite">
        <div>
          <strong>
            {total} / {exam.maxPoints} pkt
          </strong>{' '}
          ({percent(total, exam.maxPoints)}%)
          <p className="exams__sum-note">
            {filled < exam.tasks.length
              ? `Wpisano ${filled} z ${exam.tasks.length} zadań — puste liczą się jako 0 pkt.`
              : 'Wszystkie zadania wpisane.'}
            {analysis.weak.length > 0 && ` Do powtórki: ${count(analysis.weak.length, ['umiejętność', 'umiejętności', 'umiejętności'])}.`}
          </p>
        </div>
        <div className="exams__actions">
          <button type="button" className="btn" onClick={onCancel}>
            Anuluj
          </button>
          <button type="button" className="btn btn--primary" disabled={saving || filled === 0} onClick={() => void save()}>
            Zapisz wynik
          </button>
        </div>
      </section>
    </main>
  );
}

// ===========================================================================
// Wynik i wnioski
// ===========================================================================

function ExamResultView({
  exam,
  result,
  reviews,
  skills,
  topics,
  hasLesson,
  onPractice,
  onOpenLesson,
  onBack,
  onEdit,
}: Props & {
  exam: ExamSheet;
  result: ExamResult;
  reviews: number;
  onBack: () => void;
  onEdit: () => void;
}) {
  const analysis = analyze(exam, result.scores);
  const byId = new Map(skills.map((s) => [s.id, s]));
  const topicScores = scoresByTopic(exam, result.scores, skills, topics);
  // Po zadaniach, nie po umiejętnościach: uczeń ma arkusz przed sobą i wie,
  // czego dotyczyło zadanie 11 - lista umiejętności jest podpowiedzią, co
  // powtórzyć, a nie werdyktem, która zawiodła.
  const codesOf = new Map(exam.tasks.map((t) => [t.no, t.codes]));
  const lostTasks = tasksWithSkills(exam)
    .map((t) => ({ ...t, got: Math.min(t.points, Math.max(0, result.scores[t.no] ?? 0)) }))
    .filter((t) => t.got < t.points)
    .sort((a, b) => b.points - b.got - (a.points - a.got));

  return (
    <main className="page">
      <header>
        <p className="page__eyebrow">Arkusze CKE · wynik</p>
        <h1 className="page__title">{examTitle(exam)}</h1>
        <p className="page__lead">
          Rozwiązany {formatDay(dayKey(result.takenAt))}
          {result.minutes ? `, w ${result.minutes} min` : ''}.
        </p>
      </header>

      <section className="card exams__result-top">
        <Ring value={analysis.ratio} label={`${analysis.earned} / ${analysis.max} pkt`} size={132} tone={exam.level === 'PR' ? 'challenge' : 'progress'} />
        <div>
          <p className="exams__verdict">
            {analysis.ratio >= 0.9
              ? 'Poziom, o który walczysz. Teraz utrzymać go na kolejnych arkuszach.'
              : analysis.ratio >= 0.6
                ? 'Solidna podstawa — punkty uciekły w konkretnych miejscach, widać je niżej.'
                : 'Arkusz pokazał, gdzie są braki. To cenniejsze niż dobry wynik — teraz wiadomo, co ćwiczyć.'}
          </p>
          {reviews > 0 && (
            <p className="exams__reviews">
              <Icon name="repeat" size={16} /> {count(reviews, ['umiejętność trafiła', 'umiejętności trafiły', 'umiejętności trafiło'])} do dzisiejszych powtórek.
            </p>
          )}
          <div className="exams__actions">
            <button type="button" className="btn btn--small" onClick={onEdit}>
              Popraw punkty
            </button>
            <button type="button" className="btn btn--small" onClick={onBack}>
              Wszystkie arkusze
            </button>
          </div>
        </div>
      </section>

      {topicScores.length > 0 && (
        <section className="card" aria-labelledby="exam-topics">
          <h2 className="card__title" id="exam-topics">
            Punkty według działów
          </h2>
          <ul className="topic-bars">
            {topicScores.map((t) => (
              <li key={t.topic.id}>
                <span className="topic-bars__name">{t.topic.name}</span>
                <span className="topic-bars__bar bar" aria-hidden>
                  <span className="bar__fill" style={{ width: `${percent(t.earned, t.max)}%`, display: 'block' }} />
                </span>
                <span className="topic-bars__value">
                  {t.earned}/{t.max}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="card" aria-labelledby="exam-weak">
        <h2 className="card__title" id="exam-weak">
          {lostTasks.length > 0 ? 'Zadania, na których uciekły punkty' : 'Komplet punktów'}
        </h2>
        {lostTasks.length === 0 ? (
          <p className="exams__sum-note">Każde zadanie z tego arkusza na maksimum.</p>
        ) : (
          <ul className="exams__weak">
            {lostTasks.map((t) => (
              <li key={t.no}>
                <div className="exams__weak-head">
                  <strong>Zad. {t.no}</strong>
                  <span>
                    {t.got}/{t.points} pkt · straciłeś {t.points - t.got}
                  </span>
                  <span className="exams__codes">
                    {(codesOf.get(t.no) ?? []).map((c) => (
                      <span key={c} className="chip" title={requirementText(c, exam) ?? `Wymaganie ${c}`}>
                        {c}
                      </span>
                    ))}
                  </span>
                </div>
                <div className="exams__skills">
                  <span>Powtórz:</span>
                  {t.skills
                    .map((id) => byId.get(id))
                    .filter((s): s is Skill => s !== undefined)
                    .map((s) => (
                      <span key={s.id} className="exams__skill">
                        <button type="button" className="btn btn--small" onClick={() => onPractice(s)}>
                          <Icon name="play" size={13} /> {s.name}
                        </button>
                        {hasLesson(s.id) && (
                          <button
                            type="button"
                            className="exams__icon-btn"
                            aria-label={`Lekcja: ${s.name}`}
                            title="Lekcja"
                            onClick={() => onOpenLesson(s.id)}
                          >
                            <Icon name="book" size={15} />
                          </button>
                        )}
                      </span>
                    ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
