const webpackMerge = require('webpack-merge');
const { envs } = require('./webpack/constants');
const common = require('./webpack/webpack.common');

/* eslint-disable global-require,import/no-dynamic-require */
const env = envs[process.env.NODE_ENV || 'development'];
const envConfig = require(`./webpack/webpack.${env}.js`);
module.exports = webpackMerge(common(), envConfig);
