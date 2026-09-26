import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { DzisView } from '@/nauka/DzisView';
import { FeedView, type Tryb } from '@/nauka/FeedView';
import { useNauka } from '@/nauka/useNauka';
import { LEKCJE, lekcja as lekcjaNauki } from '@/nauka/lekcje';
import { postep as postepNauki, powtorkaNaTeraz, wybierzTrening } from '@/nauka/silnik';
import { spojnyPostep } from '@/nauka/spojny-postep';
import { CORPORA, SUBJECT_LABELS, useForge, type Screen, type SubjectId } from './useForge';
import { remainingMinutes, subjectGlance, useCourse } from './useCourse';
import { dayKey } from '@/learning-engine/schedule';
import { Shell } from './Shell';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { MissionSummary } from '@/features/missions/MissionSummary';
import { Arena } from '@/features/questions/Arena';
import { MasteryMap } from '@/features/mastery-map/MasteryMap';
import { ErrorLab } from '@/features/error-lab/ErrorLab';
import { practiceFor, repairFor, timeTrial, trainingFor } from '@/learning-engine/mission';
import { openErrorCount } from '@/learning-engine/error-lab';
import { DiagnosticIntro } from '@/features/diagnostics/DiagnosticIntro';
import { DiagnosticReportView } from '@/features/diagnostics/DiagnosticReportView';
import { WeeklyReportView } from '@/features/weekly-review/WeeklyReportView';
import { AiSettings } from '@/features/ai/AiSettings';
import { createTutor } from '@/features/ai/tutor';
import { DataScreen, type SubjectInfo } from '@/features/data/DataScreen';
import { TodayView } from '@/features/course/TodayView';
import { CourseView } from '@/features/course/CourseView';
import { LessonView } from '@/features/course/LessonView';
import { CalendarView } from '@/features/course/CalendarView';
import { ProgressView } from '@/features/course/ProgressView';
import { FlashcardsView } from '@/features/flashcards/FlashcardsView';
import { ExamsView } from '@/features/exams/ExamsView';
import { MATH_EXAMS } from '@content/exams/math-exams';
import { CS_EXAMS } from '@content/exams/cs-exams';
import type { ExamSheet } from '@content/exams/types';
import type { Skill } from '@/data/types';
import { MATH_CORPUS } from '@content/math/index';
import { CS_CORPUS } from '@content/cs/index';
import { BIZ_CORPUS } from '@content/biz/index';

/** Ekran danych działa na obu przedmiotach naraz, niezależnie od wybranego. */
const DATA_SUBJECTS: SubjectInfo[] = [
  { id: 'math', label: SUBJECT_LABELS.math, skillIds: MATH_CORPUS.skills.map((s) => s.id) },
  { id: 'cs', label: SUBJECT_LABELS.cs, skillIds: CS_CORPUS.skills.map((s) => s.id) },
  { id: 'biz', label: SUBJECT_LABELS.biz, skillIds: BIZ_CORPUS.skills.map((s) => s.id) },
];
/** Katalog oficjalnych arkuszy CKE według przedmiotu. */
/** Biznes i zarządzanie: pierwsza matura w maju 2027, arkuszy jeszcze nie ma. */
const EXAMS: Record<'math' | 'cs' | 'biz', ExamSheet[]> = { math: MATH_EXAMS, cs: CS_EXAMS, biz: [] };

const SUBJECT_IDS = Object.keys(CORPORA) as SubjectId[];

const ALL_SKILLS = [...MATH_CORPUS.skills, ...CS_CORPUS.skills, ...BIZ_CORPUS.skills];
const ALL_QUESTIONS = [...MATH_CORPUS.questions, ...CS_CORPUS.questions, ...BIZ_CORPUS.questions];

