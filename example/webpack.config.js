var path = require('path')
var webpack = require('webpack')
var HtmlWebPackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: ['babel-polyfill', 'whatwg-fetch', 'core-js/fn/promise', path.resolve(__dirname, './src/main.js')],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader'
        ],
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        options: {
          presets: [
            'babel-preset-env'
          ],
          plugins: [
            require('babel-plugin-transform-object-rest-spread')
          ]
        },
        // exclude: /node_modules/
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader",
            options: { minimize: true }
          }
        ]
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]'
        }
      }
    ]
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      'dadata-js': path.resolve(__dirname, '../lib')
    },
    extensions: ['*', '.js', '.vue', '.json']
  },
  devServer: {
    contentBase: __dirname,
    historyApiFallback: true,
    noInfo: false,
    overlay: true
  },
  performance: {
    hints: false
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: path.resolve(__dirname, './src/index.html')
    }),
  ],
}
