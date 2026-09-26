import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/design-system/tokens.css';
import './app.css';
import { App } from './App';
import { registerServiceWorker } from '@/platform/pwa';
import { installBackNavigation } from '@/platform/back-navigation';
import '@/design-system/demo-ui.css';

const root = document.getElementById('root');
if (!root) throw new Error('Brak elementu #root w dokumencie.');

installBackNavigation();
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Praca offline w wersji na telefon; w aplikacji desktopowej nic nie robi.
registerServiceWorker();
