"use strict";

const amqp = require("amqplib");
const { AsyncEventEmitter } = require("emitter");
const { synchronize } = require("misc");

class Bus extends AsyncEventEmitter {
    constructor(synchronized = false) {
        super();

        this.connection = null;
        this.channel = null;

        if (synchronized) {
            synchronize(this, "_handleMessage");
        }
    }

    async start(uri) {
        this.connection = await amqp.connect(uri);
        this.channel = await this.connection.createChannel();

        this.channel.on("close", () => {
            this.emit("close", `Channel closed: ${uri}`);
        });

        this.channel.on("error", (error) => {
            this.emit("error", error);
        });

        await this.emit("connect", uri);

        return uri;
    }

    async assertExchange(name, durable = true) {
        if (!this.channel) {
            throw new Error("Bus must be connected before assertExchange");
        }

        await this.channel.assertExchange(name, "topic", { durable });

        await this.emit("exchange", name);

        return name;
    }

    async assertQueue(exchange, name, durable = true, exclusive = true, routingKey = "") {
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

        await this.emit("queue", name);

        return name;
    }

    async deleteQueue(name) {
        await this.channel.deleteQueue(name);
    }

    async _handleMessage(queue, msg) {
        let content = msg.content;

        if (msg.properties.contentType === "application/json") {
            content = JSON.parse(content.toString());
        }

        await this.emit("data", content);
        await this.emit(`data.${queue}`, content);

        this.channel.ack(msg);
    }

    async publish(exchange, data, routingKey = "", timeout = 0) {
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
