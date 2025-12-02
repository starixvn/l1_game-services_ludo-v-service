import { Core } from "sc-game-base";

export class AdminAuthenticationConsumer extends Core.BaseEventConsumers
  .AdminAuthenticationConsumer {
  /**
   * @param {Socket} socketClient
   * @param {string} token
   */
  consume(socketClient, token) {
    this.gameData.admins[socketClient.id] = { socketClient };
  }
}
