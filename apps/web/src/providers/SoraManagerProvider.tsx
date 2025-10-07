import { createContext, useContext, useMemo, type PropsWithChildren } from 'react';

export interface SoraManagerController {
  refresh(): Promise<void>;
  getSnapshot(): Record<string, unknown>;
}

const createPlaceholderController = (): SoraManagerController => {
  const snapshot: Record<string, unknown> = {
    ready: false
  };

  return {
    async refresh() {
      snapshot.ready = true;
    },
    getSnapshot() {
      return snapshot;
    }
  };
};

const SoraManagerContext = createContext<SoraManagerController | null>(null);

export const SoraManagerProvider = ({ children }: PropsWithChildren) => {
  const manager = useMemo(() => createPlaceholderController(), []);

  return <SoraManagerContext.Provider value={manager}>{children}</SoraManagerContext.Provider>;
};

export const useSoraManager = (): SoraManagerController => {
  const manager = useContext(SoraManagerContext);
  if (!manager) {
    throw new Error('useSoraManager must be used within a SoraManagerProvider');
  }
  return manager;
};
