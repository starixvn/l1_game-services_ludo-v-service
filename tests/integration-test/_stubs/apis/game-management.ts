import nock from "nock";
import appConfigs from "../../../../src/app-configs.IGT.js";
import { buildResult } from "../../helper/helper.js";

export function stubUserInfo(userInfo, appConfigs) {
  nock(appConfigs.gameManagementApiSettings.BASE)
    .persist()
    .get(`/users/info?id=${userInfo.id}`, () => true)
    .reply(200, buildResult(userInfo));

  nock(appConfigs.gameManagementApiSettings.BASE)
    .persist()
    .post(`/users/set-balance`, () => true)
    .reply(200, buildResult(userInfo));
  nock(appConfigs.gameManagementApiSettings.BASE)
    .persist()
    .post(`/users/set-balance-and-decrease-scoins`, () => true)
    .reply(200, buildResult(userInfo));
  nock(appConfigs.gameManagementApiSettings.BASE)
    .persist()
    .post(`/users/update-balance`, () => true)
    .reply(200, buildResult(userInfo));

  nock(appConfigs.gameManagementApiSettings.BASE)
    .persist()
    .post(`/users/update-stake-level`, () => true)
    .reply(200, buildResult({}));

  nock(appConfigs.gameManagementApiSettings.BASE)
    .persist()
    .post(`/users/bots/reset-in-room`, () => true)
    .reply(200, buildResult({}));
}

export function stubGameNotifications() {
  nock(appConfigs.gameManagementApiSettings.BASE)
    .persist()
    .post(`/game-notifications/clear`, () => true)
    .reply(200, buildResult({}));
  nock(appConfigs.gameManagementApiSettings.BASE)
    .persist()
    .post(`/game-notifications/delete`, () => true)
    .reply(200, buildResult({}));
}

export function stubDomain() {
  nock(appConfigs.gameManagementApiSettings.BASE)
    .persist()
    .get(`/domain`, () => true)
    .reply(200, buildResult({}));
}

export function stubUserTrackingApi() {
  nock(appConfigs.trackingApiSettings.baseUrl)
    .persist()
    .post(`/game/sign-out`, () => true)
    .reply(200, buildResult({}));
  nock(appConfigs.trackingApiSettings.baseUrl)
    .persist()
    .post(`/game/sign-in`, () => true)
    .reply(200, buildResult({}));
}
