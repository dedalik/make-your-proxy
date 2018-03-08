const path = require("path");

module.exports = {
    target: "node",
    node: {
        __dirname: true,
        __filename: true,
    },
    entry: "./src/index.ts",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "make-your-proxy.js"
    },
    "mode": "development",
    module: {
        rules: [
            {
                test: /\.ts/,
                use: "ts-loader",
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: [ ".ts", ".js" ]
    },
}
