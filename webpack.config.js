const HTMLWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    content: './src/content.js',
    app: './src/app.js',
  },
  output: {
    filename: '[name].js',
    path: __dirname + '/dist',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HTMLWebpackPlugin({
      template: './src/index.html',
      inject: true,
      chunks: ['app'],
    }),
  ],
};
