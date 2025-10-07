import { useEffect, useState, type PropsWithChildren, type ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { initializeI18n } from '../lib/i18n';
import { SoraManagerProvider } from './SoraManagerProvider';

export interface AppProvidersProps extends PropsWithChildren {
  queryClient: QueryClient;
}

export const AppProviders = ({ children, queryClient }: AppProvidersProps): ReactElement => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    initializeI18n()
      .catch(() => {
        // keep the shell responsive even if translations fail to load
      })
      .finally(() => {
        if (mounted) {
          setIsReady(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SoraManagerProvider>
        {isReady ? (
          <>
            {children}
            <ReactQueryDevtools buttonPosition="bottom-left" />
          </>
        ) : (
          <div className="rounded-md border border-dashed border-muted-foreground/40 bg-muted/40 p-6 text-sm text-muted-foreground" role="status" aria-live="polite">
            Loading SkyPilot…
          </div>
        )}
      </SoraManagerProvider>
    </QueryClientProvider>
  );
};
