import type { AiContext } from '@/learning-engine/ai-context';
import { isTauri } from '@/data/create-storage';

/**
 * Port opcjonalnej warstwy AI — Blueprint sek. 11 i 15, Etap 6.
 *
 * Implementacja desktopowa woła komendy Rusta. Klucz API nigdy nie
 * przechodzi przez tę warstwę z powrotem: TypeScript może go ustawić lub
 * usunąć i zapytać, czy jest — ale nie może go odczytać.
 *
 * W zwykłej przeglądarce (np. `npm run dev`) AI jest niedostępne z nazwaną
 * przyczyną. To świadome: wywołanie z przeglądarki wymagałoby trzymania
 * klucza w JavaScripcie i otwarcia CSP na zewnętrzny host.
 */
export interface AiTutor {
  /** null = dostępne; tekst = dlaczego nie. */
  readonly unavailableReason: string | null;
  keyPresent(): Promise<boolean>;
  setKey(key: string): Promise<void>;
  clearKey(): Promise<void>;
  /** Zwraca surowy JSON - wywołujący waliduje go własnym parserem. */
  request(context: AiContext): Promise<unknown>;
}

interface KeyStatus {
  present: boolean;
}

class DesktopTutor implements AiTutor {
  readonly unavailableReason = null;

  private async call<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
    const { invoke } = await import('@tauri-apps/api/core');
    try {
      return await invoke<T>(cmd, args);
    } catch (err) {
      // Komendy Rusta zwracają gotowe komunikaty po polsku.
      throw new Error(typeof err === 'string' ? err : 'Warstwa AI nie odpowiedziała.');
    }
  }

  async keyPresent(): Promise<boolean> {
    return (await this.call<KeyStatus>('ai_key_status')).present;
  }

  async setKey(key: string): Promise<void> {
    await this.call<KeyStatus>('ai_set_key', { key });
  }

  async clearKey(): Promise<void> {
    await this.call<KeyStatus>('ai_clear_key');
  }

  async request(context: AiContext): Promise<unknown> {
    return this.call<unknown>('ai_tutor', { context });
  }
}

class UnavailableTutor implements AiTutor {
  readonly unavailableReason =
    'AI działa tylko w aplikacji desktopowej — tam klucz zostaje w procesie aplikacji, poza przeglądarką.';

  async keyPresent(): Promise<boolean> {
    return false;
  }
  async setKey(): Promise<void> {
    throw new Error(this.unavailableReason);
  }
  async clearKey(): Promise<void> {
    /* nic do usunięcia */
  }
  async request(): Promise<unknown> {
    throw new Error(this.unavailableReason);
  }
}

export function createTutor(): AiTutor {
  return isTauri() ? new DesktopTutor() : new UnavailableTutor();
}
