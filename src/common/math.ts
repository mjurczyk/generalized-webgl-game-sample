export const lerp = (x: number, y: number, a: number): number => {
  return (1 - a) * x + a * y;
};

export const clamp = (x: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, x));
};
