const path = require("path");
const os = require("os");
const EslintPlugin = require("eslint-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const WorkboxPlugin = require("workbox-webpack-plugin");

const threads = os.cpus().length;

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
  //  多入口
  /* entry: {
    app: "./src/app.js",
    main: "./src/main.js",
  }, */
  //  出口
  output: {
    //  所有文件的输出路径
    path: path.resolve(__dirname, "../dist"), //    绝对路径
    filename: "static/js/[name].js",
    chunkFilename: "static/js/[name].js",
    //  图片、字体等 通过type:asset处理的资源的命名方式
    assetModuleFilename: "static/asset/[hash:10][ext][query]",
    clean: true,
  },
  //  加载器 这里叫【module】 别写成loader了
  module: {
    rules: [
      {
        oneOf: [
          {
            test: /.js$/,
            exclude: /node_modules/,
            use: [
              {
                loader: "thread-loader",
                options: {
                  works: threads,
                },
              },
              {
                loader: "babel-loader",
                options: {
                  // presets: ["@babel/preset-env"],
                  cacheDirectory: true,
                  cacheCompression: false,
                  plugins: ["@babel/plugin-transform-runtime"], // 减少打包体积
                },
              },
            ],
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
            /* generator: {
              filename: "static/images/[hash:10][ext][query]",
            }, */
          },
          {
            //  处理字体图标、音频、视频
            test: /\.(ttf|woff2?|mp3|mp4|avi)$/,
            type: "asset/resource", // 不会把资源转base64
            /*  generator: {
              filename: "static/media/[hash:10][ext][query]",
            }, */
          },
        ],
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
      exclude: "node_modules",
      cache: true, //  默认应该开启了缓存
      cacheLocation: path.resolve(
        __dirname,
        "../node_modules/.cache/eslintcache"
      ),
      threads,
    }),
    new MiniCssExtractPlugin({
      filename: "static/css/[name].css",
      chunkFilename: "static/css/[name].chunk.css",
    }),
    new WorkboxPlugin.GenerateSW({
      // 这些选项帮助快速启用 ServiceWorkers
      // 不允许遗留任何“旧的” ServiceWorkers
      clientsClaim: true,
      skipWaiting: true,
    }),
  ],
  optimization: {
    /**
     * 这样配置是代表你使用第三方plugin来压缩代码 所以要额外加上压缩js的plugin
     * CssMinimizerPlugin压缩css
     * TerserPlugin压缩js
     */
    minimizer: [
      //  压缩css
      new CssMinimizerPlugin(),
      //  压缩js
      new TerserPlugin({
        parallel: threads,
      }),
      //  压缩图片
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminGenerate,
          options: {
            plugins: [
              ["gifsicle", { interlaced: true }],
              ["jpegtran", { progressive: true }],
              ["optipng", { optimizationLevel: 5 }],
              [
                "svgo",
                {
                  plugins: [
                    "preset-default",
                    "prefixIds",
                    {
                      name: "sortAttrs",
                      params: {
                        xmlnsOrder: "alphabetical",
                      },
                    },
                  ],
                },
              ],
            ],
          },
        },
      }),
    ],
    splitChunks: {
      chunks: "all",
      // 以下是默认值
      // minSize: 20000, // 分割代码最小的大小
      // minRemainingSize: 0, // 类似于minSize，最后确保提取的文件大小不能为0
      // minChunks: 1, // 至少被引用的次数，满足条件才会代码分割
      // maxAsyncRequests: 30, // 按需加载时并行加载的文件的最大数量
      // maxInitialRequests: 30, // 入口js文件最大并行请求数量
      // enforceSizeThreshold: 50000, // 超过50kb一定会单独打包（此时会忽略minRemainingSize、maxAsyncRequests、maxInitialRequests）
      // cacheGroups: { // 组，哪些模块要打包到一个组
      //   defaultVendors: { // 组名
      //     test: /[\\/]node_modules[\\/]/, // 需要打包到一起的模块
      //     priority: -10, // 权重（越大越高）
      //     reuseExistingChunk: true, // 如果当前 chunk 包含已从主 bundle 中拆分出的模块，则它将被重用，而不是生成新的模块
      //   },
      //   default: { // 其他没有写的配置会使用上面的默认值
      //     minChunks: 2, // 这里的minChunks权重更大
      //     priority: -20,
      //     reuseExistingChunk: true,
      //   },
      // },
      cacheGroups: {
        default: {
          minSize: 0, // 我们定义的文件体积太小了，所以要改打包的最小文件体积
          minChunks: 2, //至少被引用2次数，满足条件才会代码分割
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
    //  一个chunk文件变化 不会导致依赖这个chunk的文件变化
    runtimeChunk: {
      name: (entrypoint) => `runtime~${entrypoint.name}`,
    },
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
