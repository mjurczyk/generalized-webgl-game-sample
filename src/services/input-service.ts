class InputServiceClass {
  keys: Record<string, boolean> = {};
  listeners: Record<string, Array<(pressed: boolean, once: boolean) => void>> = {};

  constructor() {
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
  }

  init() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  key(keyCode: string) {
    return this.keys[keyCode];
  }

  onKeyDown({ key }: KeyboardEvent) {
    const keyCode = `${key}`.toLowerCase();

    if (this.listeners[keyCode]) {
      const once = this.keys[keyCode] === false;

      this.listeners[keyCode].forEach((listener) => {
        listener(true, once);
      });
    }

    this.keys[keyCode] = true;
  }

  onKeyUp({ key }: KeyboardEvent) {
    const keyCode = `${key}`.toLowerCase();

    if (this.listeners[keyCode]) {
      const once = this.keys[keyCode] === true;

      this.listeners[keyCode].forEach((listener) => {
        listener(false, once);
      });
    }

    this.keys[keyCode] = false;
  }

  registerKeyListener(keyCode: string, onUpdate: (pressed: boolean, once: boolean) => void) {
    if (!this.listeners[keyCode]) {
      this.listeners[keyCode] = [];
    }

    this.listeners[keyCode].push(onUpdate);
  }

  disposeAll() {
    Object.keys(this.listeners).forEach((key) => {
      delete this.listeners[key];
    });

    this.keys = {};
    this.listeners = {};
  }
}

export const InputService = new InputServiceClass();
