import matches from "lodash.matches";
import nock from "nock";
import { initAPIStub } from "sc-game-service-integration-utils";
import appConfigs from "../../../../src/app-configs.IGT.js";
import gameSettings from "../../../../src/game-settings.js";

const buildResult = (data) => {
  return {
    errorCode: 0,
    errorMessage: "",
    isSuccessful: true,
    data,
  };
};

// Mock user data - hardcoded instead of querying DB
const createMockUserInfo = (
  playerId: string,
  playerName: string,
  isBot = false,
) => ({
  id: `user-${playerId}`,
  name: playerName,
  UID: playerId,
  red: 20000,
  avatarId: 1,
  currency: "$US",
  minBet: 1,
  maxBet: 3000,
  type: isBot,
  inRoom: false,
  disabled: false,
  banned: false,
});

const createMockUserSession = (playerId: string, playerName: string) => ({
  ssoToken: `${playerId}-sso-token`,
  sessionId: `${playerId}-session-id`,
  siteId: "111",
  userId: `user-${playerId}`,
  username: `${playerId}_${playerName}`,
  owSeq: "1,1,1w",
  ssoTime: new Date().toISOString(),
  recheckInTime: new Date().toISOString(),
  ip: "192.168.1.1",
  browserUserAgent: "browser-user-agent",
  language: "en-US",
  currencyCode: mockCurrency.name,
  currencyName: mockCurrency.name,
  currencyGroupId: mockCurrencyGroupGame.groupId,
  isTestCurrency: false,
  multiplier: 1,
  siteName: "site-name",
  system: 1,
  operatorId: mockPartnerConfig.partnerId,
  playerId: playerId,
  playerName: playerName,
  memberId: playerId,
  partnerId: mockPartnerConfig.partnerId,
  memberName: playerName,
});

// Define test users
export const normalUser = { playerId: "1", playerName: "NormalUser" };
export const errorUser = { playerId: "2", playerName: "ErrorUser" };
export const internalServerErrorUser = {
  playerId: "3",
  playerName: "InternalServerErrorUser",
};
export const endGameErrorUser = {
  playerId: "4",
  playerName: "EndGameErrorUser",
};

const testUsers = [
  normalUser,
  errorUser,
  internalServerErrorUser,
  endGameErrorUser,
];

// Mock data for various services
const mockGameConfig = {
  odds: {
    margin: 0.05,
  },
  enabled: true,
};

const mockPartnerConfig = {
  partnerId: "dummy-operator-id",
  gameId: gameSettings.id,
};

const mockCurrency = {
  name: "INH",
  partnerId: mockPartnerConfig.partnerId,
};

const mockCurrencyGroup = {
  _id: "789",
};

const mockCurrencyGroupGame = {
  groupId: mockCurrencyGroup._id,
  maxBetPerChoices: {
    odd: 1000,
    even: 1000,
    big: 1000,
    small: 1000,
    kick: 1000,
    noKick: 1000,
    move: 1000,
    noMove: 1000,
    release: 1000,
    noRelease: 1000,
    goStable: 1000,
    noStable: 1000,
  },
};

const mockExchangeRate = {
  exId: 1,
  source: "Fake",
  code: {
    AUD: 0.74886,
    CAD: 0.80865,
    CNY: 0.15664,
    EUR: 1.16282,
    GBP: 1.37699,
    HKD: 0.12864,
    IDR: 0.07059,
    JPY: 0.0088,
    MYR: 0.24103,
    PHP: 0.01973,
    SGD: 0.74279,
    THB: 0.03023,
    TWD: 0.03589,
    USD: 1,
    VND: 0.00004403,
    INH: 1,
  },
};

/**
 * Stub all game management service endpoints with hardcoded mock data
 * This replaces subGameManagementService from sc-game-service-integration-utils
 * No database queries required
 */
