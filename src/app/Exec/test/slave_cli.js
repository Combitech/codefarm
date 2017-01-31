"use strict";

/* global describe it beforeEach */

const { assert } = require("chai");
const cli = require("../slave_cli/main");
const { AsyncEventEmitter } = require("emitter");

const DEFAULT_ARGV = [ "node", "./cli.js" ];

const buildArgs = (...args) => DEFAULT_ARGV.concat(args);

class ComStub extends AsyncEventEmitter {
    constructor() {
        super();
        this._sentData = [];
        this._requestResponseData = null;
    }

    reset() {
        this._sentData.length = 0;
        this._requestResponseData = null;
    }

    async connect() {
    }

    async disconnect() {
    }

    async request(data, encoding = "json") {
        this._sentData.push(data);
        this.emit("data", data, encoding);

        let ret;
        if (this._requestResponseData) {
            ret = {
                type: "response",
                data: this._requestResponseData
            };
        }

        return ret;
    }

    async getRequestArgs() {
        return new Promise((resolve) => this.once("data", (...args) => resolve(args)));
    }

    async setResponse(data) {
        this._requestResponseData = data;
    }
}

describe("slave_cli", () => {
    beforeEach(() => {
        cli.init();
    });

    describe("without any command", () => {
        it("shall output help", async () => {
            cli.parseArgs(DEFAULT_ARGV);
            const output = await cli.run();
            const lines = output.split("\n");
            assert.isAbove(lines.length, 1);

            // Check that usage string is shown
            assert.match(lines[1], /^\s*Usage: cli/);

            // Check that merge_revision help is shown
            const mergeRevLine = lines.find((str) => str.match(/^\s*merge_revision\s<id>/) !== null);
            assert.isOk(mergeRevLine, "merge_revision help missing");
        });
    });

    describe("command", () => {
        it("merge_revision shall send command to socket and return", async () => {
            const argv = buildArgs("merge_revision", "revision-1");
            cli.parseArgs(argv);

            const comStub = new ComStub();
            const requestArgsPromise = comStub.getRequestArgs();
            const responseData = {
                _id: "response-id"
            };
            comStub.setResponse(responseData);
            const output = await cli.run(comStub);

            // Validate request data
            const [ reqData ] = await requestArgsPromise;
            assert.deepEqual(reqData, {
                type: "cmd",
                action: "revision_merge",
                data: {
                    revisionId: "revision-1"
                }
            });

            // Validate response
            assert.deepEqual(JSON.parse(output), responseData);
        });

        describe("create_artifact", () => {
            it("shall request pre-allocation of artifact", async () => {
                const argv = buildArgs("create_artifact", "art1", "repo1");
                cli.parseArgs(argv);

                const comStub = new ComStub();
                const requestArgsPromise = comStub.getRequestArgs();
                const responseData = {
                    _id: "response-id"

                };
                comStub.setResponse(responseData);
                const output = await cli.run(comStub);

                // Validate request data
                const [ reqData ] = await requestArgsPromise;
                assert.deepEqual(reqData, {
                    type: "cmd",
                    action: "type_create",
                    data: {
                        typeName: "artifactrepo.artifact",
                        data: {
                            name: "art1",
                            repository: "repo1",
                            tags: []
                        }
                    }
                });

                // Validate response
                assert.deepEqual(JSON.parse(output), responseData);
            });
        });

        describe("create_subjob", () => {
            it("shall request create of a test subjob", async () => {
                const argv = buildArgs("create_subjob", "test", "test1", "ongoing");
                cli.parseArgs(argv);

                const comStub = new ComStub();
                const requestArgsPromise = comStub.getRequestArgs();
                const responseData = {
                    _id: "response-id"

                };
                comStub.setResponse(responseData);
                const output = await cli.run(comStub);

                // Validate request data
                const [ reqData ] = await requestArgsPromise;
                assert.deepEqual(reqData, {
                    type: "cmd",
                    action: "type_create",
                    data: {
                        typeName: "exec.subjob",
                        data: {
                            name: "test1",
                            kind: "test",
                            status: "ongoing",
                            tags: []
                        }
                    }
                });

                // Validate response
                assert.deepEqual(JSON.parse(output), responseData);
            });

            it("shall request create of a build subjob with tags", async () => {
                const argv = buildArgs("create_subjob", "-t", "tag1", "-t", "tag2", "build", "build1", "ongoing");
                cli.parseArgs(argv);

                const comStub = new ComStub();
                const requestArgsPromise = comStub.getRequestArgs();
                const responseData = {
                    _id: "response-id"

                };
                comStub.setResponse(responseData);
                const output = await cli.run(comStub);

                // Validate request data
                const [ reqData ] = await requestArgsPromise;
                assert.deepEqual(reqData, {
                    type: "cmd",
                    action: "type_create",
                    data: {
                        typeName: "exec.subjob",
                        data: {
                            name: "build1",
                            kind: "build",
                            status: "ongoing",
                            tags: [ "tag1", "tag2" ]
                        }
                    }
                });

                // Validate response
                assert.deepEqual(JSON.parse(output), responseData);
            });
        });
    });

    describe("output formatter", () => {
        it("json shall return one line of JSON", async () => {
            // Run dummy command, all we care about is the formatting of the response data
            const dummyCmdArgs = [ "merge_revision", "revision-1" ];
            const argv = buildArgs("--format", "json", ...dummyCmdArgs);
            cli.parseArgs(argv);

            const comStub = new ComStub();
            const responseData = {
                _id: "response-id",
                data1: {
                    str: "string",
                    opt: true,
                    arr: [ 1, 2, 3 ]
                },
                arr: [ "first monkey", "second monkey" ]
            };
            comStub.setResponse(responseData);
            const output = await cli.run(comStub);

            // Validate response
            assert.strictEqual(output, JSON.stringify(responseData));
        });

        it("jsonPretty shall return multi-line indented JSON", async () => {
            // Run dummy command, all we care about is the formatting of the response data
            const dummyCmdArgs = [ "merge_revision", "revision-1" ];
            const argv = buildArgs("--format", "jsonPretty", ...dummyCmdArgs);
            cli.parseArgs(argv);

            const comStub = new ComStub();
            const responseData = {
                _id: "response-id",
                data1: {
                    str: "string",
                    opt: true,
                    arr: [ 1, 2, 3 ]
                },
                arr: [ "first monkey", "second monkey" ]
            };
            comStub.setResponse(responseData);
            const output = await cli.run(comStub);

            // Validate response
            assert.strictEqual(output, JSON.stringify(responseData, null, 2));
        });

        it("flatKeyVal shall return a multi-line flat structure", async () => {
            // Run dummy command, all we care about is the formatting of the response data
            const dummyCmdArgs = [ "merge_revision", "revision-1" ];
            const argv = buildArgs("--format", "flatKeyVal", ...dummyCmdArgs);
            cli.parseArgs(argv);

            const comStub = new ComStub();
            const responseData = {
                _id: "response-id",
                data1: {
                    str: "string",
                    opt: true,
                    arr: [ 1, 2, 3 ]
                },
                arr: [ "first monkey", "second monkey" ]
            };
            comStub.setResponse(responseData);
            const output = await cli.run(comStub);

            // Validate response
            const lines = output.split("\n");
            assert.deepEqual(lines, [
                "_id=\"response-id\"",
                "data1_str=\"string\"",
                "data1_opt=true",
                "data1_arr_0=1",
                "data1_arr_1=2",
                "data1_arr_2=3",
                "data1_arr_length=3",
                "arr_0=\"first monkey\"",
                "arr_1=\"second monkey\"",
                "arr_length=2"
            ]);
        });

        it("values shall return one value per line for object results", async () => {
            // Run dummy command, all we care about is the formatting of the response data
            const dummyCmdArgs = [ "merge_revision", "revision-1" ];
            const argv = buildArgs("--format", "values", ...dummyCmdArgs);
            cli.parseArgs(argv);

            const comStub = new ComStub();
            const responseData = {
                _id: "response-id",
                data1: {
                    str: "string"
                },
                arr: [ "first monkey", "second monkey" ],
                val2: "other val"
            };
            comStub.setResponse(responseData);
            const output = await cli.run(comStub);

            // Validate response
            assert.deepEqual(output, [
                "response-id",
                "<Object>",
                "<Array>",
                "other val"
            ].join("\n"));
        });

        it("values shall return one value per line for array results", async () => {
            // Run dummy command, all we care about is the formatting of the response data
            const dummyCmdArgs = [ "merge_revision", "revision-1" ];
            const argv = buildArgs("--format", "values", ...dummyCmdArgs);
            cli.parseArgs(argv);

            const comStub = new ComStub();
            const responseData = [
                "response-id",
                {
                    str: "string"
                },
                [ "first monkey", "second monkey" ],
                "other val"
            ];
            comStub.setResponse(responseData);
            const output = await cli.run(comStub);

            // Validate response
            assert.deepEqual(output, [
                "response-id",
                "<Object>",
                "<Array>",
                "other val"
            ].join("\n"));
        });
    });

    describe("query", () => {
        const responseData = {
            _id: "response-id",
            data1: {
                str: "string",
                opt: true,
                arr: [ 1, 2, 3 ]
            },
            arr: [ "first monkey", "second monkey" ]
        };

        const testQuery = async (queries, engine = "jsonpath") => {
            // Run dummy command, all we care about is the formatting of the response data
            const dummyCmdArgs = [ "merge_revision", "revision-1" ];
            const queryOpts = queries.map((q) => [ "-q", q ]).reduce((a, b) => a.concat(b), []);
            const argv = buildArgs("--format", "values", ...queryOpts, "--queryEngine", engine, ...dummyCmdArgs);
            cli.parseArgs(argv);

            const comStub = new ComStub();
            comStub.setResponse(responseData);
            const output = await cli.run(comStub);
            // console.log(`q: ${JSON.stringify(queries)}, engine: ${engine}, res: ${output}`);

            return output;
        };

        it("jsonpath simple query", async () => {
            const res = await testQuery([ "$._id" ]);
            // Validate response
            assert.strictEqual(res, responseData._id);
        });

        it("jsonpath multiple simple queries", async () => {
            const res = await testQuery([ "$._id", "$.data1.str" ]);
            // Validate response
            assert.strictEqual(res, [
                responseData._id,
                responseData.data1.str
            ].join("\n"));
        });

        it("jsonpath complex array query", async () => {
            const res = await testQuery([ "$.data1.arr[1,2]" ]);
            // Validate response
            assert.strictEqual(res, [
                responseData.data1.arr[1],
                responseData.data1.arr[2]
            ].join("\n"));
        });

        it("jsonpath complex array query", async () => {
            const res = await testQuery([ "$.arr[?(@ === 'first monkey')]" ]);
            // Validate response
            assert.strictEqual(res, responseData.arr[0]);
        });

        it("jsonpath query with object result", async () => {
            const res = await testQuery([ "$.data1" ]);
            // Validate response
            assert.strictEqual(res, "<Object>");
        });

        it("jsonpath query with array result", async () => {
            const res = await testQuery([ "$.arr" ]);
            // Validate response
            assert.strictEqual(res, "<Array>");
        });
    });
});
