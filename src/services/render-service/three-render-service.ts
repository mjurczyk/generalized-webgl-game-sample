import * as Three from 'three';
import {
  GameObjectGeneralRenderingBlueprint,
  GameObjectRenderingBlueprint,
  GameObjectTypeEnum,
} from '../../types/game-types';
import { AssetsService } from '../assets-service';
import { ParserService } from '../parser-service';
import { IAbstractRenderService, RenderServiceProps } from './types';
import { Text as TroikaText } from 'troika-three-text';
import { frustumBaseFactor } from './shared';

class ThreeRenderServiceClass implements IAbstractRenderService<Three.Object3D> {
  renderer?: Three.WebGLRenderer;
  camera?: Three.Camera;
  scene?: Three.Scene;

  paused = false;
  sceneUuid = 0;
  sceneBindings: Record<number, Three.Object3D> = {};

  internalTextCache: Array<typeof TroikaText> = [];
  internalSpriteCache: Record<string, Three.Mesh> = {};

  init({ selector }: RenderServiceProps) {
    const renderer = new Three.WebGLRenderer({ antialias: true });
    renderer.toneMapping = Three.NoToneMapping;
    renderer.outputEncoding = Three.sRGBEncoding;

    const root = document.querySelector(selector || '');
    const viewSize = new Three.Vector2();

    if (root) {
      root.appendChild(renderer.domElement);

      viewSize.set(root.clientWidth, root.clientHeight);
    } else {
      document.body.appendChild(renderer.domElement);

      viewSize.set(window.innerWidth, window.innerHeight);
    }

    renderer.setSize(viewSize.x, viewSize.y);
    renderer.setPixelRatio(window.devicePixelRatio);

    this.renderer = renderer;

    const aspectRatio = viewSize.x / viewSize.y;
    const frustumSize = frustumBaseFactor;

    const camera = new Three.OrthographicCamera(
      (frustumSize * -aspectRatio) / 2.0,
      (frustumSize * aspectRatio) / 2.0,
      -frustumSize / 2.0,
      frustumSize / 2.0,
      -1000.0,
      1000.0
    );

    this.camera = camera;

    const scene = new Three.Scene();
    scene.background = new Three.Color(0xff00ff);

    this.scene = scene;
  }

  run() {
    if (!this.renderer) {
      return;
    }

    this.renderer.setAnimationLoop(() => this.onAnimationFrame());
  }

  pauseRendering() {
    this.paused = true;
  }

  resumeRendering() {
    this.paused = false;
  }

  onAnimationFrame() {
    if (AssetsService.queue.length) {
      this.pauseRendering();
      return;
    } else {
      this.resumeRendering();
    }

    if (!this.renderer || !this.scene || !this.camera) {
      return;
    }

    const { renderingStructure, currentView, currentViewUuid } = ParserService;

    if (this.sceneUuid !== currentViewUuid) {
      this.scene.children = [];

      this.sceneUuid = currentViewUuid;
    }

    if (currentView?.background && this.scene.background instanceof Three.Color) {
      this.scene.background.set(currentView.background);
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

        // NOTE Avoid recreating Troika contexts on the GPU for each state update
        if (binding && node.needsUpdate && node.type === GameObjectTypeEnum.Label) {
          const troikaText: typeof TroikaText = binding.children[0];

          troikaText.text = node.props.text;
          troikaText.sync();
        }

        if (!binding || (node.needsUpdate && node.type !== GameObjectTypeEnum.Label)) {
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
                  this.sceneBindings[child.id!] && renderedObject.add(this.sceneBindings[child.id!])
              );
            }

            this.sceneBindings[node.id] = renderedObject;

            if (targetParent) {
              targetParent.add(renderedObject);
            }
          }

          binding = this.sceneBindings[node.id];
        }

        binding.position.set(node.position[0], node.position[1], 0.0);
        binding.rotation.set(...node.rotation);
        binding.scale.set(...node.scale);
      };

      renderingStructure.forEach((child) => traverse(child));
    }

    if (!this.paused) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  renderGroup(): Three.Object3D {
    return new Three.Group();
  }

  renderLabel(blueprint: GameObjectGeneralRenderingBlueprint): Three.Object3D {
    const props = (blueprint as GameObjectRenderingBlueprint<GameObjectTypeEnum.Label>).props;
    const container = new Three.Object3D();

    const troikaText = new TroikaText();
    troikaText.font = AssetsService.cache.fonts[props.fontFamily];
    troikaText.text = props.text;
    troikaText.anchorX = props.textAlign || 'center';
    troikaText.anchorY = 'middle';
    troikaText.fontSize = props.fontSize || 1.0;
    troikaText.material.transparent = true;
    troikaText.color = new Three.Color(props.color || '#000000');
    troikaText.outlineWidth = `10%`;
    troikaText.outlineColor = '#000000';

    troikaText.sync();
    troikaText.scale.y = -1.0;

    container.add(troikaText);

    AssetsService.registerDisposable(troikaText, () => {
      troikaText.dispose();

      if (troikaText._textRenderInfo && troikaText._textRenderInfo.sdfTexture) {
        troikaText._textRenderInfo.sdfTexture.dispose();
      }
    });

    return container;
  }

  renderSprite(blueprint: GameObjectGeneralRenderingBlueprint): Three.Object3D {
    const props = (blueprint as GameObjectRenderingBlueprint<GameObjectTypeEnum.Sprite>).props;
    const container = new Three.Object3D();

    if (this.internalSpriteCache[props.texture]) {
      const clonedSprite = this.internalSpriteCache[props.texture].clone();

      container.add(clonedSprite);

      AssetsService.registerDisposable(clonedSprite, () => {
        const material = clonedSprite.material as Three.MeshBasicMaterial;

        if (material.map) {
          material.map.dispose();
        }
      });
    } else {
      const texture = new Three.Texture();
      texture.image = AssetsService.getTexture(props.texture);
      texture.minFilter = Three.NearestFilter;
      texture.magFilter = Three.NearestFilter;
      texture.encoding = Three.sRGBEncoding;

      const mesh = new Three.Mesh(
        new Three.PlaneGeometry(1.0, 1.0),
        new Three.MeshBasicMaterial({
          map: texture,
          transparent: true,
        })
      );
      mesh.scale.y = -texture.image.height / 80.0;
      mesh.scale.x =
        -mesh.scale.y *
        ((texture.image as HTMLImageElement).width / (texture.image as HTMLImageElement).height);
      mesh.scale.z = -1.0;

      texture.needsUpdate = true;
      this.internalSpriteCache[props.texture] = mesh;

      container.add(mesh);
    }

    return container;
  }

  disposeRenderable(renderable: Three.Object3D) {
    if (!renderable || !renderable.parent) {
      return;
    }

    renderable.traverse((child) => {
      AssetsService.dispose(child);
    });

    renderable.removeFromParent();
  }
}

export const ThreeRenderService = new ThreeRenderServiceClass();
