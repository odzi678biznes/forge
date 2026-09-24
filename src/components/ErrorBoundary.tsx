import { Component, type ErrorInfo, type ReactNode } from 'react';

/**
 * Błąd w jednym ekranie nie może zgasić całej aplikacji.
 *
 * Bez tej granicy wyjątek w renderowaniu zostawia pustą stronę - uczeń nie
 * wie, czy stracił dane. Dane są w bazie i nic im się nie dzieje, więc
 * mówimy to wprost i dajemy drogę powrotu. Granica jest resetowana kluczem
 * (zmiana ekranu = nowa próba).
 */

interface Props {
  children: ReactNode;
  onHome: () => void;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Błąd ekranu:', error, info.componentStack);
  }

  override render(): ReactNode {
    if (!this.state.error) return this.props.children;
    return (
      <main className="page">
        <header>
          <p className="page__eyebrow">Coś poszło nie tak</p>
          <h1 className="page__title">Ten ekran się nie otworzył</h1>
          <p className="page__lead">
            Twoje dane są bezpieczne — zapisują się na bieżąco i ten błąd ich nie dotyczy. Wróć do planu dnia
            i spróbuj ponownie.
          </p>
        </header>
        <div>
          <button type="button" className="btn btn--primary" onClick={this.props.onHome}>
            Wróć do „Dziś”
          </button>
        </div>
        <details>
          <summary>Szczegóły techniczne</summary>
          <pre className="error-boundary__detail">{this.state.error.message}</pre>
        </details>
      </main>
    );
  }
}
