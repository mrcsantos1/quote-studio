import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/App';
import { quoteStore } from '@/store/quoteStore';
import { attachDocPersistence, attachUiPersistence } from '@/store/persist';
import '@/styles/global.css';
import '@/styles/app.css';

// Persistência (PERS-1/2/3): hidrata UI e conteúdo do localStorage e passa a salvar mudanças.
attachUiPersistence(quoteStore);
attachDocPersistence(quoteStore);

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('#root não encontrado em index.html');

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
