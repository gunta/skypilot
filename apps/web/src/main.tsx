import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProviders } from './providers/AppProviders.js';
import { RouterProvider } from '@tanstack/react-router';
import { router } from './router.js';
import './styles/reset.css';
import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false
    }
  }
});

router.update({
  context: {
    queryClient
  }
});

const container = document.getElementById('root') as HTMLElement | null;

if (container === null) {
  throw new Error('Root container #root not found.');
}

ReactDOM.createRoot(container).render(
  <React.StrictMode>
    <AppProviders queryClient={queryClient}>
      <RouterProvider router={router} />
    </AppProviders>
  </React.StrictMode>,
);
