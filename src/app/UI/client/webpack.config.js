"use strict";

const path = require("path");
const webpack = require("webpack");

module.exports = function(options) {
    const isProduction = !(options && options.dev);
    // List of regexes matching modules that shall be transpiled
    const explicitModuleIncludes = [
        /node_modules\/api\.io/
    ];
    const cfg = {
        entry: [
            "babel-polyfill",
            path.join(__dirname, "lib", "client.js")
        ],
        output: {
            path: path.join(__dirname, "static"),
            filename: "bundle.js"
        },
        module: {
            rules: [
                {
                    test: /\.jsx?$/,
                    loader: "babel-loader",
                    /* Include everything under this directory and all paths
                     * matching /managers/<ANYTHING>/client */
                    include: [
                        __dirname,
                        /\/managers\/[^\/]+\/client\//,
                        /\/src\/lib\/[^\/]+\//,
                        ...explicitModuleIncludes
                    ],
                    exclude: (absPath) => {
                        const isNodeModule = /node_modules/.test(absPath);
                        const isExplicitInclude = explicitModuleIncludes
                            .map((re) => re.test(absPath))
                            .filter((m) => m)
                            .length > 0;

                        return isNodeModule && !isExplicitInclude;
                    },
                    query: {
                        cacheDirectory: "babel_cache",
                        presets: [
                            [ require.resolve("babel-preset-es2015"), { "modules": false } ],
                            require.resolve("babel-preset-stage-1"),
                            require.resolve("babel-preset-react") ],
                        plugins: [
                            [ require.resolve("babel-plugin-transform-async-to-module-method"), {
                                "module": "bluebird",
                                "method": "coroutine"
                            } ]
                        ]
                    }
                },
                {
                    test: /\.css$/,
                    use: [
                        {
                            loader: "style-loader"
                        },
                        {
                            loader: "css-loader",
                            options: {
                                modules: true,
                                includePaths: [ path.join(__dirname, "..", "node_modules") ]
                            }
                        }
                    ]
                },
                {
                    test: /\.scss$/,
                    use: [
                        {
                            loader: "style-loader"
                        },
                        {
                            loader: "css-loader",
                            options: {
                                importLoaders: 2,
                                modules: true,
                                localIdentName: "[path]__[name]__[local]",
                                includePaths: [
                                    path.join(__dirname, "..", "node_modules"),
                                    __dirname
                                ]
                            }
                        },
                        {
                            loader: "sass-loader",
                            options: {
                                outputStyle: "expanded",
                                sourceMap: true,
                                sourceMapContents: true,
                                includePaths: [
                                    path.join(__dirname, "..", "node_modules"),
                                    __dirname
                                ]
                            }
                        }
                    ]
                },
                {
                    test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                    use: [
                        {
                            // TODO: Should probably use file-loader but then the files get the wrong mimetype
                            loader: "url-loader",
                            options: {
                                limit: 0,
                                mimetype: "application/font-woff"
                            }
                        }
                    ]
                },
                {
                    test: /\.ttf?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                    use: [
                        {
                            // TODO: Should probably use file-loader but then the files get the wrong mimetype
                            loader: "url-loader",
                            options: {
                                limit: 0,
                                mimetype: "application/octet-stream"
                            }
                        }
                    ]
                },
                {
                    test: /\.eot?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                    use: [
                        {
                            // TODO: Should probably use file-loader but then the files get the wrong mimetype
                            loader: "url-loader",
                            options: {
                                limit: 0,
                                mimetype: "application/vnd.ms-fontobject"
                            }
                        }
                    ]
                },
                {
                    test: /\.svg$/,
                    use: [
                        {
                            loader: "babel-loader",
                            query: {
                                presets: [
                                    require.resolve("babel-preset-es2015"),
                                    require.resolve("babel-preset-react")
                                ]
                            }
                        },
                        {
                            loader: "react-svg-loader",
                            query: {
                                jsx: true
                            }
                        }
                    ]
                }
            ]
        },
        plugins: [],
        resolve: {
            modules: [
                "node_modules",
                path.join(__dirname, "..", "node_modules")
            ],
            alias: {
                "ui-lib": path.join(__dirname, "lib"),
                "ui-observables": path.join(__dirname, "observables"),
                "ui-styles": path.join(__dirname, "styles"),
                "ui-components": path.join(__dirname, "components"),
                "ui-mgr": path.join(__dirname, "..", "lib", "managers")
            }
        },
        /* Declare node modules empty, not present in browser */
        node: {
            fs: "empty",
            net: "empty",
            tls: "empty",
            module: "empty"
        }
    };

    if (isProduction) {
        console.log("webpack.config is production!");

        cfg.plugins.concat([
            new webpack.DefinePlugin({
                "process.env": {
                    "NODE_ENV": "production"
                }
            }),
            new webpack.optimize.DedupePlugin(),
            new webpack.LoaderOptionsPlugin({
                minimize: true,
                debug: false
            }),
            new webpack.optimize.UglifyJsPlugin({
                compress: { warnings: false },
                mangle: true,
                sourceMap: true,
                beautify: false,
                dead_code: true // eslint-disable-line camelcase
            })
        ]);
    } else {
        console.log("webpack.config is development!");

        cfg.plugins.concat([
            new webpack.LoaderOptionsPlugin({
                debug: true
            })

        ]);

        cfg.devtool = "cheap-module-source-map";
        cfg.output.publicPath = "/js";
        cfg.devServer = {
            host: "localhost",
            port: 8080 // Will be changed later when port is known
        };
    }

    /* Add global node_modules directory.
     * Use-case is when building within docker container where all libraries
     * is installed as global modules. */
    if (options && options.global_modules_dir) {
        // eslint-disable-next-line prefer-template
        console.log("webpack.config is using global module directory " +
            options.global_modules_dir);
        cfg.resolve.modules.push(options.global_modules_dir);
    }

    return cfg;
};
