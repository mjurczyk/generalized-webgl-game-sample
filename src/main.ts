import { MenuView } from './game-views/menu-view';
import { AssetsService } from './services/assets-service';
import { InputService } from './services/input-service';
import { ParserService } from './services/parser-service';
import { PixiRenderService, ThreeRenderService } from './services/render-service';

InputService.init();

AssetsService.preloadFont('kenney-mini', 'assets/fonts/kenney-mini.ttf');
AssetsService.preloadFont('kenney-blocks', 'assets/fonts/kenney-blocks.ttf');

ThreeRenderService.init({ selector: '#app-three' });
PixiRenderService.init({ selector: '#app-pixi' });

ThreeRenderService.run();
PixiRenderService.run();

ParserService.renderView(new MenuView());
ParserService.run();

export {};