export const stubGameManagementServiceWithMockData = (definition) => {
  const configName = definition.configName;
  const gameId = definition.id;

  // Stub game config
  nock(appConfigs.gameManagementApiSettings.BASE)
    .persist()
    .get(`/game-configs?gameName=${configName}`, () => true)
    .reply(200, buildResult(mockGameConfig));

  // Stub archive status
  nock(appConfigs.gameManagementApiSettings.BASE)
    .persist()
    .get(`/archive-status?gameName=${configName}`, () => true)
    .reply(
      200,
      buildResult({
        name: configName,
        lastArcId: { _rounds: 5 },
      }),
    );

  // Stub notification
  nock(appConfigs.gameManagementApiSettings.BASE)
    .persist()
    .get(`/notification/um-messages?configName=${configName}`, () => true)
    .reply(
      200,
      buildResult({
        messages: {
          "vi-VN": "Game dang duoc bao tri",
          "en-US": "Game is under maintenance",
        },
      }),
    );

  // Stub exchange rate
  nock(appConfigs.gameManagementApiSettings.BASE)
    .persist()
    .get(`/exchange-rates`, () => true)
    .reply(200, buildResult(mockExchangeRate));

  // Stub currency group games
  nock(appConfigs.gameManagementApiSettings.BASE)
    .persist()
    .get(`/currency-group-games?gameId=${gameId}`, () => true)
    .reply(200, buildResult([mockCurrencyGroupGame]));

  // Stub operator config
  nock(appConfigs.gameManagementApiSettings.BASE)
    .persist()
    .get(`/operator-config/game-site-exclusions`, () => true)
    .reply(200, buildResult([mockPartnerConfig]));

  // Stub currency groups
  nock(appConfigs.gameManagementApiSettings.BASE)
    .persist()
    .get(`/currency-groups`, () => true)
    .reply(200, buildResult([mockCurrencyGroup]));

  // Stub currencies
  nock(appConfigs.gameManagementApiSettings.BASE)
    .persist()
    .get(`/currencies`, () => true)
    .reply(200, buildResult([mockCurrency]));

  // Stub promotion
  nock(appConfigs.gameManagementApiSettings.BASE)
    .persist()
    .get(`/promotion?gameId=${gameId}`, () => true)
    .reply(200, buildResult([]));

  // Stub jackpot configs
  nock(appConfigs.gameManagementApiSettings.BASE)
    .persist()
    .get(`/jackpot-config/${gameId}`, () => true)
    .reply(200, buildResult([]));

  // Stub bot configs
  nock(appConfigs.gameManagementApiSettings.BASE)
    .persist()
    .get(`/bot-config/${gameId}`, () => true)
    .reply(200, buildResult([]));

  // Stub aggregation
  nock(appConfigs.gameManagementApiSettings.BASE)
    .persist()
    .get(`/aggregation/get-setting-for-new-round?gameId=${gameId}`, () => true)
    .reply(
      200,
      buildResult({
        currencyGroupGames: [mockCurrencyGroupGame],
        partnerGameSiteExclusions: [],
        currencyGroups: [mockCurrencyGroup],
        currencies: [mockCurrency],
      }),
    );

  // Stub domains
  nock(appConfigs.gameManagementApiSettings.BASE)
    .persist()
    .get(`/domain`, () => true)
    .reply(200, buildResult({ value: "lumigame.com;luminetsoft.com" }));

  // Stub bots endpoints
  nock(appConfigs.gameManagementApiSettings.BASE)
    .persist()
    .post(`/users/bots/reset-in-room`, () => true)
    .reply(200, buildResult({}));

  nock(appConfigs.gameManagementApiSettings.BASE)
    .persist()
    .post(`/users/bots/out-room`, () => true)
    .reply(200, buildResult({}));

  nock(appConfigs.gameManagementApiSettings.BASE)
    .persist()
    .get(`/users/bots`)
    .query(true)
    .reply(200, buildResult([]));

  nock(appConfigs.gameManagementApiSettings.BASE)
    .persist()
    .get(`/users/bots/total`, () => true)
    .reply(200, buildResult(0));

  nock(appConfigs.gameManagementApiSettings.BASE)
    .persist()
    .get(`/users/bots/disabled-bots`, () => true)
    .reply(200, buildResult([]));

  nock(appConfigs.gameManagementApiSettings.BASE)
    .persist()
    .post(`/users/bots/join-room`, () => true)
    .reply(200, buildResult({}));

  nock(appConfigs.gameManagementApiSettings.BASE)
    .persist()
    .post(`/users/update-bots-balance`, () => true)
    .reply(200, buildResult([]));

  // Stub user stake level
  nock(appConfigs.gameManagementApiSettings.BASE)
    .persist()
    .post(`/users/update-stake-level`, () => true)
    .reply(200, buildResult({}));

  // Stub game notifications
  nock(appConfigs.gameManagementApiSettings.BASE)
    .persist()
    .post(`/game-notifications/clear`, () => true)
    .reply(200, buildResult({}));

  nock(appConfigs.gameManagementApiSettings.BASE)
    .persist()
    .post(`/game-notifications/delete`, () => true)
    .reply(200, buildResult({}));
};

/**
 * Stub user info endpoints for a specific user
 */
export const stubUserInfoWithMockData = (user: {
  playerId: string;
  playerName: string;
}) => {
  const userInfo = createMockUserInfo(user.playerId, user.playerName);

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
};

/**
 * Stub user service (sign in) with mock data
 */
export const stubUserServiceWithMockData = () => {
  testUsers.forEach((user) => {
    const userSession = createMockUserSession(user.playerId, user.playerName);

    const params = {
      session: userSession.sessionId,
      username: userSession.username,
      browserUserAgent: userSession.browserUserAgent,
    };

    nock(appConfigs.userServiceSettings.url)
      .persist()
      .post("/gameBackend/signInGame", matches(params), () => true)
      .reply(200, { ...userSession, id: userSession.userId });
  });
};

/**
 * Stub user tracking API
 */
export const stubUserTrackingApiWithMockData = () => {
  nock(appConfigs.trackingApiSettings.baseUrl)
    .persist()
    .post(`/game/sign-out`, () => true)
    .reply(200, buildResult({}));

  nock(appConfigs.trackingApiSettings.baseUrl)
    .persist()
    .post(`/game/sign-in`, () => true)
    .reply(200, buildResult({}));
};

/**
 * Stub promotion service
 */
export const stubPromotionServiceWithMockData = (gameId: number) => {
  nock(appConfigs.promotionApiSettings.baseUrl)
    .persist()
    .get(`/promotions/all-promotions-running?gameId=${gameId}`)
    .reply(200, []);
};

/**
 * Initialize all API stubs with mock data - no database required
 */
export const initAllStubsWithMockData = (definition) => {
  // Initialize nock
  nock(appConfigs.apiSettings.apiUrl);
  initAPIStub(appConfigs.apiSettings.apiUrl);

  // Stub all services
  stubGameManagementServiceWithMockData(definition);
  stubUserServiceWithMockData();
  stubUserTrackingApiWithMockData();
  stubPromotionServiceWithMockData(definition.id);

  // Stub user info for all test users
  testUsers.forEach((user) => stubUserInfoWithMockData(user));
};
