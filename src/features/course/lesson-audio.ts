import type { Lesson, LessonBlock } from '@/data/types';
import { promptToSpeech } from '@/learning-engine/speech';

export interface LessonAudioPart {
  label: string;
  text: string;
  start: number;
}

/** Fragmenty krótsze niż limit pojedynczego nagrania; żadne słowo nie znika. */
export function naturalAudioParts(parts: LessonAudioPart[]): LessonAudioPart[] {
  return parts.flatMap((part) => {
    const chunks: LessonAudioPart[] = [];
    let offset = 0;
    while (offset < part.text.length) {
      const remaining = part.text.slice(offset);
      let end = Math.min(1800, remaining.length);
      if (remaining.length > 1800) {
        const space = remaining.slice(0, 1800).lastIndexOf(' ');
        if (space > 0) end = space;
      }
      const text = remaining.slice(0, end).trim();
      if (text) chunks.push({ label: part.label, text, start: part.start + offset });
      offset += end;
      while (/\s/.test(part.text[offset] ?? '') && offset < part.text.length) offset++;
    }
    return chunks.length > 1 ? chunks.map((chunk, i) => ({ ...chunk, label: `${chunk.label} · część ${i + 1}` })) : chunks;
  });
}

function blockText(block: LessonBlock): string {
  switch (block.kind) {
    case 'formula': return `${block.caption ? `${block.caption}. ` : ''}$${block.tex}$.`;
    case 'figure': return block.figure.alt;
    case 'code': return `Przykład kodu${block.caption ? `: ${block.caption}` : ''}.`;
    case 'tip': return `Zapamiętaj. ${block.body}`;
    case 'warning': return `Uwaga. ${block.body}`;
    case 'text': return block.body;
  }
}

/** Zdania skrótu pochodzą z lekcji. Wzory i fragmenty kodu pozostają w całości. */
export function firstLessonSentence(text: string): string {
  let marker: '$' | '`' | null = null;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if ((char === '$' || char === '`') && text[i - 1] !== '\\') {
      if (marker === char) marker = null;
      else if (!marker) marker = char;
    }
    if (!marker && /[.!?]/.test(char ?? '') && (i === text.length - 1 || /\s/.test(text[i + 1] ?? ''))) {
      if (/\b(?:np|m\.in|tj|tzn|itp|itd|dr|nr)\.$/i.test(text.slice(0, i + 1))) continue;
      return text.slice(0, i + 1).trim();
    }
  }
  const trimmed = text.trim();
  return trimmed && !/[.!?]$/.test(trimmed) ? `${trimmed}.` : trimmed;
}

export function lessonDigest(lesson: Lesson): string[] {
  const text = lesson.blocks.find((b) => b.kind === 'text' || (b.kind === 'code' && b.caption));
  const tip = lesson.blocks.find((b) => b.kind === 'tip');
  const formula = lesson.blocks.find((b) => b.kind === 'formula');
  const warning = lesson.blocks.find((b) => b.kind === 'warning');
  const core = text?.kind === 'text' ? text.body : text?.kind === 'code' ? text.caption : undefined;
  const candidates = [
    core ?? lesson.idea?.[0] ?? lesson.intro,
    tip?.body,
    formula?.kind === 'formula' ? `${formula.caption ? `${formula.caption}: ` : 'Wzór: '}$${formula.tex}$.` : undefined,
    warning?.body ?? lesson.pitfalls[0],
  ];
  const digest = [...new Set(candidates.filter((value): value is string => Boolean(value)).map(firstLessonSentence))];
  for (const method of lesson.method ?? []) {
    if (digest.length >= 3) break;
    const sentence = firstLessonSentence(method);
    if (!digest.includes(sentence)) digest.push(sentence);
  }
  return digest.slice(0, 4);
}

export function lessonAudio(lesson: Lesson, digest?: string[]): { text: string; parts: LessonAudioPart[] } {
  const raw = digest
    ? digest.map((text, i) => ({ label: `Przypomnienie ${i + 1}`, text }))
    : [
      { label: 'Wprowadzenie', text: lesson.intro },
      ...(lesson.idea ?? []).map((text, i) => ({ label: `Skąd to się bierze · ${i + 1}`, text })),
      ...lesson.blocks.map((block, i) => ({
        label: block.kind === 'tip' ? `Zapamiętaj · ${i + 1}` : block.kind === 'warning' ? `Uwaga · ${i + 1}` : `Wzory i zasady · ${i + 1}`,
        text: blockText(block),
      })),
      ...(lesson.method ?? []).map((text, i) => ({ label: `Jak to zrobić · krok ${i + 1}`, text: `Krok ${i + 1}. ${text}` })),
      ...lesson.pitfalls.map((text, i) => ({ label: `Pułapka ${i + 1}`, text: `Uwaga. ${text}` })),
    ];
  const parts: LessonAudioPart[] = [];
  let text = '';
  for (const part of raw) {
    const spoken = promptToSpeech(part.text);
    if (!spoken) continue;
    if (text) text += ' ';
    parts.push({ label: part.label, text: spoken, start: text.length });
    text += spoken;
  }
  return { text, parts };
}
