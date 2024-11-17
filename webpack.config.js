const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        index: './src/index.js',
        // test: './src/test.js',
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'demo',
            template: 'src/index.html'
        }),
    ],
    output: {
        path: path.resolve(__dirname, 'dist'),
        chunkFormat: 'commonjs',
        clean: true,
        filename: '[name].bundle.js'
    },
    // mode: "development",
    mode: "production",
    devtool: 'inline-source-map',
    devServer: {
        static: './dist',
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.html$/,
                loader: 'html-loader'
            }
        ]
    }
}