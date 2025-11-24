export interface ITempBet {
  uid: string;
  name: string;
  big?: number;
  small?: number;
  odd?: number;
  even?: number;
  kick?: number;
  move?: number;
  release?: number;
  goStable?: number;
  noStable?: number;
  noKick?: number;
  noMove?: number;
  noRelease?: number;
  betwin: number;
  time: Date;
  odds: any;
  freeBet: boolean;
  roundId: number;
  paid: boolean;
  playerId: string;
  siteId: string;
  operatorId: string;
  reachMaxWin: boolean;
  maxWin: number;
  margin: number;
}
