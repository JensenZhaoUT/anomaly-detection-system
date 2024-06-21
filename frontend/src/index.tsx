import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

// Find the root element
const container = document.getElementById('root');
if (container) {
  // Create a root
  const root = createRoot(container);

  // Initial render
  root.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
