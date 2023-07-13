const path = require("path");
const EslintPlugin = require("eslint-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

function getStyleLoader(pre) {
  return [
    MiniCssExtractPlugin.loader,
    "css-loader",
    {
      loader: "postcss-loader",
      options: {
        postcssOptions: {
          plugins: ["postcss-preset-env"], //这个预设能解决大部分兼容性问题
        },
      },
    },
    pre,
  ].filter(Boolean);
}

module.exports = {
  //  入口
  entry: "./src/main.js", // 相对路径
  //  出口
  output: {
    //  所有文件的输出路径
    path: path.resolve(__dirname, "../dist"), //    绝对路径
    filename: "static/js/main.js",
    // assetModuleFilename: "static/images/[hash:10][ext][query]",
    clean: true,
  },
  //  加载器 这里叫【module】 别写成loader了
  module: {
    rules: [
      {
        test: /.js$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        /* options: {
          presets: ["@babel/preset-env"],
        }, */
      },
      {
        test: /\.css$/,
        /**
         * use执行顺序从后往前
         * css-loader: 将css资源编译成commonjs的模块插入到js中
         * style-loader: 将js中css通过创建style标签 添加到html文件中生效
         * post-css 处理兼容性问题
         */
        use: getStyleLoader(),
      },
      {
        test: /\.less$/,
        //   loader: 'less-loader'  //  只能使用一个loader
        //    less-loader: 将less编译成css文件
        use: getStyleLoader("less-loader"),
      },
      {
        test: /\.s[ac]ss$/,
        //    sass-loader: 将less编译成css文件
        use: getStyleLoader("sass-loader"),
      },
      {
        test: /\.(JPG|png|jpe?g|gif|webp|svg)$/,
        type: "asset", // 默认把小于8kb资源转base64
        parser: {
          dataUrlCondition: {
            // 小于10kb 转base64 优点：减少请求数量 缺点：体积会变大
            maxSize: 10 * 1024, // 15kb
          },
        },
        generator: {
          filename: "static/images/[hash:10][ext][query]",
        },
      },
      {
        //  处理字体图标、音频、视频
        test: /\.(ttf|woff2?|mp3|mp4|avi)$/,
        type: "asset/resource", // 不会把资源转base64
        generator: {
          filename: "static/media/[hash:10][ext][query]",
        },
      },
    ],
  },
  //  插件
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "../public/index.html"),
    }),
    new EslintPlugin({
      //  检测哪些文件
      context: path.resolve(__dirname, "../src"),
    }),
    new MiniCssExtractPlugin({
      filename: "static/css/[hash:10].css",
    }),
  ],
  optimization: {
    /**
     * 这样配置是代表你使用第三方plugin来压缩代码 所以要额外加上压缩js的plugin
     * CssMinimizerPlugin压缩css
     * TerserPlugin压缩js
     */
    minimizer: [new CssMinimizerPlugin(), new TerserPlugin()],
  },
  /**
   * 开发推荐使用
   * none
   * source-map
   * hidden-source-map
   * nosources-source-map
   */
  devtool: "nosources-source-map",
  /**
   * 模式
   * 生成模式下默认开启html和js的压缩
   */
  mode: "production",
};
