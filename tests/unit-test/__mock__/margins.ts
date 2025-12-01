import { BET_CHOICES, MARGIN_KEYS } from "../../../src/constants.ts";

export const generateMargins = (margin: number) => {
  return {
    [MARGIN_KEYS.big]: margin,
    [MARGIN_KEYS.small]: margin,
    [MARGIN_KEYS.odd]: margin,
    [MARGIN_KEYS.even]: margin,
    [MARGIN_KEYS.move]: margin,
    [MARGIN_KEYS.noMove]: margin,
    [MARGIN_KEYS.release]: margin,
    [MARGIN_KEYS.noRelease]: margin,
    [MARGIN_KEYS.goStable]: margin,
    [MARGIN_KEYS.noStable]: margin,
    [MARGIN_KEYS.kick]: margin,
    [MARGIN_KEYS.noKick]: margin,
  };
};

export const generateMarginWithoutPrefix = (margin: number) => {
  return {
    [BET_CHOICES.big]: margin,
    [BET_CHOICES.small]: margin,
    [BET_CHOICES.odd]: margin,
    [BET_CHOICES.even]: margin,
    [BET_CHOICES.move]: margin,
    [BET_CHOICES.noMove]: margin,
    [BET_CHOICES.release]: margin,
    [BET_CHOICES.noRelease]: margin,
    [BET_CHOICES.goStable]: margin,
    [BET_CHOICES.noStable]: margin,
    [BET_CHOICES.kick]: margin,
    [BET_CHOICES.noKick]: margin,
  };
};
