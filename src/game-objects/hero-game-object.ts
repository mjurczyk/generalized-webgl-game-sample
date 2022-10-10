import { InputService } from "../services/input-service";
import { ScheduleService } from "../services/schedule-service";
import { VarService } from "../services/var-service";
import { GameObjectGeneralRenderingBlueprint, GameObjectTypeEnum } from "../types/game-types";
import { lerp } from "../common/math";
import { preloadTextureList } from "../common/assets";

enum HeroAnimationState {
  idle,
  runLeft,
  runRight,
  attack
};

export class HeroGameObject {
  static onCreate() {
    const textures = {
      [HeroAnimationState.idle]: [
        'assets/game-objects/hero-game-object/knight-iso-char-idle-0.png',
        'assets/game-objects/hero-game-object/knight-iso-char-idle-1.png',
        'assets/game-objects/hero-game-object/knight-iso-char-idle-2.png',
        'assets/game-objects/hero-game-object/knight-iso-char-idle-3.png',
      ],
      [HeroAnimationState.runLeft]: [
        'assets/game-objects/hero-game-object/knight-iso-char-run-left-0.png',
        'assets/game-objects/hero-game-object/knight-iso-char-run-left-1.png',
        'assets/game-objects/hero-game-object/knight-iso-char-run-left-2.png',
        'assets/game-objects/hero-game-object/knight-iso-char-run-left-3.png',
        'assets/game-objects/hero-game-object/knight-iso-char-run-left-4.png',
        'assets/game-objects/hero-game-object/knight-iso-char-run-left-5.png',
      ],
      [HeroAnimationState.runRight]: [
        'assets/game-objects/hero-game-object/knight-iso-char-run-right-0.png',
        'assets/game-objects/hero-game-object/knight-iso-char-run-right-1.png',
        'assets/game-objects/hero-game-object/knight-iso-char-run-right-2.png',
        'assets/game-objects/hero-game-object/knight-iso-char-run-right-3.png',
        'assets/game-objects/hero-game-object/knight-iso-char-run-right-4.png',
        'assets/game-objects/hero-game-object/knight-iso-char-run-right-5.png',
      ],
      [HeroAnimationState.attack]: [
        'assets/game-objects/hero-game-object/knight-iso-char-slice-up-0.png',
        'assets/game-objects/hero-game-object/knight-iso-char-slice-up-1.png',
        'assets/game-objects/hero-game-object/knight-iso-char-slice-up-2.png',
      ]
    };

    preloadTextureList(textures);

    const state = {
      currentFrame: 0.0,
      currentAnimation: HeroAnimationState.idle,
      framerate: 240,
      heroPosition: 0.0,
      heroMovement: 0.0,
      movement: {
        maxSpeed: 1.0,
        minSpeed: 0.2,
        acceleration: 0.2,
        step: 0.5
      },
      position: {
        xMin: -1.95,
        xStep: 1.3
      }
    };

    const structure: GameObjectGeneralRenderingBlueprint = {
      type: GameObjectTypeEnum.Sprite,
      props: {
        texture: textures[HeroAnimationState.idle][0]
      },
      position: [0.0, 0.0, 0.0],
      rotation: [0.0, 0.0, 0.0],
      scale: [1.0, 1.0, 1.0]
    };

    const setAnimation = (animation: keyof typeof textures) => {
      if (state.currentAnimation === HeroAnimationState.attack && state.currentFrame % textures[state.currentAnimation].length !== 0) {
        return;
      }

      if (animation === HeroAnimationState.attack) {
        state.currentFrame = 1.0;
      }

      state.currentAnimation = animation;
    };


    VarService.setVar('heroPosition', 0);
    VarService.getVar<number>('heroPosition', value => {
      state.heroPosition = value * state.position.xStep + state.position.xMin;
    });

    InputService.registerKeyListener('a', (pressed, once) => {
      if (pressed && once) {
        const currentHeroPosition = VarService.getVar<number>('heroPosition');

        VarService.setVar('heroPosition', Math.max(0.0, currentHeroPosition - 1.0));
      }
    });

    InputService.registerKeyListener('d', (pressed, once) => {
      if (pressed && once) {
        const currentHeroPosition = VarService.getVar<number>('heroPosition');

        VarService.setVar('heroPosition', Math.min(3.0, currentHeroPosition + 1.0));
      }
    });

    ScheduleService.registerInterval(() => {
      state.currentFrame++;
    }, state.framerate);

    ScheduleService.registerFrameListener(() => {
      const distanceToTarget = structure.position[0] - state.heroPosition;
      const foodCollected = VarService.getVar('foodCollected');

      if (Math.abs(distanceToTarget) < state.movement.minSpeed) {
        structure.position[0] = lerp(structure.position[0], state.heroPosition, state.movement.acceleration);

        state.heroMovement = 0.0;
        setAnimation(HeroAnimationState.idle);
      } else if (distanceToTarget > 0.0) {
        state.heroMovement = lerp(state.heroMovement, -state.movement.maxSpeed, state.movement.acceleration);
        setAnimation(HeroAnimationState.runLeft);
      } else if (distanceToTarget < 0.0) {
        state.heroMovement = lerp(state.heroMovement, state.movement.maxSpeed, state.movement.acceleration);
        setAnimation(HeroAnimationState.runRight);
      }

      if (foodCollected) {
        setAnimation(HeroAnimationState.attack);
        VarService.setVar('foodCollected', false);
      }

      structure.position[0] += state.heroMovement * state.movement.step;

      structure.props.texture = textures[state.currentAnimation][state.currentFrame % textures[state.currentAnimation].length];
      structure.needsUpdate = true;
    });

    return structure;
  }
};
