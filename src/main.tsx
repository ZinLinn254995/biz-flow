import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { PWAUpdatePrompt } from './pwa/PWAUpdatePrompt.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <PWAUpdatePrompt />
  </StrictMode>
);
