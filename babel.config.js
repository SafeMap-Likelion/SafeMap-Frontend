module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@": "./",
            "@api": "./api",
            "@hooks": "./hooks",
            "@stores": "./stores",
            "@features": "./features",
            "@components": "./components",
            "@constants": "./constants",
            "@lib": "./lib",
          },
        },
      ],
      "react-native-reanimated/plugin", // 반드시 마지막
    ],
  };
};