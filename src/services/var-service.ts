class VarServiceClass {
  variables: Record<string, any> = {};
  listeners: Record<string, Array<(value: any) => void>> = {};

  setVar<T>(id: string, value: T) {
    this.variables[id] = value;

    if (!this.listeners[id]) {
      this.listeners[id] = [];
    } else {
      this.listeners[id].forEach(callback => {
        if (!callback) {
          return;
        }

        callback(value);
      });
    }
  }

  getVar<T>(id: string, onUpdate?: (value: T) => void): T {
    if (!this.listeners[id]) {
      this.listeners[id] = [];
    }

    if (onUpdate) {
      this.listeners[id].push(onUpdate);

      onUpdate(this.variables[id] as T);
    }

    return this.variables[id];
  }

  disposeAll() {
    Object.keys(this.listeners).forEach(key => {
      delete this.listeners[key];
    });

    this.listeners = {};
    this.variables = {};
  }
}

export const VarService = new VarServiceClass();
