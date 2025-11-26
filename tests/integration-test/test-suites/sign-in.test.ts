import {
  GameClientDriver,
  normalUser,
} from "sc-game-service-integration-utils";
import appConfigs from "../../../src/app-configs.IGT.js";
import { socketOptionsFunc } from "../_stubs/test-data.js";
import { initUserSession } from "../helper/helper.js";

const socketOptions = socketOptionsFunc(appConfigs.hostingPort);

describe("signin", () => {
  it("should receive signed in response", async () => {
    //Arrange & Act
    const client = new GameClientDriver(
      socketOptions,
      initUserSession(normalUser),
    );

    const sendSignInInterval = setInterval(() => {
      client.sendSignInEvent();
    }, 500);

    // Act
    await client.handleSignedInEvent();

    clearInterval(sendSignInInterval);

    client.close();
  });
});
