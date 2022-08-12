const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin')
const Skeleton = require("./plugins/MySkeleton")

module.exports = {
    entry: "./index.jsx",
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: "[name].js",
        clean: true
    },
    module: {
        rules: [
            {
                test: /\.jsx$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['@babel/preset-env', { targets: "defaults" }],
                            "@babel/preset-react"
                        ]
                    }
                }
            },
            {
                test: /\.jpg$/,
                type: 'asset/resource'
            }
        ]
    },
    mode: "production",
    plugins: [
        new HtmlWebpackPlugin({
            template: "./index.html"
        }),
        new Skeleton({
            // 输入文件目录
            path: path.resolve(__dirname, "dist"),
            // 服务器端口
            port: 9999,
            // 骨架屏设置
            skeletonStyles: {
                // 按钮的骨架屏配置
                button: {
                    color: '#EFEFEF'
                },
                // 图片的骨架屏配置
                image: {
                    color: '#EFEFEF'
                }
            }
        })
    ]
}
