import { GameObjectGeneralRenderingBlueprint } from '../../types/game-types';

export type RenderServiceProps = {
  selector?: string;
};

export interface IAbstractRenderService<TRenderElement> {
  paused: boolean;

  sceneUuid: number;
  sceneBindings: Record<number, TRenderElement>;

  init(props: RenderServiceProps): void;
  run(): void;
  onAnimationFrame(): void;
  pauseRendering(): void;
  resumeRendering(): void;

  renderLabel(blueprint: GameObjectGeneralRenderingBlueprint): TRenderElement;
  renderSprite(blueprint: GameObjectGeneralRenderingBlueprint): TRenderElement;
}
