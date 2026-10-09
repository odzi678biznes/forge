import { MATH_CORPUS } from '../../../content/math/index';
import { knowledgeTree, retention } from './knowledge';
import type { StudentModel } from './types';

export function KnowledgeMap({ student, focus, onFocus }: { student: StudentModel; focus: string | null; onFocus: (id: string) => void }) {
  const now = Date.now(), tree = knowledgeTree(MATH_CORPUS.topics, MATH_CORPUS.skills.filter(s => !s.extra), student, now);
  return <section className="tutor-map" aria-label="Mapa wiedzy">
    <h2>Mapa wiedzy</h2><p className="tutor-muted">Matematyka · podstawy i rozszerzenie</p>
    {tree.map(topic => <details key={topic.id} open={topic.skills.some(s => s.id === focus)}>
      <summary>{topic.name}<small>{topic.skills.filter(s => s.status === 'Rozumiem' || s.status === 'Opanowane').length}/{topic.skills.length}</small></summary>
      {topic.skills.map(s => <button className={focus === s.id ? 'tutor-map__skill tutor-map__skill--active' : 'tutor-map__skill'} key={s.id} onClick={() => onFocus(s.id)}>
        <span>{s.name}</span><small>{s.status}</small>
        {s.evidence && <small>Pewność oceny: {Math.round(s.evidence.confidence * 100)}% · pamiętanie: ~{Math.round(retention(s.evidence, now) * 100)}%</small>}
        {s.prerequisites.length > 0 && <small>Podstawy: {s.prerequisites.map(id => MATH_CORPUS.skills.find(s => s.id === id)?.name ?? id).join(', ')}</small>}
      </button>)}
    </details>)}
    <small>Przewidywane pamiętanie to orientacyjna heurystyka powtórek.</small>
  </section>;
}
