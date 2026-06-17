module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      ["react-native-unistyles/plugin", { root: __dirname }],
      // Reanimated plugin requires react-native-worklets (added in 4.4.x) which
      // is a native module not needed in the Jest environment.
      ...(process.env.NODE_ENV === "test"
        ? []
        : ["react-native-reanimated/plugin"]),
    ],
  };
};
