import { preloadTextureList } from '../common/assets';
import { getRandomIndex } from '../common/sets';
import { ScheduleService } from '../services/schedule-service';
import { VarService } from '../services/var-service';
import { GameObjectGeneralRenderingBlueprint, GameObjectTypeEnum } from '../types/game-types';

export class FoodGameObject {
  static onCreate() {
    const textures = {
      food: [
        'assets/game-objects/food-game-object/avocado.png',
        'assets/game-objects/food-game-object/bread.png',
        'assets/game-objects/food-game-object/brownie.png',
        'assets/game-objects/food-game-object/bug.png',
        'assets/game-objects/food-game-object/cheese.png',
        'assets/game-objects/food-game-object/chicken-leg.png',
        'assets/game-objects/food-game-object/chicken.png',
        'assets/game-objects/food-game-object/jam.png',
        'assets/game-objects/food-game-object/wine.png',
      ],
    };

    preloadTextureList(textures);

    const state = {
      randomSeed: Math.random(),
      foodPosition: 0.0,
      foodType: getRandomIndex(textures.food),
      position: {
        xMin: -1.95,
        xStep: 1.3,
        yThresholdMin: 3.0,
        yThresholdMax: 3.4,
        yMin: 10.0,
        yStep: 0.1,
      },
      angularVelocity: 0.05,
      pointsGain: 10.0,
    };

    const structure: GameObjectGeneralRenderingBlueprint = {
      type: GameObjectTypeEnum.Sprite,
      props: {
        texture: textures.food[state.foodType],
      },
      position: [0.0, 0.0, 0.0],
      rotation: [0.0, 0.0, 0.0],
      scale: [1.0, 1.0, 1.0],
    };

    const reset = () => {
      state.foodPosition = Math.floor(Math.random() * 4.0);

      structure.position[0] = state.foodPosition * state.position.xStep + state.position.xMin;
      structure.position[1] -= state.position.yMin;

      state.foodType = getRandomIndex(textures.food);

      structure.props.texture = textures.food[state.foodType];
      structure.needsUpdate = true;
    };

    ScheduleService.registerFrameListener(() => {
      const heroPosition = VarService.getVar<number>('heroPosition');
      const playerHealth = VarService.getVar<number>('playerHealth');

      if (playerHealth <= 0.0) {
        return;
      }

      structure.position[1] += state.angularVelocity;
      structure.rotation[2] += state.position.yStep * state.randomSeed;

      if (
        structure.position[1] >= state.position.yThresholdMin &&
        heroPosition === state.foodPosition
      ) {
        VarService.setVar('foodCollected', true);

        const currentPoints = VarService.getVar<number>('playerPoints');
        VarService.setVar('playerPoints', currentPoints + state.pointsGain);

        reset();
        return;
      }

      if (structure.position[1] >= state.position.yThresholdMax) {
        const currentHealth = VarService.getVar<number>('playerHealth');
        VarService.setVar('playerHealth', currentHealth - 1.0);

        reset();
      }
    });

    return structure;
  }
}
