import { PlayerColor } from "@rd/ludo-rules";

export const GAME_NAME = "ludo";
export const BET_CHOICES = {
  big: "big",
  small: "small",
  odd: "odd",
  even: "even",
  kick: "kick",
  noKick: "noKick",
  move: "move",
  noMove: "noMove",
  release: "release",
  noRelease: "noRelease",
  goStable: "goStable",
  noStable: "noStable",
};

export const ODDS_KEYS = [
  BET_CHOICES.big,
  BET_CHOICES.small,
  BET_CHOICES.odd,
  BET_CHOICES.even,
  BET_CHOICES.kick,
  BET_CHOICES.noKick,
  BET_CHOICES.move,
  BET_CHOICES.noMove,
  BET_CHOICES.release,
  BET_CHOICES.noRelease,
  BET_CHOICES.goStable,
  BET_CHOICES.noStable,
];

export const MARGIN_KEYS = {
  big: "marginBig",
  small: "marginSmall",
  odd: "marginOdd",
  even: "marginEven",
  kick: "marginKick",
  noKick: "marginNoKick",
  move: "marginMove",
  noMove: "marginNoMove",
  release: "marginRelease",
  noRelease: "marginNoRelease",
  goStable: "marginGoStable",
  noStable: "marginNoStable",
};

export const ALL_PLAYERS = [
  PlayerColor.RED,
  PlayerColor.GREEN,
  PlayerColor.YELLOW,
  PlayerColor.BLUE,
];
