let initialized = false;

export const ensureMediaRuntime = async (): Promise<void> => {
  if (initialized) {
    return;
  }

  try {
    const module = await import('mediabunny');
    const bootstrap = (module as { bootstrap?: () => Promise<void> | void }).bootstrap;
    if (typeof bootstrap === 'function') {
      await bootstrap();
    }
    initialized = true;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Mediabunny runtime bootstrap skipped:', error);
    }
  }
};
