
const { Bus } = require("buslib");
const singleton = require("singleton");

class Client {
    constructor() {
        this.bus = null;
        this.exchangeName = "logs";
        this.queues = [];
    }

    async start(uri) {
        if (this.bus) {
            throw new Error("Bus already created, please dispose before starting again");
        }

        this.bus = new Bus();

        await this.bus.start(uri);
        await this.bus.assertExchange(this.exchangeName);
    }

    async publish(id, data) {
        if (!this.bus) {
            throw new Error("No bus created, please run start first");
        }

        await this.bus.publish(this.exchangeName, data, id);
    }

    async subscribe(id, fn) {
        if (!this.bus) {
            throw new Error("No bus created, please run start first");
        }

        const queueName = `${this.exchangeName}-${id}-${Date.now()}`;

        await this.bus.assertQueue(this.exchangeName, queueName, false, true, id);

        this.queues.push(queueName);

        // TODO: Get some lines from log to start with

        this.bus.on(`data.${queueName}`, async (data) => await fn(data));

        return queueName;
    }

    async unsubscribe(subscription) {
        if (!this.bus) {
            throw new Error("No bus created, please run start first");
        }

        if (!this.queues.includes(subscription)) {
            return false;
        }

        await this.bus.deleteQueue(subscription);

        this.queues = this.queues.filter((q) => q !== subscription);

        return true;
    }

    async dispose() {
        if (!this.bus) {
            return;
        }

        await this.bus.dispose();

        this.bus = null;
        this.queues = true;
    }
}

module.exports = singleton(Client);
