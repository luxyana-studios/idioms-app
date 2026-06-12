module.exports = {
  preset: "@react-native/jest-preset",
  testMatch: ["**/*.test.ts", "**/*.test.tsx"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(expo|@expo|react-native|@react-native)/)",
  ],
};
