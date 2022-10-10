import { GameViewStructureTree, GameViewClass, GameObjectBaseBlueprint, GameViewRenderingTree, GameObjectGeneralRenderingBlueprint } from "../types/game-types";
import { ScheduleService } from "./schedule-service";

class ParserServiceClass {
  paused = false;
  uuid = 0;
  currentView?: GameViewClass;
  currentViewUuid = 0.0;
  renderingStructure: GameViewRenderingTree = [];

  lastFrameTimestamp = 0;
  currentFrameIndex = 0;

  run() {
    this.onLogicFrame();
  }

  pauseGame() {
    this.paused = true;
  }

  resumeGame() {
    this.paused = false;
  }

  onLogicFrame() {
    requestAnimationFrame(() => this.onLogicFrame());

    const now = performance.now();
    const dt = now - this.lastFrameTimestamp;
    const fixedDelta = (1.0 / 60.0) * 1000.0;

    if (this.paused) {
      this.lastFrameTimestamp = now;
      return;
    }
    
    if (dt >= fixedDelta) {
      this.lastFrameTimestamp = now;

      const steps = Math.floor(dt / fixedDelta);
      
      for (let i = 0; i < steps; i++) {
        ScheduleService.onFrame(this.currentFrameIndex++);
      }
    }
  }

  renderView(view: GameViewClass) {
    if (this.currentView) {
      this.currentView.onDispose();

      delete this.currentView;
    }
    this.currentViewUuid += Math.random();
    this.currentView = view;

    this.renderingStructure = [];
    if (view.structure) {
      this.parseViewStructure(view.structure);
    }

    view.onCreate();
  }

  parseViewStructure(structure: GameViewStructureTree) {
    const traverseRenderingBlueprint = (blueprint: GameObjectGeneralRenderingBlueprint): GameObjectGeneralRenderingBlueprint => {
      if (blueprint.children) {
        blueprint.children = blueprint.children.map((child, index) => {
          blueprint.children![index] = traverseRenderingBlueprint(child);
          child.id = ++this.uuid;
  
          return child;
        });
      }

      return blueprint;
    };

    const traverse = (node: GameObjectBaseBlueprint, parent: GameObjectGeneralRenderingBlueprint | GameViewRenderingTree) => {
      node.id = ++this.uuid;

      const renderingBlueprint = node.gameObject.onCreate();
      
      renderingBlueprint.id = node.id;
      renderingBlueprint.position = node.initialPosition || [0.0, 0.0, 0.0];
      renderingBlueprint.rotation = node.initialRotation || [0.0, 0.0, 0.0];
      renderingBlueprint.scale = node.initialScale || [1.0, 1.0, 1.0];

      this.renderingStructure[renderingBlueprint.id] = renderingBlueprint;

      if (parent instanceof Array) {
        parent.push(renderingBlueprint);
      } else if (parent.children) {
        parent.children.push(renderingBlueprint);
      }

      if (node.children) {
        node.children.forEach(child => traverse(child, this.renderingStructure[node.id!]));
      }

      traverseRenderingBlueprint(renderingBlueprint);
    };

    structure.forEach(child => traverse(child, this.renderingStructure));
  }
}

export const ParserService = new ParserServiceClass();
