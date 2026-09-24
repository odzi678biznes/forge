import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { SUBJECT_LABELS, useForge, type Screen } from './useForge';
import { useCourse } from './useCourse';
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
import type { ExamSheet } from '@content/exams/types';
import type { Skill } from '@/data/types';
import { MATH_CORPUS } from '@content/math/index';
import { CS_CORPUS } from '@content/cs/index';

/** Ekran danych działa na obu przedmiotach naraz, niezależnie od wybranego. */
const DATA_SUBJECTS: SubjectInfo[] = [
  { id: 'math', label: SUBJECT_LABELS.math, skillIds: MATH_CORPUS.skills.map((s) => s.id) },
  { id: 'cs', label: SUBJECT_LABELS.cs, skillIds: CS_CORPUS.skills.map((s) => s.id) },
];
/** Katalog oficjalnych arkuszy CKE według przedmiotu. */
const EXAMS: Record<'math' | 'cs', ExamSheet[]> = { math: MATH_EXAMS, cs: [] };

const ALL_SKILLS = [...MATH_CORPUS.skills, ...CS_CORPUS.skills];
const ALL_QUESTIONS = [...MATH_CORPUS.questions, ...CS_CORPUS.questions];

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

  const course = useCourse({
    corpus,
    states: state.skillStates,
    attempts: forge.attempts,
    lessonProgress: forge.lessonProgress,
    cardStates: forge.cardStates,
    dayMode: state.dayMode,
    deadline: forge.courseDeadline,
  });

  const practice = (skill: Skill) => beginMission(practiceFor(skill));

  if (state.screen === 'loading') {
    return <p className="boot">Wczytywanie profilu…</p>;
  }

  // --- Ekrany skupienia: bez nawigacji wokół (sek. 7.2) -----------------------

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
          states={state.skillStates}
          onOpenLesson={forge.openLesson}
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
              void forge.finishLesson(skill.id);
            }}
            onBack={() => goTo('course')}
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
          onOpenLesson={forge.openLesson}
        />
      );
      break;

    case 'progress':
      page = (
        <ProgressView
          course={course}
          skills={skills}
          states={state.skillStates}
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
        />
      );
      break;

    case 'mastery-map':
      page = (
        <MasteryMap
          skills={skills}
          states={state.skillStates}
          // Kliknięcie w węzeł uruchamia trening, nie otwiera statystyk (sek. 7.3).
          onSelect={(skill) =>
            beginMission(trainingFor(skill, state.skillStates.get(skill.id)?.level ?? 0))
          }
          onBack={toCommandCenter}
        />
      );
      break;

    case 'diagnostic-intro':
      page = (
        <DiagnosticIntro
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
      page = <WeeklyReportView report={state.weekly} rhythm={state.rhythm} onBack={toCommandCenter} />;
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
          onOpenLesson={forge.openLesson}
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
          onOpenLesson={forge.openLesson}
          onPractice={practice}
          onOpenFlashcards={() => goTo('flashcards')}
          onOpenCalendar={() => goTo('calendar')}
          onOpenCourse={() => goTo('course')}
          diagnostic={
            state.subject === 'math'
              ? {
                  hasReport: state.report !== null && state.savedPlan === null,
                  onOpen: () =>
                    goTo(state.report !== null && state.savedPlan === null ? 'diagnostic-report' : 'diagnostic-intro'),
                }
              : null
          }
        />
      );
  }

  const badges: Partial<Record<Screen, number>> = {
    flashcards: course.cardSession.queue.length,
    'error-lab': openErrorCount(state.errorGroups),
  };

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
        {page}
      </ErrorBoundary>
    </Shell>
  );
}
