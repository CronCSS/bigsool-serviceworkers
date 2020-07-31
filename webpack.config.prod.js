const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: "production",
    devtool: "source-map",
    entry: {
        bundle: './src/index.tsx',
        serviceworker: './src/serviceWorker.ts'
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
            }
        ]
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: 'assets', to: 'assets' }
            ]
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, './src/index.prod.html'),
            minify: {
                removeComments: true,
                collapseWhitespace: true,
            }
        }),
        new ServiceWorkerWebpackPlugin({
            entry: path.join(__dirname, './src/serviceWorker.ts'),
            filename: 'serviceworker.js'
        })
    ]
};
