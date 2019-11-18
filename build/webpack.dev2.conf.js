var fs = require('fs')
var path = require('path')
var utils = require('./utils')
var webpack = require('webpack')
var config = require('../config')
var merge = require('webpack-merge')
var baseWebpackConfig = require('./webpack.base.conf')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var CopyWebpackPlugin = require('copy-webpack-plugin')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin')
var loadMinified = require('./load-minified')

var env = config.build.env

var webpackConfig = merge(baseWebpackConfig, {
  watch: true,
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000,
    ignored: /node_modules/
  },
  mode: 'development',
  module: {
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap })
  },
  devtool: 'inline-source-map',
  output: {
    path: config.build.assetsRoot,
    filename: utils.assetsPath('js/[name].js'),
    chunkFilename: utils.assetsPath('js/[id].js')
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({ options: {} }),
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    new webpack.DefinePlugin({
      'process.env': env
    }),
    new ExtractTextPlugin({
      filename: utils.assetsPath('[name].[md5:contenthash:hex:15].css')
    }),
    new HtmlWebpackPlugin({
      filename: config.build.index,
      template: 'index.html',
      inject: true,
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      chunksSortMode: 'dependency',
      serviceWorkerLoader: `<script>${loadMinified(path.join(__dirname,
        './service-worker-prod.js'))}</script>`
    }),
    // copy custom static assets
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: config.build.assetsSubDirectory,
        ignore: ['.*']
      }
    ]),
    // service worker caching
    // new SWPrecacheWebpackPlugin({
    //   cacheId: 'my-vue-app',
    //   filename: 'service-worker.js',
    //   staticFileGlobs: ['dist/**/*.{js,html,css}'],
    //   minify: true,
    //   stripPrefix: 'dist/'
    // })
  ]
})


module.exports = webpackConfig
