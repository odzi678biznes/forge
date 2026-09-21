import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/design-system/tokens.css';
import './app.css';
import { App } from './App';

const root = document.getElementById('root');
if (!root) throw new Error('Brak elementu #root w dokumencie.');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
