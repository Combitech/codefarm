
const { Bus } = require("buslib");
const singleton = require("singleton");

class RawClient {
    constructor() {
        this.config = {};
        this.bus = null;
        this.exchangeName = "logs-raw";
        this.queueName = this.exchangeName;
        this.hasCreatedQueue = false;
    }

    async start(config) {
        if (this.bus) {
            throw new Error("Bus already created, please dispose before starting again");
        }

        this.config = config;
        this.bus = new Bus();

        await this.bus.start({
            uri: this.config.uri,
            testMode: this.config.testMode
        });
        await this.bus.assertExchange(this.exchangeName);
    }

    async append(id, time, level, tag, str, lineNr = false) {
        if (!this.bus) {
            throw new Error("No bus created, please run start first");
        }

        const data = {
            _id: id,
            data: {
                time,
                level,
                tag,
                str,
                lineNr
            }
        };

        await this.bus.publish(this.exchangeName, data);
    }

    async subscribe(fn) {
        if (!this.bus) {
            throw new Error("No bus created, please run start first");
        }

        if (!this.hasCreatedQueue) {
            await this.bus.assertQueue(this.exchangeName, this.queueName);
            this.hasCreatedQueue = true;
        }

        this.bus.on("data", async (data) => await fn(data));
    }

    async dispose() {
        if (!this.bus) {
            return;
        }

        await this.bus.dispose();

        this.hasCreatedQueue = false;
        this.bus = null;
    }
}

module.exports = singleton(RawClient);
