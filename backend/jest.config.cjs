const { pathsToModuleNameMapper } = require("ts-jest");
const { compilerOptions } = require("./tsconfig.json");

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
    // ts-jest emits ESM-friendly imports with `.js` suffixes during transformation.
    "^(\\.{1,2}/.*)\\.js$": "$1",
    ...pathsToModuleNameMapper(compilerOptions.paths, {
      prefix: "<rootDir>/",
      useESM: true,
    }),
  },

  moduleFileExtensions: ["ts", "js", "json", "node"],

  testMatch: ["**/?(*.)+(test).[tj]s"],
  testPathIgnorePatterns: ["<rootDir>/dist/", "<rootDir>/node_modules/"],
};
