import { Listener } from "../common/types";

type AssetCacheType = {
  textures: Record<string, HTMLImageElement>;
  fonts: Record<string, string>;
};

class AssetsServiceClass {
  queue: Array<Promise<any>> = [];
  cache: AssetCacheType = {
    textures: {},
    fonts: {}
  };
  disposables: Array<Listener<void, void>> = [];

  preloadTexture(id: string) {
    const image = new Image();
    const promisable = new Promise<void>(resolve => {
      image.onload = () => {
        this.cache.textures[id] = image;

        this.queue = this.queue.filter(match => match !== promisable);
        resolve();
      };
    });

    this.queue.push(promisable);
    image.src = id;
  }

  preloadFont(fontFamily: string, path: string) {
    const headElement = document.querySelector('head');

    if (headElement) {
      headElement.innerHTML += `
        <style>
          @font-face {
            font-family: "${fontFamily}";
            src: url("${path}") format("ttf");
          }
        </style>
      `;
    }

    this.cache.fonts[fontFamily] = path;
  }

  getTexture(id: string): HTMLImageElement {
    if (this.cache.textures[id]) {
      return this.cache.textures[id];
    } else {
      let image = new Image();

      const promisable = new Promise<void>(resolve => {
        image.onload = () => {
          this.cache.textures[id] = image;

          this.queue = this.queue.filter(match => match !== promisable);
          resolve();
        };
      });

      this.queue.push(promisable);
      image.src = id;

      return image;
    }
  }

  registerDisposable(target: any, onDispose: Listener<void, void>) {
    this.disposables.push(onDispose);

    target.__onDispose = onDispose();
  }

  dispose(target: any) {
    if (typeof target.__onDispose === 'function') {
      target.__onDispose();

      delete target.__onDispose;
    }
  }

  disposeAll() {
    this.disposables.forEach(disposable => {
      disposable();
    });

    this.disposables = [];
  }
}

export const AssetsService = new AssetsServiceClass();
