const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: "development",
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
        // publicPath: '/',
        historyApiFallback: true,
        inline: false,
        open: true,
        hot: false,
        overlay: false,
        port: 3000
    },
    devtool: "eval-source-map",
    externals: {
        "react": "React",
        "react-dom": "ReactDOM"
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: 'assets', to: 'assets' }
            ]
        })
    ]
};
