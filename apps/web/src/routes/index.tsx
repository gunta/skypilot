import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useMachine } from '@xstate/react';
import { Rnd } from 'react-rnd';
import { loaderMachine } from '../state/loaderMachine';
import { createBrowserDatabase } from '../lib/database/client';
import { ensureMediaRuntime } from '../lib/mediabunny/runtime';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

const HomeRoute = () => {
  const [state, send] = useMachine(loaderMachine);
  const dbQuery = useQuery({
    queryKey: ['browser-db'],
    queryFn: async () => {
      const client = await createBrowserDatabase();
      return client.describe();
    }
  });

  return (
    <div className="space-y-6">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Welcome to SkyPilot Web</CardTitle>
          <CardDescription>
            This interface mirrors the CLI/TUI workflows with a browser-first experience. It shares the libSQL store, uses TanStack
            Query for data orchestration, and leans on XState for complex flows.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            onClick={() => {
              send({ type: 'INITIALIZE' });
              void ensureMediaRuntime();
            }}
          >
            Initialize Media Runtime
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              void dbQuery.refetch();
            }}
          >
            {dbQuery.isFetching ? 'Inspecting…' : 'Inspect Local Database'}
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Runtime status</CardTitle>
            <CardDescription>Observe the current loader state and browser database connection.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div>
              Loader state: <span className="font-medium text-foreground">{String(state.value)}</span>
            </div>
            <div>
              Database: <code className="rounded bg-muted px-2 py-0.5 text-xs text-foreground">{dbQuery.data ?? 'Not connected'}</code>
            </div>
            {dbQuery.error instanceof Error ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-destructive">
                {dbQuery.error.message}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Resizable preview</CardTitle>
            <CardDescription>
              Experiment with layout spacing using <code className="rounded bg-muted px-1.5 py-0.5 text-xs">react-rnd</code>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative h-[320px] w-full overflow-hidden rounded-lg border border-dashed border-border/70 bg-muted/40">
              <Rnd
                default={{ x: 16, y: 16, width: 260, height: 160 }}
                bounds="parent"
                minWidth={200}
                minHeight={140}
                className="group flex h-full flex-col justify-between rounded-md border border-border/60 bg-white/90 p-4 text-sm shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="space-y-1">
                  <p className="text-xs uppercase text-muted-foreground tracking-wide">Loader status</p>
                  <p className="text-base font-semibold text-foreground">{String(state.value)}</p>
                </div>
                <div className="text-xs text-muted-foreground">
                  Drag the panel to explore flexible layouts. Width × Height updates automatically via the underlying component.
                </div>
              </Rnd>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export const Route = createFileRoute('/')({
  component: HomeRoute
});
