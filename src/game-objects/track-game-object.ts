import { GameObjectGeneralRenderingBlueprint, GameObjectTypeEnum } from '../types/game-types';

export class TrackGameObject {
  static onCreate() {
    const structure: GameObjectGeneralRenderingBlueprint = {
      type: GameObjectTypeEnum.Group,
      props: {},
      position: [0.0, 0.0, 0.0],
      rotation: [0.0, 0.0, 0.0],
      scale: [1.0, 1.0, 1.0],
      children: [
        {
          type: GameObjectTypeEnum.Sprite,
          props: {
            texture: 'assets/game-objects/track-game-object/track-background.png',
          },
          position: [0.0, 0.0, 0.0],
          rotation: [0.0, 0.0, 0.0],
          scale: [1.5, 1.5, 1.5],
        },
      ],
    };

    return structure;
  }
}
