import { preloadTextureList } from "../common/assets";
import { LevelView } from "../game-views/level-view";
import { InputService } from "../services/input-service";
import { ParserService } from "../services/parser-service";
import { ScheduleService } from "../services/schedule-service";
import { GameObjectGeneralRenderingBlueprint, GameObjectTypeEnum } from "../types/game-types";

export class MenuUiGameObject {
  static onCreate() {
    preloadTextureList({
      uiElements: [
        'assets/game-objects/menu-ui-game-object/background-wheel.png',
        'assets/game-objects/menu-ui-game-object/background.png',
      ]
    });

    const backgroundWheelStructure: GameObjectGeneralRenderingBlueprint = {
      type: GameObjectTypeEnum.Sprite,
      props: {
        texture: 'assets/game-objects/menu-ui-game-object/background-wheel.png'
      },
      position: [-4.0, 4.0, 0.0],
      rotation: [0.0, 0.0, 0.0],
      scale: [15.0, 15.0, 15.0]
    };

    const structure: GameObjectGeneralRenderingBlueprint = {
      type: GameObjectTypeEnum.Group,
      props: {},
      position: [0.0, 0.0, 0.0],
      rotation: [0.0, 0.0, 0.0],
      scale: [1.0, 1.0, 1.0],
      children: [
        backgroundWheelStructure,
        {
          type: GameObjectTypeEnum.Sprite,
          props: {
            texture: 'assets/game-objects/menu-ui-game-object/background.png'
          },
          position: [0.0, 1.0, 0.0],
          rotation: [0.0, 0.0, 0.0],
          scale: [5.0, 5.0, 5.0],
          needsUpdate: true
        },
        {
          type: GameObjectTypeEnum.Label,
          props: {
            fontFamily: 'kenney-mini',
            fontSize: 0.2,
            color: 0xffffff,
            text: 'Press Space to Play'
          },
          position: [0.0, -4.0, 0.0],
          rotation: [0.0, 0.0, 0.0],
          scale: [1.0, 1.0, 1.0],
        }
      ]
    };

    InputService.registerKeyListener(' ', (pressed) => {
      if (!pressed) {
        ParserService.renderView(new LevelView());
      }
    });

    ScheduleService.registerFrameListener(() => {
      backgroundWheelStructure.rotation[2] += 0.002;
    });

    return structure;
  }
};
