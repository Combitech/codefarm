"use strict";

/* global describe it */

const { assert } = require("chai");
const { getCmdLineOpts } = require("../index");

describe("CmdLineOpts", () => {
    describe("Option mgmtBus", () => {
        it("should have mgmtBus entry", async () => {
            assert.isTrue("bus" in getCmdLineOpts(), "getCmdLineOpts has property mgmtBus");
        });

        it("should parse URLs to RabbitMQ config correctly", async () => {
            const exchange1 = "someExchange";
            const queue1 = "someQueue";
            const hostPart1 = "amqp://someloc.somehost.com:5672";
            const uri1 = `${hostPart1}/${exchange1}/${queue1}`;
            const cfg1 = getCmdLineOpts().bus.coerce(uri1);
            const cfg1Expected = {
                uri: hostPart1,
                exchange: {
                    name: exchange1,
                    type: "topic",
                    options: {
                        durable: true
                    }
                },
                queue: {
                    name: queue1,
                    durable: true,
                    exclusive: true
                }
            };
            assert.deepEqual(cfg1, cfg1Expected);
        });

        it("should parse URLs without queue to RabbitMQ config correctly", async () => {
            const exchange1 = "someExchange";
            const queue1 = "someQueue";
            const hostPart1 = "amqp://someloc.somehost.com:5672";
            const uri1 = `${hostPart1}/${exchange1}`;
            const cfg1 = getCmdLineOpts({ queueName: queue1 }).bus.coerce(uri1);
            const cfg1Expected = {
                uri: hostPart1,
                exchange: {
                    name: exchange1,
                    type: "topic",
                    options: {
                        durable: true
                    }
                },
                queue: {
                    name: queue1,
                    durable: true,
                    exclusive: true
                }
            };
            assert.deepEqual(cfg1, cfg1Expected);
        });

        it("should parse URLs without exchange to RabbitMQ config correctly", async () => {
            const exchange1 = "someExchange";
            const queue1 = "someQueue";
            const hostPart1 = "amqp://someloc.somehost.com:5672";
            const uri1 = `${hostPart1}/${queue1}`;
            const cfg1 = getCmdLineOpts({ exchangeName: exchange1 }).bus.coerce(uri1);
            const cfg1Expected = {
                uri: hostPart1,
                exchange: {
                    name: exchange1,
                    type: "topic",
                    options: {
                        durable: true
                    }
                },
                queue: {
                    name: queue1,
                    durable: true,
                    exclusive: true
                }
            };
            assert.deepEqual(cfg1, cfg1Expected);
        });

        it("should parse URLs without exchange and queue to RabbitMQ config correctly", async () => {
            const exchange1 = "someExchange";
            const queue1 = "someQueue";
            const hostPart1 = "amqp://someloc.somehost.com:5672";
            const uri1 = `${hostPart1}`;
            const cfg1 = getCmdLineOpts({ exchangeName: exchange1, queueName: queue1 }).bus.coerce(uri1);
            const cfg1Expected = {
                uri: hostPart1,
                exchange: {
                    name: exchange1,
                    type: "topic",
                    options: {
                        durable: true
                    }
                },
                queue: {
                    name: queue1,
                    durable: true,
                    exclusive: true
                }
            };
            assert.deepEqual(cfg1, cfg1Expected);
        });

        it("should require URL to have correct protocol", async () => {
            const url = "http://somehost.com:5672/ex1/q1";
            assert.throws(getCmdLineOpts().bus.coerce.bind(null, url),
                Error, /protocol must be amqp/);
        });

        it("should require URL to have exchange and queue info", async () => {
            const url = "amqp://someloc.somehost.com:5672";
            assert.throws(getCmdLineOpts().bus.coerce.bind(null, url),
                Error, /exchange and queue must be given/);
        });

        it("should require URL to have exchange info", async () => {
            const url = "amqp://someloc.somehost.com:5672/";
            assert.throws(getCmdLineOpts().bus.coerce.bind(null, url),
                Error, /exchange name must be given/);
        });

        it("should require URL to have queue info", async () => {
            const url1 = "amqp://someloc.somehost.com:5672/ex1";
            assert.throws(getCmdLineOpts().bus.coerce.bind(null, url1),
                Error, /queue name must be given/);

            const url2 = `${url1}/`;
            assert.throws(getCmdLineOpts().bus.coerce.bind(null, url2),
                Error, /queue name must be given/);
        });
    });
});
