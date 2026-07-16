import type { Locale } from "./config";

const dictionaries = {
  ar: () => import("./dictionaries/ar.json").then((m) => m.default),
  fr: () => import("./dictionaries/fr.json").then((m) => m.default),
};

export const getDictionary = async (locale: Locale) => {
  return dictionaries[locale]();
};

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;
