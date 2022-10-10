import { AssetsService } from "../services/assets-service";

export const preloadTextureList = (textures: Record<string, string[]>) => {
  Object.values(textures).forEach(textureMap => {
    textureMap.forEach(texture => {
      AssetsService.preloadTexture(texture);
    });
  });
};
