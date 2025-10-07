import { Stack, Heading, Text, Button } from '@canva/app-ui-kit';
import { useQuery } from '@tanstack/react-query';
import { useMachine } from '@xstate/react';
import { loaderMachine } from '../state/loaderMachine.js';
import { createBrowserDatabase } from '../lib/database/client.js';
import { ensureMediaRuntime } from '../lib/mediabunny/runtime.js';

export const HomeRoute = (): JSX.Element => {
  const [state, send] = useMachine(loaderMachine);
  const dbQuery = useQuery({
    queryKey: ['browser-db'],
    queryFn: async () => {
      const client = await createBrowserDatabase();
      return client.describe();
    }
  });

  return (
    <Stack space="4">
      <div className="card">
        <Stack space="3">
          <Heading size="2">Welcome to SkyPilot Web</Heading>
          <Text>
            This interface mirrors the CLI/TUI workflows with a browser-first experience. It shares the libSQL store, uses TanStack Query for data orchestration, and leans on XState for complex flows.
          </Text>
          <Stack direction="horizontal" space="2">
            <Button
              onClick={() => {
                send({ type: 'INITIALIZE' });
                void ensureMediaRuntime();
              }}
            >
              Initialize Media Runtime
            </Button>
            <Button
              onClick={() => {
                void dbQuery.refetch();
              }}
            >
              {dbQuery.isFetching ? 'Inspecting…' : 'Inspect Local Database'}
            </Button>
          </Stack>
        </Stack>
      </div>

      <div className="card">
        <Stack space="2">
          <Heading size="1">Runtime status</Heading>
          <Text>
            Loader state: <strong>{state.value}</strong>
          </Text>
          {dbQuery.data ? (
            <Text>
              Database: <code>{dbQuery.data}</code>
            </Text>
          ) : null}
          {dbQuery.error instanceof Error ? <Text tone="critical">{dbQuery.error.message}</Text> : null}
        </Stack>
      </div>
    </Stack>
  );
};
