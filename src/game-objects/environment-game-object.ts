import { ScheduleService } from "../services/schedule-service";
import { VarService } from "../services/var-service";
import { GameObjectGeneralRenderingBlueprint, GameObjectTypeEnum } from "../types/game-types";
import { lerp } from "../common/math";
import { preloadTextureList } from "../common/assets";

export class EnvironmentGameObject {
  static onCreate() {
    const state = {
      cameraPosition: 0.0
    };

    preloadTextureList({
      environment: [
        'assets/game-objects/environment-game-object/background-2.png',
        'assets/game-objects/environment-game-object/background-1.png',
        'assets/game-objects/environment-game-object/foreground-2.png',
        'assets/game-objects/environment-game-object/foreground-1.png',
      ]
    });

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
            texture: 'assets/game-objects/environment-game-object/background-2.png'
          },
          position: [ 0.0, 1.5, -0.9 ],
          rotation: [ 0.0, 0.0, 0.0 ],
          scale: [ 2.5, 2.5, 1.0 ]
        },
        {
          type: GameObjectTypeEnum.Sprite,
          props: {
            texture: 'assets/game-objects/environment-game-object/background-1.png'
          },
          position: [ 0.0, 1.7, -0.5 ],
          rotation: [ 0.0, 0.0, 0.0 ],
          scale: [ 2.5, 2.5, 1.0 ]
        },
        {
          type: GameObjectTypeEnum.Sprite,
          props: {
            texture: 'assets/game-objects/environment-game-object/foreground-2.png'
          },
          position: [ 0.0, 3.5, 0.0 ],
          rotation: [ 0.0, 0.0, 0.0 ],
          scale: [ 3.5, 3.5, 1.0 ]
        },
        {
          type: GameObjectTypeEnum.Sprite,
          props: {
            texture: 'assets/game-objects/environment-game-object/foreground-1.png'
          },
          position: [ 0.0, 5.0, 0.5 ],
          rotation: [ 0.0, 0.0, 0.0 ],
          scale: [ 3.0, 3.0, 1.0 ]
        },
      ]
    };

    ScheduleService.registerFrameListener(({ currentFrame }) => {
      const heroPosition = VarService.getVar<number>('heroPosition');

      state.cameraPosition = lerp(state.cameraPosition, (2.0 - heroPosition) * 0.5, 0.1);
      state.cameraPosition += Math.sin(currentFrame / 25.0) * 0.001;

      if (structure.children) {
        structure.children.forEach(child => {
          const perspectiveOffset = 1.0 + child.position[2];

          child.position[0] = state.cameraPosition * perspectiveOffset;
        });
      }
    });

    return structure;
  }
};
