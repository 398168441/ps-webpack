module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        useBuiltIns: "usage", // 按需加载自动引入 pollyfill
        corejs: 3,
      },
    ],
  ],
};
