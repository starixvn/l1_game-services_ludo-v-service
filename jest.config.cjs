module.exports = async () => {
  return {
    rootDir: "./",
    verbose: true,
    transformIgnorePatterns: [
      "node_modules/(?!(sc-base-database|sc-common|sc-game-base|sc-base-apis|sc-api-client|jest-auto-fixture|sc-slot-game-base|axios|sc-game-management-client|nanoid|crypto-random-string|@sc/user-tracking-client|openid-client|oauth4webapi|jose|chance|@rd/ludo-rules)/)",
    ],
    testEnvironment: "node",
    testResultsProcessor: "jest-sonar-reporter",
    transform: {
      "^.+\\.(ts|tsx)$": ["@swc/jest"],
      "^.+\\.(js|jsx)$": ["@swc/jest"],
    },
    moduleNameMapper: {
      "^(\\.{1,2}/.*)\\.js$": "$1",
    },
    extensionsToTreatAsEsm: [".ts"],
  };
};
