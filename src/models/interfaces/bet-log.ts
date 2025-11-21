export interface IBetLog {
  uid: string;
  name: string;
  time: Date;
  choice: string;
  amount: number;
  clientSentTime: Date;
  receivedTime: Date;
  roundId: number;
}
