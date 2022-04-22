const webpack = require('webpack');
const convert = require('koa-connect');
const history = require('connect-history-api-fallback');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const commonPaths = require('./paths');
const { envs } = require('./constants');
const path = require('path');
const dotenv = require('dotenv');

module.exports = () => {
  const env = envs[process.env.NODE_ENV || 'development'];
  const envConf = dotenv.config({ path: `.env.${env}` }).parsed;

  const envKeys = Object.keys(envConf).reduce((prev, next) => {
    prev[`process.env.${next}`] = JSON.stringify(envConf[next]);
    return prev;
  }, {});

  return {
    entry: commonPaths.entryPath,
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          loader: 'babel-loader',
          exclude: /(node_modules)/,
          options: {
            presets: ['@babel/react'],
            plugins: [['import', { libraryName: 'antd', style: true }]],
          },
        },
        {
          test: /\.(png|jpg|gif|svg|ico)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                esModule: false,
                outputPath: commonPaths.imagesFolder,
              },
            },
          ],
        },
        {
          test: /\.(woff2|ttf|woff|eot)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                outputPath: commonPaths.fontsFolder,
              },
            },
          ],
        },
        {
          test: /\.(mp3)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                outputPath: commonPaths.soundsFolder,
              },
            },
          ],
        },
      ],
    },
    serve: {
      add: app => {
        app.use(convert(history()));
      },
      content: commonPaths.entryPath,
      dev: {
        publicPath: commonPaths.outputPath,
      },
      open: true,
    },
    resolve: {
      modules: ['src', 'node_modules'],
      extensions: ['*', '.js', '.jsx', '.css', '.scss'],
      alias: {
        src: path.resolve(__dirname, '../src'),
        contracts: path.resolve(__dirname, '../contracts')
      }
    },
    plugins: [
      new webpack.ProgressPlugin(),
      new webpack.DefinePlugin(envKeys),
      new HtmlWebpackPlugin({
        favicon: commonPaths.faviconPath,
        template: commonPaths.templatePath,
      }),
      new ScriptExtHtmlWebpackPlugin({
        defaultAttribute: 'async',
      }),
      new ESLintPlugin({
        extensions: ['js', 'jsx', 'ts', 'tsx'],
        fix: true,
        emitWarning: process.env.NODE_ENV !== 'production',
      }),
    ],
  };
}
