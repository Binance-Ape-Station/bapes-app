const path = require('path');

module.exports = {
  root: path.resolve(__dirname, '../'),
  outputPath: path.resolve(__dirname, '../', 'build'),
  entryPath: path.resolve(__dirname, '../', 'src/index.jsx'),
  faviconPath: path.resolve(__dirname, '../', 'src/assets/images/token-logo.png'),
  templatePath: path.resolve(__dirname, '../', 'src/template.html'),
  imagesFolder: 'images',
  fontsFolder: 'fonts',
  cssFolder: 'styles',
  jsFolder: 'js',
  soundsFolder: 'sounds'
};
