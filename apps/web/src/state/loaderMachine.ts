import { createMachine } from 'xstate';

export const loaderMachine = createMachine({
  id: 'web-loader',
  context: {},
  initial: 'idle',
  states: {
    idle: {
      on: {
        INITIALIZE: 'preparing'
      }
    },
    preparing: {
      after: {
        400: { target: 'ready' }
      }
    },
    ready: {
      type: 'final'
    }
  }
});
