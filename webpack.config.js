const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const dotenv = require('dotenv');
const GHPagesSPAWebpackPlugin = require('ghpages-spa-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const RobotstxtPlugin = require('robotstxt-webpack-plugin').default;
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const path = require('path');

dotenv.config();
const config = {
  api: process.env.API_URL,
  basename: process.env.BASENAME,
  creator: process.env.CREATOR,
  description: process.env.DESCRIPTION,
  domain: process.env.DOMAIN,
  title: process.env.TITLE,
};

console.log(config.api);

const buildPath = path.resolve(__dirname, 'dist');
const modulesPath = path.resolve(__dirname, 'node_modules');
const dataPath = path.resolve(__dirname, 'data');
const srcPath = path.resolve(__dirname, 'client');
const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';

module.exports = {
  mode,
  entry: path.join(srcPath, 'index.js'),
  output: {
    filename: `code/${(mode === 'production' ? '[name].[contenthash]' : '[name]')}.js`,
    globalObject: 'this',
    path: buildPath,
    publicPath: config.basename,
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
  },
  module: {
    rules: [
      ...(mode === 'development' ? [
        {
          test: /\.(js|vue)$/,
          enforce: 'pre',
          loader: 'eslint-loader',
          include: srcPath,
          exclude: modulesPath,
        },
      ] : []),
      {
        test: /\.js$/,
        loader: 'babel-loader',
        options: {
          presets: [
            ['@babel/preset-env', { modules: false }],
          ],
        },
        include: srcPath,
        exclude: [modulesPath, /worker\.js$/],
      },
      {
        test: /worker\.js$/,
        use: [
          {
            loader: 'worker-loader',
            options: {
              inline: true,
              fallback: false,
            },
          },
          {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', { modules: false }],
              ],
            },
          },
        ],
        include: srcPath,
        exclude: modulesPath,
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        include: srcPath,
        exclude: modulesPath,
      },
      {
        test: /\.scss/,
        use: [
          mode === 'production' ? MiniCssExtractPlugin.loader : 'vue-style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 2,
              sourceMap: true,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [autoprefixer({ browsers: ['last 2 versions'] })],
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              outputStyle: 'compressed',
              sourceMap: true,
            },
          },
        ],
        include: srcPath,
        exclude: modulesPath,
      },
      {
        test: /\.(gif|jpg|png|svg|ttf|woff|mp3|ogg)$/,
        loader: 'file-loader',
        options: {
          name: `assets/${(mode === 'production' ? '[hash]' : '[name]')}.[ext]`,
        },
        include: [dataPath, srcPath],
        exclude: modulesPath,
      },
    ],
  },
  devtool: false,
  devServer: { hot: true },
  optimization: {
    minimizer: [
      new UglifyJSPlugin({
        cache: true,
        parallel: true,
        sourceMap: true,
        uglifyOptions: {
          compress: {
            drop_console: true,
          },
        },
      }),
    ],
    runtimeChunk: {
      name: 'manifest',
    },
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all',
        },
      },
    },
  },
  performance: { hints: false },
  stats: { children: false, entrypoints: false, modules: false },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(mode),
      },
      __API__: JSON.stringify(config.api),
      __BASENAME__: JSON.stringify(config.basename),
      __PRODUCTION__: JSON.stringify(mode === 'production'),
    }),
    new HtmlWebpackPlugin({
      config,
      csp: (
        `default-src 'self' ${config.api}`
        + `${mode === 'development' ? " ws://localhost:8080 'unsafe-eval'" : ''};`
        + "img-src 'self' blob:;"
        + `style-src 'self'${mode === 'development' ? " 'unsafe-inline'" : ''};`
        + "worker-src 'self' blob:;"
      ),
      minify: { collapseWhitespace: true },
      template: path.join(srcPath, 'index.ejs'),
    }),
    new VueLoaderPlugin(),
    ...(mode === 'production' ? [
      new webpack.HashedModuleIdsPlugin(),
      new MiniCssExtractPlugin({
        filename: 'code/[name].[contenthash].css',
      }),
      new RobotstxtPlugin({
        policy: [{
          userAgent: '*',
          allow: '/',
        }],
      }),
      new GHPagesSPAWebpackPlugin({
        domain: config.domain,
      }),
      new webpack.SourceMapDevToolPlugin({
        test: /\.js$/,
        filename: 'code/[name].[contenthash].js.map',
        exclude: /(manifest|vendor)/,
      }),
      new webpack.SourceMapDevToolPlugin({
        test: /\.css$/,
        filename: 'code/[name].[contenthash].css.map',
        exclude: 'vendor',
      }),
      ...(process.env.npm_config_report ? ([
        new BundleAnalyzerPlugin(),
      ]) : []),
    ] : [
      new webpack.NamedModulesPlugin(),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.EvalSourceMapDevToolPlugin(),
    ]),
  ],
};
