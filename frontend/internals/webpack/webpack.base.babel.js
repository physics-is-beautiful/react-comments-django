/**
 * COMMON WEBPACK CONFIGURATION
 */
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')

const path = require('path')
const webpack = require('webpack')

module.exports = options => ({
  mode: options.mode,
  entry: options.entry,
  externals: options.externals || {},
  output: Object.assign(
    {
      // Compile into js/build.js
      path: path.resolve(process.cwd(), 'build'),
      publicPath: '/',
    },
    options.output,
  ), // Merge with env dependent settings
  optimization: options.optimization,
  module: {
    rules: [
      {
        test: /\.jsx?$/, // Transform all .js and .jsx files required somewhere with Babel
        // exclude: /node_modules/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          // options: {
          //   ignore: ['./node_modules/'],
          // },
          // loader: 'file-loader',
          // options: options.babelQuery,
        },
      },
      {
        // Preprocess our own .css files
        // This is the place to add your own loaders (e.g. sass/less etc.)
        // for a list of loaders, see https://webpack.js.org/loaders/#styling
        test: /\.css$/,
        exclude: /node_modules/,
        use: ['style-loader', 'css-loader'],
      },
      {
        // Preprocess 3rd party .css files located in node_modules
        test: /\.css$/,
        include: /node_modules/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(eot|otf|ttf|woff|woff2)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 1000000,
            },
          },
        ],
        // use: 'file-loader',
        // options: {
        //   limit() {
        //     if (process.env.NODE_ENV === 'development') {
        //       return '[path][name].[ext]'
        //     }
        //
        //     return '[hash].[ext]'
        //   },
        // },
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'svg-url-loader',
            options: {
              // Inline files smaller than 10 kB
              limit: 10 * 1024,
              noquotes: true,
            },
          },
        ],
      },
      {
        test: /\.(jpg|png|gif)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              // Inline files smaller than 10 kB
              limit: 10 * 1024,
            },
          },
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: {
                enabled: false,
                // NOTE: mozjpeg is disabled as it causes errors in some Linux environments
                // Try enabling it in your environment by switching the config to:
                // enabled: true,
                // progressive: true,
              },
              gifsicle: {
                interlaced: false,
              },
              optipng: {
                optimizationLevel: 7,
              },
              pngquant: {
                quality: '65-90',
                speed: 4,
              },
            },
          },
        ],
      },
      {
        test: /\.html$/,
        use: 'html-loader',
      },
      {
        test: /\.(mp4|webm)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
          },
        },
      },
      // not works for me
      // // solution to process.cwd() is not a function for react-markdown/vfile
      // // https://github.com/remarkjs/react-markdown/issues/339#issuecomment-683199835
      // // https://github.com/vfile/vfile/issues/38
      // {
      //   test: /node_modules\/vfile\/core\.js/,
      //   use: [
      //     {
      //       loader: 'imports-loader',
      //       options: {
      //         type: 'commonjs',
      //         imports: ['single process/browser process'],
      //       },
      //     },
      //   ],
      // },
    ],
  },
  plugins: options.plugins.concat([
    // Always expose NODE_ENV to webpack, in order to use `process.env.NODE_ENV`
    // inside your code for any environment checks; Terser will automatically
    // drop any unreachable code.
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
    }),
    new NodePolyfillPlugin(),
  ]),
  resolve: {
    modules: ['node_modules', 'app'],
    extensions: ['.js', '.jsx', '.react.js'],
    mainFields: ['browser', 'jsnext:main', 'main'],
  },
  devtool: options.devtool,
  target: 'web', // Make web variables accessible to webpack, e.g. window
  performance: options.performance || {},
})
