const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: './client/src/main.tsx',
    output: {
      path: path.resolve(__dirname, 'dist/public'),
      filename: isProduction ? '[name].[contenthash].js' : '[name].js',
      publicPath: '/',
      clean: true,
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
      alias: {
        '@': path.resolve(__dirname, 'client/src'),
        '@/components': path.resolve(__dirname, 'client/src/components'),
        '@/lib': path.resolve(__dirname, 'client/src/lib'),
        '@/hooks': path.resolve(__dirname, 'client/src/hooks'),
        '@/pages': path.resolve(__dirname, 'client/src/pages'),
        '@assets': path.resolve(__dirname, 'attached_assets'),
      },
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            'postcss-loader',
          ],
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/i,
          type: 'asset/resource',
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './client/index.html',
        inject: true,
      }),
      ...(isProduction
        ? [
            new MiniCssExtractPlugin({
              filename: '[name].[contenthash].css',
            }),
          ]
        : []),
    ],
    devServer: {
      contentBase: path.join(__dirname, 'dist/public'),
      port: 3000,
      hot: true,
      historyApiFallback: true,
      proxy: {
        '/api': 'http://localhost:5000',
      },
    },
    devtool: isProduction ? 'source-map' : 'eval-source-map',
  };
};