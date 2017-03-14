
const { ServiceComBus } = require("servicecom");
const { Bus } = require("buslib");
const singleton = require("singleton");

class RawClient {
    constructor() {
        this.bus = null;
        this.exchangeName = "logs-raw";
        this.queueName = this.exchangeName;
        this.hasCreatedQueue = false;
    }

    async start(uri) {
        if (this.bus) {
            throw new Error("Bus already created, please dispose before starting again");
        }

        this.bus = new Bus();

        await this.bus.start(uri);
        await this.bus.assertExchange(this.exchangeName);
    }

    async create(name, tags) {
        const client = ServiceComBus.instance.getClient("logrepo");

        return await client.create("logrepo.log", {
            name: name,
            tags: tags
        });
    }

    async append(id, time, level, tag, str) {
        if (!this.bus) {
            throw new Error("No bus created, please run start first");
        }

        const data = {
            _id: id,
            data: {
                time: time,
                level: level,
                tag: tag,
                str: str
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
