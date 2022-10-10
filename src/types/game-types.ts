import { AssetsService } from '../services/assets-service';
import { InputService } from '../services/input-service';
import { ScheduleService } from '../services/schedule-service';
import { VarService } from '../services/var-service';

// NOTE GameObject types
export enum GameObjectTypeEnum {
  Group,
  Label,
  Sprite,
}

interface GameObjectBlueprintProps {
  [GameObjectTypeEnum.Group]: {};
  [GameObjectTypeEnum.Label]: {
    text: string;
    fontFamily: string;
    fontSize: number;
    color: string | number;
    textAlign?: 'left' | 'right' | 'center';
  };
  [GameObjectTypeEnum.Sprite]: {
    texture: string;
  };
}

export type GameObjectGeneralRenderingBlueprint = (
  | GameObjectRenderingBlueprint<GameObjectTypeEnum.Label>
  | GameObjectRenderingBlueprint<GameObjectTypeEnum.Group>
  | GameObjectRenderingBlueprint<GameObjectTypeEnum.Sprite>
) & {
  needsUpdate?: boolean;
};

export type GameObjectBaseBlueprint = {
  id?: number;
  children?: Array<GameObjectBaseBlueprint>;
  initialPosition?: Vector3;
  initialRotation?: Vector3;
  initialScale?: Vector3;
  gameObject: GameObjectFactory;
};

export type GameObjectRenderingBlueprint<T extends GameObjectTypeEnum> = {
  id?: number;
  type: T;
  props: {
    [U in keyof GameObjectBlueprintProps[T]]: GameObjectBlueprintProps[T][U];
  };
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
  children?: Array<GameObjectGeneralRenderingBlueprint>;
};

export interface GameObjectFactory {
  onCreate(): GameObjectGeneralRenderingBlueprint;
  onDispose?(): void;
}

// NOTE GameView types
export class GameViewClass {
  structure: GameViewStructureTree = [];
  background?: number;
  onCreate(): void {}
  onDispose(): void {
    AssetsService.disposeAll();
    InputService.disposeAll();
    ScheduleService.disposeAll();
    VarService.disposeAll();
  }
}

export type GameViewStructureTree = Array<GameObjectBaseBlueprint>;
export type GameViewRenderingTree = Array<GameObjectGeneralRenderingBlueprint>;

// NOTE Misc
export type Vector3 = [number, number, number];
