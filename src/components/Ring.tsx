/**
 * Pierścień postępu. Wartość jest zawsze podpisana liczbą obok - sam kolor
 * i długość łuku nie mogą być jedynym nośnikiem informacji (dostępność).
 */

interface Props {
  /** 0..1 */
  value: number;
  size?: number;
  stroke?: number;
  label: string;
  /** Tekst w środku; domyślnie procent. */
  center?: string;
  tone?: 'progress' | 'challenge';
}

export function Ring({ value, size = 96, stroke = 8, label, center, tone = 'progress' }: Props) {
  const clamped = Math.max(0, Math.min(1, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <figure className="ring" style={{ width: size }} aria-label={`${label}: ${Math.round(clamped * 100)}%`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--line)"
          strokeWidth={stroke}
        />
        <circle
          className="ring__arc"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={tone === 'progress' ? 'var(--progress)' : 'var(--challenge)'}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - clamped)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="central"
          textAnchor="middle"
          className="ring__value"
          fill="var(--text)"
        >
          {center ?? `${Math.round(clamped * 100)}%`}
        </text>
      </svg>
      <figcaption className="ring__label">{label}</figcaption>
    </figure>
  );
}
