const common = require('./webpack.common.js');
const { GenerateSW } = require('workbox-webpack-plugin');
const { merge } = require('webpack-merge');
const {InjectManifest} = require('workbox-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
        ],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'public/manifest.json', to: 'manifest.json' },
        { from: 'public/icons', to: 'icons' }
      ],
    }),
    new GenerateSW({
    clientsClaim: true,
    skipWaiting: true,
    runtimeCaching: [
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'images',
          expiration: {
            maxEntries: 50,
          },
        },
      },
      {
        urlPattern: new RegExp('^https://your-api-url.com'),
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'api-cache',
        },
      },
    ],
  }),
  new InjectManifest({
  swSrc: './src/sw.js',
  swDest: 'sw.js',
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024 // 5MB
}),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin(),
  ],
});
