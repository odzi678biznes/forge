import { useEffect, useRef } from 'react';

const handlers: { priority: number; back: () => void }[] = [];
let installed = false;

/** Keep native Back inside the app; React owns the screen/card navigation stack. */
export function installBackNavigation(): void {
  if (installed) return;
  installed = true;
  // One browser entry is enough: re-arm it before processing the next UI step.
  // No route, credentials, answers or progress are written to browser history.
  if (history.state?.forgeBack !== 'armed') {
    history.replaceState({ ...history.state, forgeBack: 'root' }, '');
    history.pushState({ forgeBack: 'armed' }, '');
  }
  window.addEventListener('popstate', () => {
    history.pushState({ forgeBack: 'armed' }, '');
    const handler = [...handlers].reverse().sort((a, b) => b.priority - a.priority)[0];
    handler?.back();
  });
}

/** Most specific surface wins: modal > lesson card > app screen. */
export function useNativeBack(back: () => void, priority: number): void {
  const callback = useRef(back);
  callback.current = back;
  useEffect(() => {
    const handler = { priority, back: () => callback.current() };
    handlers.push(handler);
    return () => { const index = handlers.indexOf(handler); if (index >= 0) handlers.splice(index, 1); };
  }, [priority]);
}
