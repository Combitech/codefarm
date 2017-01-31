"use strict";

const os = require("os");
const amqp = require("amqplib");
const moment = require("moment");
const { v4: uuid } = require("uuid");
const log = require("log");
const ProviderClient = require("providerclient");

/**
 * Class implementing a message bus on top of RabbitMQ.
 * Extends AsyncEventEmitter and emits the following events:
 * - "connect" - Connected to RabbitMQ exchange and optional queue
 * - "publish" - Published message
 * - "disconnect" - Disconnected from RabbitMQ
 * - "data" - Data received on RabbitMQ queue
 */
class MsgBus extends ProviderClient {
    constructor(config) {
        super(config);

        this.connection = null;
        this.channel = null;
        this.exchange = null;
    }

    static get typeName() {
        return "MsgBus";
    }

    async start() {
        await this.connect();
    }

    async connect() {
        if (this.config.testMode) {
            if (typeof this.config.testPeekEventEmitter === "function") {
                this.config.testPeekEventEmitter(this);
            }
        } else {
            this.connection = await amqp.connect(this.config.uri);
            this.channel = await this.connection.createChannel();

            this.channel.on("close", () => {
                log.verbose(`MsgBus - Channel closed: ${this.config.uri}`);
            });

            this.channel.on("error", (error) => {
                log.error("MsgBus - Channel error: ", error);
            });

            if (this.config.exchange) {
                this.exchange = this.config.exchange;
                await this.channel.assertExchange(this.config.exchange.name, this.config.exchange.type || "topic", this.config.exchange.options || { durable: false });

                if (this.config.queue) {
                    let queue = await this.channel.assertQueue(this.config.queue.name, this.config.queue.options || { exclusive: true, durable: false });

                    queue = await this.channel.bindQueue(queue.queue, this.config.exchange.name, "");

                    // Use previousConsumed promise to serialize execution of
                    // message consumption...
                    let previousConsumed = Promise.resolve();
                    this.channel.consume(queue.queue, (msg) => {
                        previousConsumed = previousConsumed.then(async () => {
                            let content = msg.content;

                            if (msg.properties.contentType === "application/json") {
                                content = JSON.parse(content.toString());
                            }

                            await this.emit("data", content, msg);

                            this.channel.ack(msg);
                        });
                    });
                }
            }
        }

        await this.emit("connect");
    }

    async publish(event) {
        return this._publish(event.type, event.data, event.parentIds);
    }

    /** Publish a message
     * @param {String} type Type of event
     * @param {Object} data Object data
     * @param {Array} parentIds List of parent event ids
     * @return {Object} Published message on success, false if message not published
     */
    async _publish(type, data = {}, parentIds = []) {
        if (!this.config.testMode && (!this.connection || !this.channel || !this.exchange)) {
            return false;
        }

        /* Add mandatory message fields */
        const message = {
            _id: MsgBus.generateId(),
            time: moment().utc().format(),
            type: type,
            data: data,
            parentIds: parentIds,
            source: {
                hostname: os.hostname()
            }
        };

        log.debug("publish", message); // TODO: Remove this, if logging is needed do it in the publish event handler

        return this.publishRaw(message);
    }

    async emitEvent(parentIds, event, type, olddata, newdata) {
        if (!this.config.testMode && (!this.connection || !this.channel || !this.exchange)) {
            return false;
        }

        /* Add mandatory message fields */
        const message = {
            _id: MsgBus.generateId(),
            time: moment().utc().format(),
            event: event,
            type: type,
            typeId: newdata ? newdata._id : olddata._id,
            parentIds: parentIds,
            source: {
                hostname: os.hostname()
            },
            olddata: olddata,
            newdata: newdata
        };

        log.debug("publish", message); // TODO: Remove this, if logging is needed do it in the publish event handler

        return this.publishRaw(message);
    }

    async publishRaw(message) {
        const routingKey = "";
        const opts = {
            contentType: "application/json"
        };

        if (!this.config.testMode) {
            if (!this.channel.publish(this.exchange.name, routingKey, new Buffer(JSON.stringify(message)), opts)) {
                throw new Error(`Channel publish for exchange ${this.exchange.name} failed, the channel's write buffer is full!`);
            }
        }

        await this.emit("publish", message);

        return message;
    }

    static generateId() {
        return uuid();
    }

    async disconnect() {
        if (this.channel) {
            await this.channel.close();
            this.channel = null;
        }

        if (this.connection) {
            await this.connection.close();
            this.connection = null;
        }

        await this.emit("disconnect");
        this.removeAllListeners();
    }

    /**
     * We want to implement the disposable interface
     * @return {undefined}
     */
    async dispose() {
        await this.disconnect();
        await super.dispose();
    }
}

module.exports = MsgBus;
