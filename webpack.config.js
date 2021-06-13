/* eslint-disable @typescript-eslint/no-var-requires */
const nodeExternals = require("webpack-node-externals");
const CircularDependencyPlugin = require("circular-dependency-plugin");

module.exports = {
    entry: "./src/index.ts",
    output: {
        filename: "index.js",
        libraryTarget: "umd",
        library: "ninjatrader",
        umdNamedDefine: true,
    },
    resolve: {
        extensions: [".ts"],
    },
    target: "node",
    externals: [nodeExternals()],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: ["awesome-typescript-loader", "eslint-loader"],
            },
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
        ],
    },
    devtool: "source-map",
    plugins: [
        new CircularDependencyPlugin({
            exclude: /node_modules/,
            failOnError: true,
            allowAsyncCycles: false,
            cwd: process.cwd(),
        }),
    ],
};
