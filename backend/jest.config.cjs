module.exports = {
  testEnvironment: "node",

  preset: "ts-jest/presets/default-esm",

  setupFiles: ["<rootDir>/jest.setup.cjs"],

  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  extensionsToTreatAsEsm: [".ts"],

  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { useESM: true }],
  },

  moduleNameMapper: {
    "^@models/(.*)$": "<rootDir>/src/models/$1",
    "^@routes/(.*)$": "<rootDir>/src/routes/$1",
    "^@services/(.*)$": "<rootDir>/src/services/$1",
    "^@repositories/(.*)$": "<rootDir>/src/repositories/$1",
    "^@middlewares/(.*)$": "<rootDir>/src/middlewares/$1",
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
    "^@config/(.*)$": "<rootDir>/src/config/$1",
    "^@shared/(.*)$": "<rootDir>/src/shared/$1",
  },

  moduleFileExtensions: ["ts", "js", "json", "node"],

  testMatch: ["**/?(*.)+(test).[tj]s"],
};