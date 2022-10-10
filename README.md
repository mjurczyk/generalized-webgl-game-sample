# Generalized WebGL Game Sample

![Image](https://user-images.githubusercontent.com/9549760/194800684-c8d92ffe-4636-4b93-a6f3-64d1bfa7ef2f.png)

## About

This repo is based on a simplified [mjurczyk/three-default-cube](https://github.com/mjurczyk/three-default-cube) ([docs](https://defaultcube.wtlstudio.com/)) - while, at the same time, it also makes the rendering no longer dependent on three.js (see both `PixiRenderService` and `ThreeRenderService` for sample renderer implementations.)

## Structure

* `services/`: directory containing logic implementations
* `game-views/`: directory containing view structures
* `game-objects/`: directory containing game objects and their logic

### RenderService

Internal handling of rendering.

### AssetsService

Internal handling of assets and disposal.

### InputService

You can use `InputService.registerKeyListener` to reactively listen to key events.

### ParserService

You can use `ParserService.pauseGame` and `ParserService.resumeGame` to contol the gameplay loop. Use `ParserService.renderView` to change current view to a new one.

### ScheduleService

You can use `ScheduleService.registerFrameListener`, `ScheduleService.registerInterval`, and `ScheduleService.registerTimeout` to safely create timed routines.

### VarService

You can use `VarService.getVar` and `VarService.setVar` to reactively control the global state.
