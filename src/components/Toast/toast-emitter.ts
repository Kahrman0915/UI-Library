import type { ToastRecord } from './Toast.types';

export type ToastAction =
  | { type: 'ADD'; toast: ToastRecord }
  | { type: 'DISMISS'; id?: string }
  | { type: 'UPDATE'; id: string; patch: Partial<ToastRecord> };

type Subscriber = (action: ToastAction) => void;

const subscribers = new Set<Subscriber>();

let counter = 0;
export const nextId = () => `ui-toast-${++counter}`;

export const emit = (action: ToastAction) => {
  subscribers.forEach((fn) => fn(action));
};

export const subscribe = (fn: Subscriber) => {
  subscribers.add(fn);
  return () => {
    subscribers.delete(fn);
  };
};
