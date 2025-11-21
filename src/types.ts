export type Odds = {
  big: number;
  small: number;
  odd: number;
  even: number;
  kick: number;
  noKick: number;
  move: number;
  noMove: number;
  release: number;
  noRelease: number;
  goStable: number;
  noStable: number;
};

export type RealPlayer = {
  UID: string;
  name: string;
  red: number;
  avatarId: number;
  type: string;
  rate: number;
  session: {
    system: number;
    currencyCode: string;
    currencyGroupId: string;
    multiplier: number;
  };
  promotion: {
    promotionId: string;
    promotionName: string;
  };
  profile: {
    name: string;
  };
  promotionTOProgress?: {
    totalTurnover: number;
    minRequiredTurnover: number;
    remainingTO: number;
    progressPercentage: number;
    canClaim: boolean;
    totalWinAmount: number;
    claimExpirationDate: Date;
  };
};
