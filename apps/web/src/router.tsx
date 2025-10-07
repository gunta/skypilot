import { createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import type { RouterContext } from './routerContext';

export const router = createRouter({
  routeTree,
  context: {
    queryClient: null as unknown as RouterContext['queryClient']
  }
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
