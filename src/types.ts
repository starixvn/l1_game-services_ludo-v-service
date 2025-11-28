export type OddsValue = number;
export type Odds = {
  big: OddsValue;
  small: OddsValue;
  odd: OddsValue;
  even: OddsValue;
  kick: OddsValue;
  noKick: OddsValue;
  move: OddsValue;
  noMove: OddsValue;
  release: OddsValue;
  noRelease: OddsValue;
  goStable: OddsValue;
  noStable: OddsValue;
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
  socketClient: { id: string; emit: (event: string, payload: any) => void };
  sendedInGame?: boolean;
};
