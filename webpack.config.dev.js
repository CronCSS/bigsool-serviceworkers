const path = require('path');
const webpack = require("webpack");
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ServiceWorkerWebpackPlugin = require('serviceworker-webpack-plugin')

module.exports = {
    mode: "development",
    entry: {
        bundle: './src/index.tsx',
        // serviceworker: './src/serviceWorker.ts'
    },
    output: {
       path: path.resolve(__dirname, 'public'),
       filename: '[name].js'
   },
    resolve: {
        extensions: [".ts", ".tsx", ".js"]
    },
    module: {
        rules: [
            {
                test: /\.ts(x?)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "ts-loader"
                    }
                ]
            },
            {
                enforce: "pre",
                test: /\.js$/,
                loader: "source-map-loader"
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
               test: /\.(png|svg|jpg|gif)$/,
               use: [
                   'file-loader',
                    ],
            }
        ]
    },
    devServer: {
        contentBase: path.resolve(__dirname, "./public"),
        open: true,
        hot: true
    },
    devtool: "eval-source-map",
    externals: {
        "react": "React",
        "react-dom": "ReactDOM"
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: 'assets', to: 'assets' },
                { from: 'src/manifest.json', to: 'public/manifest.json' }
            ]
        }),
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, './src/index.dev.html')
        }),
        new ServiceWorkerWebpackPlugin({
            entry: path.join(__dirname, './src/serviceWorker.ts'),
            filename: 'serviceworker.js'
        })
    ]
};
