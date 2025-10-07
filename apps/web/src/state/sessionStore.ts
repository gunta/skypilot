export interface SessionState {
  locale: string;
  currency: string;
}

type Subscriber = (state: SessionState) => void;

let state: SessionState = {
  locale: 'en',
  currency: 'USD'
};

const subscribers = new Set<Subscriber>();

const notify = () => {
  for (const subscriber of subscribers) {
    subscriber(state);
  }
};

export const getSessionState = (): SessionState => state;

export const subscribeToSession = (subscriber: Subscriber) => {
  subscribers.add(subscriber);
  subscriber(state);
  return () => {
    subscribers.delete(subscriber);
  };
};

export const setLocale = (locale: string) => {
  state = {
    ...state,
    locale
  };
  notify();
};

export const setCurrency = (currency: string) => {
  state = {
    ...state,
    currency
  };
  notify();
};
