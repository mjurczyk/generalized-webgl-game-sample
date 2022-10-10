import { preloadTextureList } from "../common/assets";
import { MenuView } from "../game-views/menu-view";
import { ParserService } from "../services/parser-service";
import { ScheduleService } from "../services/schedule-service";
import { VarService } from "../services/var-service";
import { GameObjectGeneralRenderingBlueprint, GameObjectRenderingBlueprint, GameObjectTypeEnum } from "../types/game-types";

export class StatusUiGameObject {
  static onCreate() {
    const iconTextures = {
      promptIcons: {
        tipPrompt: [
          'assets/game-objects/status-ui-game-object/key-move-off.png',
          'assets/game-objects/status-ui-game-object/key-move-left.png',
          'assets/game-objects/status-ui-game-object/key-move-off.png',
          'assets/game-objects/status-ui-game-object/key-move-right.png',
        ]
      },
      status: {
        hearts: [
          'assets/game-objects/status-ui-game-object/heart-full.png',
          'assets/game-objects/status-ui-game-object/heart-half.png',
          'assets/game-objects/status-ui-game-object/heart-empty.png',
        ]
      }
    };

    preloadTextureList(iconTextures.promptIcons);
    preloadTextureList(iconTextures.status);
    preloadTextureList({
      uiElements: [
        'assets/game-objects/status-ui-game-object/ui-frame.png'
      ]
    });

    const state = {
      activePromptIcon: 'tipPrompt',
      currentFrame: 0,
      framerate: 1000
    };

    const promptStructure: Record<string, GameObjectGeneralRenderingBlueprint> = {
      label: {
        type: GameObjectTypeEnum.Label,
        props: {
          fontFamily: 'kenney-mini',
          fontSize: 0.12,
          color: 0xffffff,
          text: 'Grab the falling food',
          textAlign: 'left'
        },
        position: [-0.1, -0.025, 0.0],
        rotation: [0.0, 0.0, 0.0],
        scale: [1.5, 1.5, 1.5],
      },
      icon: {
        type: GameObjectTypeEnum.Sprite,
        props: {
          texture: 'assets/game-objects/status-ui-game-object/key-move-off.png'
        },
        position: [ -0.4, 0.0, 0.0 ],
        rotation: [ 0.0, 0.0, 0.0 ],
        scale: [ 1.5, 1.5, 1.5 ]
      }
    };

    const pointsCounterStructure: GameObjectGeneralRenderingBlueprint = {
      type: GameObjectTypeEnum.Label,
      props: {
        fontFamily: 'kenney-mini',
        fontSize: 0.15,
        color: 0xffffff,
        text: '0000000'
      },
      position: [0.0, 0.0, 0.0],
      rotation: [0.0, 0.0, 0.0],
      scale: [1.5, 1.5, 1.5]
    };

    const heartsCounterStructure: GameObjectGeneralRenderingBlueprint[] =
      Array(5).fill(0).map((_, index) => (<GameObjectRenderingBlueprint<GameObjectTypeEnum.Sprite>>{
        type: GameObjectTypeEnum.Sprite,
        props: {
          texture: 'assets/game-objects/status-ui-game-object/heart-full.png'
        },
        position: [-0.75 + index * 0.275, 0.375, 0.0],
        rotation: [0.0, 0.0, 0.0],
        scale: [2.5, 2.5, 2.5]
      }));

    const structure: GameObjectGeneralRenderingBlueprint = {
      type: GameObjectTypeEnum.Group,
      props: {},
      position: [0.0, 0.0, 0.0],
      rotation: [0.0, 0.0, 0.0],
      scale: [1.0, 1.0, 1.0],
      children: [
        {
          type: GameObjectTypeEnum.Group,
          props: {},
          position: [ 2.0, 0.0, 0.0 ],
          rotation: [ 0.0, 0.0, 0.0 ],
          scale: [ 1.0, 1.0, 1.0 ],
          children: [
            pointsCounterStructure,
            {
              type: GameObjectTypeEnum.Sprite,
              props: {
                texture: 'assets/game-objects/status-ui-game-object/ui-frame.png'
              },
              position: [-0.25, 0.25, 0.0],
              rotation: [0.0, 0.0, 0.0],
              scale: [3.0, 3.0, 3.0]
            },
            ...heartsCounterStructure,
          ]
        },
        {
          type: GameObjectTypeEnum.Group,
          props: {},
          position: [ -2.0, 0.15, 0.0 ],
          rotation: [ 0.0, 0.0, 0.0 ],
          scale: [ 1.0, 1.0, 1.0 ],
          children: Object.values(promptStructure)
        }
      ]
    };

    VarService.setVar<number>('playerHealth', 10.0);
    VarService.getVar<number>('playerHealth', value => {
      heartsCounterStructure.forEach((heart, index) => {
        const { props } = heart as GameObjectRenderingBlueprint<GameObjectTypeEnum.Sprite>;

        if (value >= (index + 1.0) * 2.0) {
          props.texture = iconTextures.status.hearts[0];
        } else if (value === (index + 1.0) * 2.0 - 1) {
          props.texture = iconTextures.status.hearts[1];
        } else {
          props.texture = iconTextures.status.hearts[2];
        }

        heart.needsUpdate = true;
      });

      if (value <= 0.0) {
        ScheduleService.registerTimeout(() => {
          ParserService.renderView(new MenuView());
        }, 3000);
      }
    });

    VarService.setVar<number>('playerPoints', 0.0);
    VarService.getVar<number>('playerPoints', value => {
      const playerHealth = VarService.getVar<number>('playerHealth');

      if (playerHealth <= 0.0) {
        return;
      }
      
      pointsCounterStructure.props.text = `0000000${value}`.substr(-7);
      pointsCounterStructure.needsUpdate = true;
    });

    ScheduleService.registerInterval(() => {
      state.currentFrame++;
    }, state.framerate);
    
    ScheduleService.registerFrameListener(() => {
      const { props } = promptStructure.icon as GameObjectRenderingBlueprint<GameObjectTypeEnum.Sprite>;
      const currentIcon = state.activePromptIcon as keyof typeof iconTextures.promptIcons;
      const currentIconFrames = iconTextures.promptIcons[currentIcon];

      props.texture = currentIconFrames[state.currentFrame % currentIconFrames.length];
      promptStructure.icon.needsUpdate = true;

      promptStructure.label.needsUpdate = true;
    });

    return structure;
  }
};
