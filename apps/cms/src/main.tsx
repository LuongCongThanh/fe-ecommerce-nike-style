import { createRouter, RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './app.css';
import { routeTree } from './routeTree.gen';

// '/cms' — must match vite.config.ts's `base` and the storefront's microfrontends.json proxy path.
const router = createRouter({ routeTree, basepath: '/cms' });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById('root');
if (rootElement === null) {
  throw new Error('#root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
