"use strict";

/* global describe it before after afterEach */

const { assert } = require("chai");
const getPort = require("get-port");
const { mochaPatch } = require("testsupport");
const rp = require("request-promise");
const GitHubEventEmitter = require("../lib/backends/github/github_event_emitter");
const { Deferred } = require("misc");

mochaPatch();

describe("GithubBackend", () => {
    let emitter;
    let emitterPort;
    let sendToEmitter;
    let sendExpect;

    before(async () => {
        process.on("uncaughtException", (error) => {
            console.error("Uncaught exception", error);
            assert(false, `Uncaught exception, error: ${error.message}`);
        });
        process.on("unhandledRejection", (error, promise) => {
            console.error("Unhandled promise rejection", error);
            console.error("Promise", promise);
            assert(false, `Unhandled promise rejection, error: ${error.message}`);
        });

        emitter = new GitHubEventEmitter();
        emitterPort = await getPort();
        await emitter.start(emitterPort);

        sendToEmitter = async (ghType, ghAction, ghData = null) => {
            const theHeader = {};
            theHeader["x-github-event"] = ghType;

            rp.post({
                headers: theHeader,
                url: `http://localhost:${emitterPort}`,
                body: { action: ghAction, data: ghData },
                json: true
            });
        };

        // Send type and action to emitter and expect emit of specific event
        sendExpect = async (ghType, ghAction, expEvent) => {
            const deferred = new Deferred();
            let emitterEvent;
            emitter.addListener(expEvent, async (event) => {
                deferred.resolve();
                emitterEvent = event;

                return deferred.promise;
            });

            await sendToEmitter(ghType, ghAction);
            await deferred.promise;
            assert(deferred.resolved);

            return emitterEvent;
        };
    });

    after(async () => {
        await emitter.dispose();
    });

    // Clear listeners
    afterEach(async () => {
        await emitter.removeAllListeners();
    });

    describe("GitHub event emitter", async () => {
        it("shall emit ping event on ping from GitHub", async () => {
            await sendExpect("ping", null, "ping");
        });

        it("shall emit correct pull_request events on pull_request events", async () => {
            await sendExpect("pull_request", "opened", "pull_request_opened");
            await sendExpect("pull_request", "synchronize", "pull_request_updated");
            await sendExpect("pull_request", "closed", "pull_request_closed");
            await sendExpect("pull_request", "dummy", "pull_request_unknown");
        });

        it("shall emit pull_request_unknown on unrecognized pull request events", async () => {
            await sendExpect("pull_request", "yeehaw", "pull_request_unknown");
        });

        it("shall emit unknown_event on unrecognized pull request events", async () => {
            await sendExpect("unknown", "opened", "unknown_event");
        });

        it("shall emit malformed_event on malformed events", async () => {
            rp.post({
                url: `http://localhost:${emitterPort}`,
                body: {},
                json: true
            });

            const deferred = new Deferred();
            emitter.addListener("malformed_event", async () => {
                deferred.resolve();

                return deferred.promise;
            });

            await deferred.promise;
            assert(deferred.resolved);
        });
    });
});
