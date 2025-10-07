import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import type { QueryClient } from '@tanstack/react-query';
import { QueryClient as QueryClientCtor } from '@tanstack/react-query';
import { AppProviders } from './AppProviders';
import { useSoraManager } from './SoraManagerProvider';

vi.mock('../lib/i18n', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('../lib/i18n');
  return {
    ...actual,
    initializeI18n: vi.fn().mockResolvedValue('en')
  };
});

let initializeI18n: Mock;

const TestConsumer = () => {
  const manager = useSoraManager();
  return <div data-testid="manager">{manager ? 'ready' : 'missing'}</div>;
};

describe('AppProviders', () => {
  let queryClient: QueryClient;

  beforeEach(async () => {
    queryClient = new QueryClientCtor();
    vi.clearAllMocks();

    const module = await import('../lib/i18n');
    initializeI18n = module.initializeI18n as unknown as Mock;
    initializeI18n.mockResolvedValue('en');
  });

  it('renders a bootstrap indicator until translations finish loading', () => {
    initializeI18n.mockReturnValue(new Promise(() => {}));

    render(
      <AppProviders queryClient={queryClient}>
        <div>child</div>
      </AppProviders>
    );

    expect(screen.getByText(/loading skypilot/i)).toBeInTheDocument();
  });

  it('renders children and provides the Sora manager once ready', async () => {
    render(
      <AppProviders queryClient={queryClient}>
        <TestConsumer />
      </AppProviders>
    );

    await waitFor(() => expect(initializeI18n).toHaveBeenCalledTimes(1));
    expect(await screen.findByTestId('manager')).toHaveTextContent('ready');
  });
});
