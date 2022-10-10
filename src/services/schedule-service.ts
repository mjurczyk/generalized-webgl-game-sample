import { Listener } from '../common/types';

class ScheduleServiceClass {
  listeners: Array<Listener<{ currentFrame: number }, void>> = [];
  intervals: Array<number> = [];

  onFrame(currentFrame: number) {
    this.listeners.forEach((listener) => listener({ currentFrame }));
  }

  registerFrameListener(listener: Listener<{ currentFrame: number }, void>) {
    this.listeners.push(listener);
  }

  registerInterval(listener: Listener<void, void>, timeout: number) {
    const interval = setInterval(listener, timeout);

    this.intervals.push(interval);
  }

  registerTimeout(listener: Listener<void, void>, timeout: number) {
    setTimeout(listener, timeout);
  }

  disposeAll() {
    this.intervals.forEach((interval) => {
      clearInterval(interval);
    });

    this.intervals = [];
    this.listeners = [];
  }
}

export const ScheduleService = new ScheduleServiceClass();
