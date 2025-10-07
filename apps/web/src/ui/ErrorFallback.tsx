import type { ErrorComponentProps } from '@tanstack/react-router';
import type { FallbackProps } from 'react-error-boundary';
import { Button } from './button';

interface ErrorScreenProps {
  error: unknown;
  onRetry?: () => void;
}

const formatMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred.';
};

const ErrorScreen = ({ error, onRetry }: ErrorScreenProps) => {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-white p-6 text-sm text-muted-foreground shadow-sm">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">Something went wrong</h2>
        <p className="text-sm text-destructive">{formatMessage(error)}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        {onRetry ? (
          <Button
            onClick={() => {
              onRetry();
            }}
          >
            Try again
          </Button>
        ) : null}
        <Button
          variant="secondary"
          onClick={() => {
            window.location.reload();
          }}
        >
          Reload page
        </Button>
      </div>
    </div>
  );
};

export const ErrorBoundaryFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  return <ErrorScreen error={error} onRetry={resetErrorBoundary} />;
};

export const RouteErrorComponent = ({ error, reset }: ErrorComponentProps) => {
  return <ErrorScreen error={error} onRetry={reset} />;
};
