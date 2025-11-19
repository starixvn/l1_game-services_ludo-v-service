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
    audiences: ["http://localhost:5000"],
  },
  gameManagementApiSettings: {
    BASE: "http://localhost:3000/game-management",
  },
};
