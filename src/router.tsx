import type { ComponentType } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from './components/layout/RootLayout';
import Home from './pages/Home';
import RouteError from './pages/RouteError';

/** Pages beyond the homepage are code-split; React Router loads them before the view transition starts. */
const page = (load: () => Promise<{ default: ComponentType }>) => async () => ({ Component: (await load()).default });

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteError />,
    HydrateFallback: () => null,
    children: [
      { index: true, element: <Home /> },
      { path: 'discover', lazy: page(() => import('./pages/Discover')) },
      { path: 'film/:id', lazy: page(() => import('./pages/Film')) },
      { path: 'mood', lazy: page(() => import('./pages/Mood')) },
      { path: 'collections', lazy: page(() => import('./pages/Collections')) },
      { path: 'collections/:slug', lazy: page(() => import('./pages/Collection')) },
      { path: 'watchlist', lazy: page(() => import('./pages/Watchlist')) },
      { path: '*', lazy: page(() => import('./pages/NotFound')) },
    ],
  },
]);
