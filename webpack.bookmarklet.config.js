const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bookmarklet.bundle.js',
        clean: true
    },
    mode: 'production',
    optimization: {
        minimize: true,
        // 完全禁用代码分割
        splitChunks: false
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['@babel/preset-env', {
                                targets: {
                                    browsers: ['> 1%', 'last 2 versions']
                                }
                            }]
                        ]
                    }
                }
            }
        ]
    },
    resolve: {
        fallback: {
            "buffer": false,
            "crypto": false,
            "fs": false,
            "path": false,
            "stream": false
        }
    },
    target: 'web'
};