export default {
  hostingPort: 5001,
  id: 163,
  name: "ludo",
  apiSettings: {
    authUrl: "http://localhost:7888/api/auth",
    apiUrl: "http://localhost:7888/api/game",
    client: {
      id: "game-server",
      secret: "gameserver@20luminet&",
    },
    useAuthenticate: true,
    requestTimeout: 10000,
    placeBetTimeout: 2000,
    enabledApiLogs: true,
  },
  authenticateSettings: {
    url: "http://l1-auth-api-local-service:5000",
    id: "game-services",
    secret: "gameservices@20luminet&",
    requestTimeout: 3000,
    useAuthenticate: false,
    audiences: ["api", "admin-api"],
  },
  database: {
    url: "mongodb://127.0.0.1:27018",
    options: {
      dbName: "game-service-test-db",
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  gameManagementApiSettings: {
    BASE: "https://l1-proxy.lumigame.com/game-management-service-igt-test",
  },
  promotionApiSettings: {
    baseUrl: "https://l1-proxy.lumigame.com/game-promotion-api-igt-test",
    timeout: 5000,
    useAuthentication: false,
  },
  trackingApiSettings: {
    baseUrl: "https://l1-proxy.lumigame.com/user-tracking-api-igt-test",
  },
  userServiceSettings: {
    url: "https://l1-proxy.lumigame.com/user-service-igt-test",
  },
};
