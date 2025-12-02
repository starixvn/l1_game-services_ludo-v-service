import {
  GameClientDriver,
  eventTypes,
  normalUser,
} from "sc-game-service-integration-utils";
import { currencyData } from "../_stubs/test-data";

export const checkConnect = (socketOptions, callback) => {
  const normalUserClientDriver = new GameClientDriver(
    socketOptions,
    initUserSession(normalUser),
  );
  normalUserClientDriver.on(eventTypes.connectError, () => {
    setTimeout(() => {
      checkConnect(socketOptions, callback);
    }, 1000);
  });
  normalUserClientDriver.on(eventTypes.connect, () => {
    normalUserClientDriver.close();
    setTimeout(callback, 2000);
  });
};

export const initUserSession = (user) => {
  return {
    session: `${user.playerId}-session-id`,
    ss: `${user.playerId}-session-id`,
    currency: currencyData.name,
    username: `${user.playerId}_${user.playerName}`,
    browserUserAgent: "browser-user-agent",
  };
};

export function buildResult(data) {
  return {
    errorCode: 0,
    errorMessage: "",
    isSuccessful: true,
    data,
  };
}

export function getTimeOutToPlacingBetTime(
  remainingTime: number,
  durations: any,
) {
  let timeout = 0;
  if (remainingTime <= durations.lockingBet) {
    timeout = remainingTime + durations.wholeRound - durations.placingBets + 2;
  } else if (remainingTime >= durations.placingBets) {
    timeout = remainingTime - durations.placingBets + 1;
  }

  return timeout;
}
