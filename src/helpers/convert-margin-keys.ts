import { MARGIN_KEYS, ODDS_KEYS } from "../constants.js";

export const convertMarginKeys = (margins: { [key: string]: number }) => {
  return ODDS_KEYS.map((key) => key as keyof typeof margins).reduce(
    (acc, key) => {
      const marginKey = MARGIN_KEYS[key as keyof typeof MARGIN_KEYS];
      acc[key] = margins[marginKey];
      return acc;
    },
    {} as { [key: string]: number },
  );
};
