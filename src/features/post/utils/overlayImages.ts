const cardOverlayModules = import.meta.glob<{ default: string }>(
  "../../../assets/overlays/card/*.{png,jpg,jpeg,svg,webp}",
  { eager: true },
);

export const cardOverlayUrls = Object.values(cardOverlayModules).map(
  (mod) => mod.default,
);

export const getRandomCardOverlayUrl = () => {
  if (cardOverlayUrls.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * cardOverlayUrls.length);
  return cardOverlayUrls[randomIndex];
};

const userOverlayModules = import.meta.glob<{ default: string }>(
  "../../../assets/overlays/user/*.{png,jpg,jpeg,svg,webp}",
  { eager: true },
);

export const userOverlayUrls = Object.values(userOverlayModules).map(
  (mod) => mod.default,
);

export const getRandomUserOverlayUrl = () => {
  if (userOverlayUrls.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * userOverlayUrls.length);
  return userOverlayUrls[randomIndex];
};
