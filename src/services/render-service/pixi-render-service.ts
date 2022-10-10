import * as PIXI from 'pixi.js';
import {
  GameObjectGeneralRenderingBlueprint,
  GameObjectRenderingBlueprint,
  GameObjectTypeEnum,
} from '../../types/game-types';
import { AssetsService } from '../assets-service';
import { ParserService } from '../parser-service';
import { IAbstractRenderService, RenderServiceProps } from './types';
import { frustumBaseFactor } from './shared';

class PixiRenderServiceClass implements IAbstractRenderService<PIXI.DisplayObject> {
  renderer?: PIXI.Renderer;
  ticker?: PIXI.Ticker;
  scene?: PIXI.Container;

  paused = false;
  sceneUuid = 0;
  sceneBindings: Record<number, PIXI.Container> = {};

  internalSpriteCache: Record<string, PIXI.Texture> = {};

  init({ selector }: RenderServiceProps) {
    PIXI.settings.RESOLUTION = window.devicePixelRatio;
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

    const root = document.querySelector(selector || '');
    const viewSize = new PIXI.Point(0.0, 0.0);

    if (root) {
      viewSize.set(root.clientWidth, root.clientHeight);
    } else {
      viewSize.set(window.innerWidth, window.innerHeight);
    }

    const renderer = new PIXI.Renderer({
      width: viewSize.x,
      height: viewSize.y,
      backgroundColor: Math.random() * 0x888888 + 0x888888,
    });

    renderer.view.style.width = `${renderer.view.width / window.devicePixelRatio}px`;
    renderer.view.style.height = `${renderer.view.height / window.devicePixelRatio}px`;

    if (root) {
      root.appendChild(renderer.view);
    } else {
      document.body.appendChild(renderer.view);
    }

    this.renderer = renderer;

    const scene = new PIXI.Container();
    scene.position.x += viewSize.x / 2.0;
    scene.position.y += viewSize.y / 2.0;

    this.scene = scene;

    const ticker = new PIXI.Ticker();
    this.ticker = ticker;
  }

  run() {
    if (!this.renderer || !this.ticker) {
      return;
    }

    this.ticker.add(() => this.onAnimationFrame(), PIXI.UPDATE_PRIORITY.LOW);
    this.ticker.start();
  }

  pauseRendering() {
    this.paused = true;
  }

  resumeRendering() {
    this.paused = false;
  }

  getFrustumScaling(): [number, number] {
    if (!this.renderer) {
      return [1.0, 1.0];
    }

    return [
      (this.renderer.view.width / this.renderer.view.height) *
        frustumBaseFactor *
        window.devicePixelRatio,
      frustumBaseFactor * window.devicePixelRatio,
    ];
  }

  onAnimationFrame() {
    if (AssetsService.queue.length) {
      this.pauseRendering();
      return;
    } else {
      this.resumeRendering();
    }

    if (!this.renderer || !this.scene) {
      return;
    }

    const { renderingStructure, currentView, currentViewUuid } = ParserService;

    if (this.sceneUuid !== currentViewUuid) {
      this.scene.removeChildren();

      this.sceneUuid = currentViewUuid;
    }

    if (currentView?.background) {
      this.renderer.backgroundColor = currentView.background;
    }

    if (renderingStructure) {
      const traverse = (node: GameObjectGeneralRenderingBlueprint) => {
        if (node.children) {
          node.children.forEach((child) => traverse(child));
        }

        if (!node.id) {
          return;
        }

        let binding = this.sceneBindings[node.id];

        if (!binding || node.needsUpdate) {
          const renderPerser = {
            [GameObjectTypeEnum.Group]: this.renderGroup,
            [GameObjectTypeEnum.Label]: this.renderLabel,
            [GameObjectTypeEnum.Sprite]: this.renderSprite,
          }[node.type];

          if (renderPerser) {
            const renderedObject = renderPerser.call(this, node);
            const targetParent = binding?.parent || this.scene;

            if (binding && node.needsUpdate) {
              this.disposeRenderable(binding);
            }

            if (node.children?.length) {
              node.children.forEach(
                (child) =>
                  this.sceneBindings[child.id!] &&
                  renderedObject.addChild(this.sceneBindings[child.id!])
              );
            }

            this.sceneBindings[node.id] = renderedObject;

            if (targetParent) {
              targetParent.addChild(renderedObject);
            }
          }

          binding = this.sceneBindings[node.id];
        }

        const frustumScaling = this.getFrustumScaling();

        binding.position.set(
          node.position[0] * (this.renderer?.view.width! / frustumScaling[0]),
          node.position[1] * (this.renderer?.view.height! / frustumScaling[1])
        );
        binding.scale.set(node.scale[0], node.scale[1]);
        binding.rotation = node.rotation[2];
      };

      renderingStructure.forEach((child) => traverse(child));
    }

    if (!this.paused) {
      this.renderer.render(this.scene);
    }
  }

  renderGroup(): PIXI.Container {
    return new PIXI.Container();
  }

  renderLabel(blueprint: GameObjectGeneralRenderingBlueprint): PIXI.Container {
    const props = (blueprint as GameObjectRenderingBlueprint<GameObjectTypeEnum.Label>).props;
    const container = new PIXI.Container();

    const label = new PIXI.Text(props.text, {
      fontFamily: props.fontFamily,
      fontSize: props.fontSize * 80.0,
      fill: props.color,
      stroke: 0x000000,
      strokeThickness: 4.0,
    });
    label.anchor.set(
      {
        left: 0.0,
        center: 0.5,
        right: 1.0,
      }[props.textAlign || 'center'],
      0.5
    );

    container.addChild(label);
    return container;
  }

  renderSprite(blueprint: GameObjectGeneralRenderingBlueprint): PIXI.Container {
    const props = (blueprint as GameObjectRenderingBlueprint<GameObjectTypeEnum.Sprite>).props;
    const container = new PIXI.Container();

    if (!this.internalSpriteCache[props.texture]) {
      const texture = PIXI.Texture.from(AssetsService.getTexture(props.texture), {
        scaleMode: PIXI.SCALE_MODES.NEAREST,
      });

      this.internalSpriteCache[props.texture] = texture;
    }

    const sprite = PIXI.Sprite.from(this.internalSpriteCache[props.texture]);
    sprite.anchor.set(0.5, 0.5);

    container.addChild(sprite);

    return container;
  }

  disposeRenderable(renderable: PIXI.Container) {
    if (!renderable || !renderable.parent) {
      return;
    }

    renderable.parent.removeChild(renderable);
    renderable.destroy();
  }
}

export const PixiRenderService = new PixiRenderServiceClass();
