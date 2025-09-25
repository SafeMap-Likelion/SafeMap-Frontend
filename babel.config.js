module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
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
    ],
  };
};
