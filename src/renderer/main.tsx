// File: src/renderer/main.tsx
// Responsibility: Renderer entrypoint that mounts the React application.
// Security: Runs in the isolated renderer with no direct Node.js access.

import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './styles/rtl.css';

const container = document.getElementById('root');

if (container === null) {
  throw new Error('Renderer root element was not found.');
}

ReactDOM.createRoot(container).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
