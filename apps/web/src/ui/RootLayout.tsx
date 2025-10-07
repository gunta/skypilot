import { Link, Outlet } from '@tanstack/react-router';
import { cn } from '../lib/utils';

export const RootLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">SkyPilot Console (Web)</h1>
            <p className="text-sm text-muted-foreground">
              Experimental React + TanStack Router + XState interface powered by the existing SkyPilot toolchain.
            </p>
          </div>
          <nav className="flex items-center gap-3 text-sm text-muted-foreground">
            <Link
              to="/"
              className={({ isActive }) =>
                cn('rounded-md px-3 py-1 transition-colors hover:text-foreground', isActive && 'bg-secondary text-foreground')
              }
            >
              Home
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 px-6 py-10">
        <div className="w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
