module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module:react-native-dotenv",
        {
          env: ["EXPO_PUBLIC_KAKAO_REST_API_KEY", "EXPO_PUBLIC_KAKAO_MAP_JS_KEY"],
        },
      ],
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