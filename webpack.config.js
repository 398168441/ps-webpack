const path = require("path");

module.exports = {
  //  入口
  entry: "./src/main.js", // 相对路径
  //  出口
  output: {
    path: path.resolve(__dirname, "dist"), //    绝对路径
    filename: "main.buddle.js",
  },
  //  加载器
  loader: {
    rules: [],
  },
  //  插件
  plugins: [],
  //  模式
  mode: "development", // 默认值是production
};
