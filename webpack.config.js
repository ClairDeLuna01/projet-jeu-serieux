const path = require("path");

module.exports = {
    entry: {
        main: "./src/main.ts",
    },
    mode: "development",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.(png|jpg|gif)$/i,
                use: [
                    {
                        loader: "url-loader",
                        options: {
                            limit: 8192,
                        },
                    },
                ],
                type: "javascript/auto",
            },
            {
                test: /\.json$/,
                loader: path.resolve(__dirname, "webpack.jsonc.loader.js"),
                type: "javascript/auto",
            },
            {
                test: /\.txt$/,
                use: "raw-loader",
            },
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "dist"),
    },
    devServer: {
        static: {
            directory: path.join(__dirname, "dist"),
        },
        compress: true,
        port: 9011,
    },
};
