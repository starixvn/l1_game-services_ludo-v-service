import appConfigs from "../../../src/app-configs.IGT.js";
import { socketOptionsFunc } from "../_stubs/test-data.js";
import { checkConnect } from "../helper/helper.js";

const socketOptions = socketOptionsFunc(appConfigs.hostingPort);

describe("check connect", () => {
  it("connected", (done) => {
    checkConnect(socketOptions, done);
  });
});
