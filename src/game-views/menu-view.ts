import { MenuUiGameObject } from "../game-objects/menu-ui-game-object";
import { GameViewClass, GameViewStructureTree } from "../types/game-types";

export class MenuView extends GameViewClass {
  structure: GameViewStructureTree = [
    {
      gameObject: MenuUiGameObject,
    },
  ];

  background = 0xFFB243;
}
