import { EnvironmentGameObject } from "../game-objects/environment-game-object";
import { FoodGameObject } from "../game-objects/food-game-object";
import { HeroGameObject } from "../game-objects/hero-game-object";
import { StatusUiGameObject } from "../game-objects/status-ui-game-object";
import { TrackGameObject } from "../game-objects/track-game-object";
import { GameObjectBaseBlueprint, GameViewClass, GameViewStructureTree } from "../types/game-types";

export class LevelView extends GameViewClass {
  structure: GameViewStructureTree = [
    {
      gameObject: TrackGameObject,
      initialPosition: [ -1.95, -3.8, 0.0 ],
      initialRotation: [ 0.0, 0.0, 0.0 ],
      initialScale: [ 1.0, 1.0, 1.0 ],
    },
    {
      gameObject: TrackGameObject,
      initialPosition: [ -0.65, -3.8, 0.0 ],
      initialRotation: [ 0.0, 0.0, 0.0 ],
      initialScale: [ 1.0, 1.0, 1.0 ],
    },
    {
      gameObject: TrackGameObject,
      initialPosition: [ 0.65, -3.8, 0.0 ],
      initialRotation: [ 0.0, 0.0, 0.0 ],
      initialScale: [ 1.0, 1.0, 1.0 ],
    },
    {
      gameObject: TrackGameObject,
      initialPosition: [ 1.95, -3.8, 0.0 ],
      initialRotation: [ 0.0, 0.0, 0.0 ],
      initialScale: [ 1.0, 1.0, 1.0 ],
    },
    {
      gameObject: EnvironmentGameObject,
      initialPosition: [ 0.0, 0.0, 0.0 ],
    },
    {
      gameObject: StatusUiGameObject,
      initialPosition: [ 0.0, 4.2, 0.0 ],
    },
    {
      gameObject: HeroGameObject,
      initialPosition: [ 0.0, 3.5, 0.0 ],
      initialRotation: [ 0.0, 0.0, 0.0 ]
    },
    ...(Array(10).fill(0).map((_, index) => (<GameObjectBaseBlueprint>{
      gameObject: FoodGameObject,
      initialPosition: [ -1.95, -index - 5.0, 0.0 ],
      initialRotation: [ 0.0, 0.0, Math.random() * Math.PI * 2.0 ],
      initialScale: [ 2.0, 2.0, 2.0 ]
    })))
  ];

  background = 0x719AB9;
}
