import { createRootRouteWithContext } from '@tanstack/react-router';
import type { RouterContext } from '../routerContext';
import { RootLayout } from '../ui/RootLayout';
import { RouteErrorComponent } from '../ui/ErrorFallback';

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  errorComponent: RouteErrorComponent
});
