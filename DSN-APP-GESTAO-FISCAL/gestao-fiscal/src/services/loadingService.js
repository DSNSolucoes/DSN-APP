let pending = 0;
const listeners = new Set();

function notify() {
  for (const fn of listeners) fn(pending);
}

export const loadingService = {
  inc() {
    pending += 1;
    notify();
  },
  dec() {
    pending = Math.max(0, pending - 1);
    notify();
  },
  subscribe(fn) {
    listeners.add(fn);
    fn(pending); // estado inicial
    return () => listeners.delete(fn);
  },
};