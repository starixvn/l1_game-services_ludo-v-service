export interface IBetLog {
  uid: string;
  name: string;
  time: Date;
  choice: string;
  amount: number;
  clientSentTime: Date;
  receivedTime: Date;
  siteId: string;
  operatorId: string;
  freeBet: boolean;
  playerId: string;
  currency: string;
  rate: number;
  roundId: number;
}
