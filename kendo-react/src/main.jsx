import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

window.__RENDER_METRICS_ENABLED__ = true;

createRoot(document.getElementById('root')).render(
  <App />
);
