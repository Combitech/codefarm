"use strict";

/* global describe it before after afterEach */

const { assert } = require("chai");
const getPort = require("get-port");
const { mochaPatch } = require("testsupport");
const rp = require("request-promise");
const GitlabEventEmitter = require("../lib/backends/gitlab/gitlab_event_emitter");
const { Deferred } = require("misc");

mochaPatch();

describe("GitlabBackend", () => {
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

        emitter = new GitlabEventEmitter();
        emitterPort = await getPort();
        await emitter.start(emitterPort);

        sendToEmitter = async (ghType, ghAction, ghData = null) => {
            const theHeader = {};
            theHeader["x-gitlab-event"] = ghType;

            rp.post({
                headers: theHeader,
                url: `http://localhost:${emitterPort}`,
                body: { object_attributes: { action: ghAction, data: ghData } }, // eslint-disable-line camelcase
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

    describe("GitLab event emitter", async () => {
        it("shall emit correct push event on push hook", async () => {
            await sendExpect("Push Hook", null, "push");
        });

        it("shall emit correct merge request events on merge hook", async () => {
            await sendExpect("Merge Request Hook", "open", "merge_request_opened");
            await sendExpect("Merge Request Hook", "update", "merge_request_updated");
            await sendExpect("Merge Request Hook", "close", "merge_request_closed");
            await sendExpect("Merge Request Hook", "abc123", "merge_request_unknown");
        });

        it("shall emit merge_request_unknown on unrecognized merge hook", async () => {
            await sendExpect("Merge Request Hook", "abc123", "merge_request_unknown");
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
