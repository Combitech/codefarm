"use strict";

const amqp = require("amqplib");
const { AsyncEventEmitter } = require("emitter");
const { synchronize } = require("misc");

class Bus extends AsyncEventEmitter {
    constructor(synchronized = false) {
        super();

        this.config = {};
        this.connection = null;
        this.channel = null;

        if (synchronized) {
            synchronize(this, "_handleMessage");
        }
    }

    async start(config) {
        this.config = config;

        if (!this.config.testMode) {
            this.connection = await amqp.connect(this.config.uri);
            this.channel = await this.connection.createChannel();

            this.channel.on("close", () => {
                this.emit("close", `Channel closed: ${this.config.uri}`);
            });

            this.channel.on("error", (error) => {
                this.emit("error", error);
            });
        }

        await this.emit("connect", this.config.uri);

        return this.config.uri;
    }

    async assertExchange(name, durable = true) {
        if (!this.config.testMode) {
            if (!this.channel) {
                throw new Error("Bus must be connected before assertExchange");
            }

            await this.channel.assertExchange(name, "topic", { durable });
        }

        await this.emit("exchange", name);

        return name;
    }

    async assertQueue(exchange, name, durable = true, exclusive = true, routingKey = "") {
        if (!this.config.testMode) {
            if (!this.channel) {
                throw new Error("Bus must be connected before assertExchange");
            }

            const queueRef = await this.channel.assertQueue(name, { exclusive, durable, autoDelete: !durable });
            const queue = await this.channel.bindQueue(queueRef.queue, exchange, routingKey);

            this.channel.consume(queue.queue, (msg) => {
                this._handleMessage(name, msg)
                .catch((error) => {
                    this.emit("error", error);
                });
            });
        }

        await this.emit("queue", name);

        return name;
    }

    async deleteQueue(name) {
        if (!this.config.testMode) {
            if (!this.channel) {
                throw new Error("Bus must be connected before assertExchange");
            }

            await this.channel.deleteQueue(name);
        }
    }

    async _handleMessage(queue, msg) {
        let content = msg.content;

        if (msg.properties.contentType === "application/json") {
            content = JSON.parse(content.toString());
        }

        await this.emit("data", content);
        await this.emit(`data.${queue}`, content);

        if (!this.config.testMode) {
            this.channel.ack(msg);
        }
    }

    async publish(exchange, data, routingKey = "", timeout = 0) {
        if (!this.config.testMode) {
            if (!this.channel) {
                throw new Error("Bus must be connected before assertExchange");
            }

            const opts = {
                contentType: "application/json"
            };

            if (timeout) {
                opts.expiration = timeout.toString();
            }

            const content = new Buffer(JSON.stringify(data));

            if (!this.channel.publish(exchange, routingKey, content, opts)) {
                throw new Error("Channel publish failed, the channel's write buffer is full!");
            }
        }

        await this.emit("publish", data);
    }

    async dispose() {
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
}

module.exports = Bus;
