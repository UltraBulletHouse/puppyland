export const getImagePngUrl = (name: string) => {
  return new URL(`../assets/icons-png/${name}.png`, import.meta.url).href;
};