export function App() {
  const forge = useForge();
  const { state, skills, questions, topics, corpus, beginMission, goTo, toCommandCenter } = forge;

  // AI jest opcjonalne i domyślnie wyłączone: włącza je dopiero klucz
  // podany w tej sesji (sek. 11). Tutor tworzymy raz na całe życie aplikacji.
  const tutor = useMemo(() => createTutor(), []);
  const [aiEnabled, setAiEnabled] = useState(false);
  useEffect(() => {
    if (tutor.unavailableReason) return;
    void tutor.keyPresent().then(setAiEnabled).catch(() => setAiEnabled(false));
  }, [tutor]);
  const catalogue = useMemo(() => questions.flatMap((q) => q.commonErrors), [questions]);

  const portRef = useRef(forge.storage);
  portRef.current = forge.storage;
  const port = useCallback(() => portRef.current(), []);
  const { stan: stanNauki, zmien: zmienNauke } = useNauka(port, state.screen !== 'loading');
  const spojny = useMemo(
    () => spojnyPostep(stanNauki, state.skillStates, forge.lessonProgress),
    [stanNauki, state.skillStates, forge.lessonProgress],
  );

  // Dzień ma jeden budżet na wszystkie przedmioty: każdy kalendarz wie, ile
  // materiału zostało w pozostałych.
  const day = dayKey(Date.now());
  const loads = useMemo(() => {
    const now = Date.now();
    return Object.fromEntries(
      SUBJECT_IDS.map((id) => [id, remainingMinutes(CORPORA[id], spojny.states, now)]),
    ) as Record<SubjectId, number>;
    // `day`: po północy "przerobione dziś" przestaje być dzisiejsze.
  }, [spojny.states, day]);
  const totalLoad = SUBJECT_IDS.reduce((sum, id) => sum + loads[id], 0);

  const course = useCourse({
    corpus,
    states: spojny.states,
    attempts: forge.attempts,
    lessonProgress: spojny.lessons,
    cardStates: forge.cardStates,
    dayMode: state.dayMode,
    deadline: forge.courseDeadline,
    otherMinutes: totalLoad - loads[state.subject],
  });

  const others = useMemo(
    () =>
      SUBJECT_IDS.filter((id) => id !== state.subject).map((id) => ({
        id,
        label: SUBJECT_LABELS[id],
        glance: subjectGlance(
          {
            corpus: CORPORA[id],
            states: spojny.states,
            attempts: forge.attempts,
            lessonProgress: spojny.lessons,
            cardStates: forge.cardStates,
            dayMode: state.dayMode,
            deadline: forge.courseDeadline,
            otherMinutes: totalLoad - loads[id],
          },
          Date.now(),
        ),
      })),
    [state.subject, spojny.states, state.dayMode, forge.attempts, spojny.lessons, forge.cardStates, forge.courseDeadline, loads, totalLoad],
  );

  // --- Prototyp nauki: feed kart dla sześciu lekcji próbki -------------------
  const [feed, setFeed] = useState<{ skillId: string; tryb: Tryb } | null>(null);
  const otworzFeed = (skillId: string, tryb: Tryb) => {
    const cel = tryb === 'trening' && stanNauki
      ? wybierzTrening(stanNauki, LEKCJE.filter((l) => l.przedmiot === state.subject), Date.now())
      : null;
    if (tryb === 'trening' && !cel) {
      const next = course.ordered.find((s) => course.lessonOf.has(s.id) && !course.lessonsDone.has(s.id));
      if (next) forge.openLesson(next.id);
      else toCommandCenter();
      return;
    }
    setFeed({ skillId: cel?.skillId ?? skillId, tryb });
    goTo('nauka');
  };
  /** Sześć lekcji próbki otwiera feed; pozostałe — dotychczasowy widok lekcji. */
  const otworzLekcje = (skillId: string) => {
    const l = lekcjaNauki(skillId);
    if (!l || !stanNauki) {
      forge.openLesson(skillId);
      return;
    }
    const s = postepNauki(stanNauki, l).status;
    otworzFeed(skillId, s === 'nowa' || s === 'w trakcie' ? 'nauka' : 'trening');
  };
  const practice = (skill: Skill) => {
    if (lekcjaNauki(skill.id)) otworzLekcje(skill.id);
    else beginMission(practiceFor(skill));
  };

  if (state.screen === 'loading') {
    return <p className="boot">Wczytywanie profilu…</p>;
  }

  // --- Ekrany skupienia: bez nawigacji wokół (sek. 7.2) -----------------------

  if (state.screen === 'nauka' && feed && stanNauki) {
    const l = lekcjaNauki(feed.skillId);
    if (l) {
      return (
        <ErrorBoundary onHome={toCommandCenter}>
        <FeedView
          key={`${feed.skillId}-${feed.tryb}`}
          lekcja={l}
          tryb={feed.tryb}
          stan={stanNauki}
          zmien={zmienNauke}
          przedmiot={SUBJECT_LABELS[l.przedmiot]}
          onWyjdz={toCommandCenter}
          onWyklad={() => forge.openLesson(l.skillId)}
          onInna={otworzFeed}
          treningDostepny={Boolean(wybierzTrening(stanNauki, LEKCJE.filter((x) => x.przedmiot === l.przedmiot), Date.now()))}
          onNastepna={() => {
            const next = course.ordered.find((s) => course.lessonOf.has(s.id) && !course.lessonsDone.has(s.id));
            if (next) otworzLekcje(next.id);
            else toCommandCenter();
          }}
        />
        </ErrorBoundary>
      );
    }
  }

  if (state.screen === 'arena' && state.current && state.plan) {
    return (
      <Arena
        selection={state.current}
        step={state.step}
        total={state.plan.questionCount}
        feedback={state.feedback}
        onSubmit={(answer, hintLevel, confidence) => {
          void forge.submitAnswer(answer, hintLevel, confidence);
        }}
        onAdvance={() => {
          void forge.advance();
        }}
        deadlineAt={state.missionDeadline}
        onTimeUp={() => {
          void forge.finishMissionNow();
        }}
        running={state.running}
        ai={{
          tutor,
          enabled: aiEnabled,
          recentErrorIds: state.skillStates.get(state.current.skill.id)?.recentErrors ?? [],
          catalogue,
        }}
      />
    );
  }

  if (state.screen === 'summary') {
    return (
      <MissionSummary
        steps={state.steps}
        skills={skills}
        states={state.skillStates}
        missionsToday={state.missionsToday}
        // "Jeszcze jedna" wraca do planu dnia, a nie startuje misji
        // automatycznie - Blueprint sek. 3 i 14.
        onAgain={toCommandCenter}
        onFinish={toCommandCenter}
      />
    );
  }

  // --- Ekrany w powłoce ------------------------------------------------------

  const extras = [...state.options, timeTrial()].filter(
    (o, i, all) => all.findIndex((x) => x.title === o.title) === i,
  );

  let page: ReactNode;
  switch (state.screen) {
    case 'course':
      page = (
        <CourseView
          course={course}
          subjectName={corpus.subject.name}
          topics={topics}
          skills={skills}
          states={spojny.states}
          nauka={stanNauki}
          nextSkillId={(() => {
            const review = course.ordered.find((s) => {
              const l = lekcjaNauki(s.id);
              return l && stanNauki && powtorkaNaTeraz(stanNauki, l.skillId, Date.now());
            });
            const due = course.ordered.find((s) => {
              const l = lekcjaNauki(s.id);
              return l && stanNauki && postepNauki(stanNauki, l).status === 'w trakcie';
            });
            const fresh = course.ordered.find((s) => {
              const l = lekcjaNauki(s.id);
              return l && stanNauki && postepNauki(stanNauki, l).status === 'nowa';
            });
            return review?.id ?? due?.id ?? fresh?.id ?? course.next?.id ?? null;
          })()}
          onOpenLesson={otworzLekcje}
          onPractice={practice}
        />
      );
      break;

    case 'lesson': {
      const lesson = corpus.lessons.find((l) => l.skillId === forge.lessonSkillId);
      const skill = skills.find((s) => s.id === forge.lessonSkillId);
      page =
        lesson && skill ? (
          <LessonView
            lesson={lesson}
            skill={skill}
            topic={topics.find((t) => t.id === skill.topicId)}
            onPractice={() => {
              if (lekcjaNauki(skill.id)) otworzFeed(skill.id, 'nauka');
              else void forge.finishLesson(skill.id);
            }}
            onBack={() => (lekcjaNauki(skill.id) && feed?.skillId === skill.id ? goTo('nauka') : goTo('course'))}
          />
        ) : (
          <p className="page">Tej lekcji nie ma w wybranym przedmiocie.</p>
        );
      break;
    }

    case 'calendar':
      page = (
        <CalendarView
          course={course}
          skills={skills}
          deadline={forge.courseDeadline}
          examDate={forge.examDate}
          dayMode={state.dayMode}
          onDeadline={(k) => {
            void forge.setCourseDeadline(k);
          }}
          onExamDate={(k) => {
            void forge.setExamDate(k);
          }}
          onOpenLesson={otworzLekcje}
        />
      );
      break;

    case 'progress':
      page = (
        <ProgressView
          course={course}
          skills={skills}
          states={spojny.states}
          attempts={forge.attempts}
          onPractice={practice}
        />
      );
      break;

    case 'flashcards':
      page = (
        <FlashcardsView
          queue={course.cardSession.queue}
          dueCount={course.cardSession.dueCount}
          newCount={course.cardSession.newCount}
          cards={course.cards}
          states={forge.cardStates}
          skills={skills}
          unlockedSkillIds={course.unlocked}
          onRate={(card, rating) => {
            void forge.rateCard(card, rating);
          }}
          onDone={toCommandCenter}
          nextLessonName={course.next?.name ?? null}
        />
      );
      break;

    case 'mastery-map':
      page = (
        <MasteryMap
          skills={skills}
          topics={topics}
          states={spojny.states}
          // Kliknięcie w węzeł uruchamia trening, nie otwiera statystyk (sek. 7.3).
          onSelect={(skill) => lekcjaNauki(skill.id)
            ? otworzLekcje(skill.id)
            : beginMission(trainingFor(skill, state.skillStates.get(skill.id)?.level ?? 0))}
          onBack={toCommandCenter}
        />
      );
      break;

    case 'diagnostic-intro':
      page = (
        <DiagnosticIntro
          subjectName={SUBJECT_LABELS[state.subject]}
          probeCount={forge.diagnosticSize}
          hasPreviousPlan={state.savedPlan !== null}
          onStart={forge.startDiagnostic}
          onBack={toCommandCenter}
        />
      );
      break;

    case 'diagnostic-report':
      page = state.report ? (
        <DiagnosticReportView
          report={state.report}
          preview={forge.previewPlan}
          onChoose={(variant, deadline) => {
            void forge.choosePlan(variant, deadline);
          }}
          onBack={toCommandCenter}
        />
      ) : null;
      break;

    case 'ai-settings':
      page = <AiSettings tutor={tutor} onChange={setAiEnabled} onBack={toCommandCenter} />;
      break;

    case 'data':
      page = (
        <DataScreen
          storage={forge.storage}
          subjects={DATA_SUBJECTS}
          skills={ALL_SKILLS}
          questions={ALL_QUESTIONS}
          onChanged={forge.reloadProfile}
          onBack={toCommandCenter}
        />
      );
      break;

    case 'weekly-report':
      page = <WeeklyReportView report={state.weekly} rhythm={state.rhythm} onBack={toCommandCenter}
        feedProgress={LEKCJE.filter((l) => l.przedmiot === state.subject && (stanNauki?.lekcje[l.skillId]?.ukonczona ?? 0) >= Date.now() - 7 * 86_400_000)
          .map((l) => ({ skillId: l.skillId, name: l.tytul, status: postepNauki(stanNauki!, l).status }))} />;
      break;

    case 'exams':
      page = (
        <ExamsView
          exams={EXAMS[state.subject]}
          results={forge.examResults.filter((r) => r.subjectId === state.subject)}
          subjectId={state.subject}
          skills={skills}
          topics={topics}
          hasLesson={(id) => course.lessonOf.has(id)}
          onSave={forge.saveExam}
          onDelete={forge.deleteExam}
          onPractice={practice}
          onOpenLesson={otworzLekcje}
        />
      );
      break;

    case 'error-lab':
      page = (
        <ErrorLab
          groups={state.errorGroups}
          skills={skills}
          onRepair={(skill, cause) => beginMission(repairFor(skill, cause))}
          onBack={toCommandCenter}
        />
      );
      break;

    case 'command-center':
      page = (
        <DzisView
          przedmiot={state.subject}
          przedmiotNazwa={SUBJECT_LABELS[state.subject]}
          stan={stanNauki}
          onStart={otworzFeed}
          onWiecej={() => goTo('plan')}
          onKurs={() => goTo('course')}
          nextCourse={course.ordered.find((s) => !lekcjaNauki(s.id) && course.lessonOf.has(s.id) && !course.lessonsDone.has(s.id)) ?? null}
          onCourseLesson={forge.openLesson}
        />
      );
      break;

    default:
      page = (
        <TodayView
          course={course}
          topics={topics}
          recommended={state.recommended}
          options={extras}
          rhythm={state.rhythm}
          dayMode={state.dayMode}
          deadline={forge.courseDeadline}
          examDate={forge.examDate}
          comeback={state.daily.comeback}
          onDayMode={(mode) => {
            void forge.setDayMode(mode);
          }}
          onStartMission={beginMission}
          onOpenLesson={otworzLekcje}
          onPractice={practice}
          onOpenFlashcards={() => goTo('flashcards')}
          onOpenCalendar={() => goTo('calendar')}
          onOpenCourse={() => goTo('course')}
          others={others}
          onSwitchSubject={(id) => {
            void forge.setSubject(id);
          }}
          diagnostic={{
            hasReport: state.report !== null && state.savedPlan === null,
            onOpen: () =>
              goTo(state.report !== null && state.savedPlan === null ? 'diagnostic-report' : 'diagnostic-intro'),
          }}
        />
      );
  }

  const badges: Partial<Record<Screen, number>> = {
    flashcards: course.cardSession.queue.length,
    'error-lab': openErrorCount(state.errorGroups),
  };

  const statTabs: { screen: Screen; label: string }[] = [
    { screen: 'plan', label: 'Plan' },
    { screen: 'progress', label: 'Postęp' },
    { screen: 'mastery-map', label: 'Mapa' },
    { screen: 'weekly-report', label: 'Raport' },
    { screen: 'error-lab', label: 'Błędy' },
  ];
  const inStats = statTabs.some((t) => t.screen === state.screen);

  return (
    <Shell
      screen={state.screen}
      subject={state.subject}
      onSubject={(next) => {
        void forge.setSubject(next);
      }}
      onNavigate={goTo}
      badges={badges}
    >
      <ErrorBoundary key={state.screen} onHome={toCommandCenter}>
        {inStats && <nav className="tabs" aria-label="Zakładki statystyk">
          {statTabs.map((t) => <button key={t.screen} type="button" className={state.screen === t.screen ? 'tabs__item tabs__item--on' : 'tabs__item'} aria-current={state.screen === t.screen ? 'page' : undefined} onClick={() => goTo(t.screen)}>{t.label}</button>)}
        </nav>}
        {page}
      </ErrorBoundary>
    </Shell>
  );
}
