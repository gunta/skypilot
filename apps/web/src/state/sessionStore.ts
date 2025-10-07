import { createStore } from '@xstate/store';

export interface SessionState {
  locale: string;
  currency: string;
}

export const sessionStore = createStore({
  locale: 'en',
  currency: 'USD'
});

export const setLocale = (locale: string) => {
  sessionStore.setState((prev) => ({
    ...prev,
    locale
  }));
};

export const setCurrency = (currency: string) => {
  sessionStore.setState((prev) => ({
    ...prev,
    currency
  }));
};
