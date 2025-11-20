export default {
  database: {
    url: "mongodb://localhost:27018",
    options: {
      dbName: "minigame",
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  hostingPort: 5000,
  apiSettings: {
    authUrl: "http://localhost:3000/api/auth",
  },
  authenticateSettings: {
    url: "http://localhost:3000/api/auth",
    audiences: ["http://localhost:5000"],
  },
  gameManagementApiSettings: {
    BASE: "http://localhost:3000/game-management",
  },
  trackingApiSettings: {
    baseUrl: "http://localhost:3000/tracking",
  },
  userServiceSettings: {
    url: "http://localhost:3000/user-service",
  },
  sentry: {
    sentryUrl: "http://localhost:3000/api/sentry",
    logIdentifier: "LudoV",
    env: "LOCAL",
  },
};
