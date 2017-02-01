"use strict";

const api = require("api.io");
const { ServiceMgr } = require("service");
const moment = require("moment");

let instance;
const UPDATE_RATE_LIMIT_MS = 1000;

const typeApiExports = api.register("type", {
    get: api.export(async (session, type, query) => {
        const [ serviceId, typeName ] = type.split(".");

        if (!ServiceMgr.instance.has(serviceId)) {
            throw new Error(`No such service, ${serviceId}`);
        }

        const restClient = await ServiceMgr.instance.use(serviceId);

        return await restClient.get(`/${typeName}`, query);
    }),
    getter: api.export(async (session, type, id, getter) => {
        const [ serviceId, typeName ] = type.split(".");

        if (!ServiceMgr.instance.has(serviceId)) {
            throw new Error(`No such service, ${serviceId}`);
        }

        const restClient = await ServiceMgr.instance.use(serviceId);

        return await restClient.get(`/${typeName}/${id}/${getter}`);
    }),
    action: api.export(async (session, type, id, action, data = {}, query = {}) => {
        const [ serviceId, typeName ] = type.split(".");

        if (!ServiceMgr.instance.has(serviceId)) {
            throw new Error(`No such service, ${serviceId}`);
        }

        const restClient = await ServiceMgr.instance.use(serviceId);

        return await restClient.post(`/${typeName}/${id}/${action}`, data, query);
    })
});

class TypeApi {
    constructor() {
        this.exports = typeApiExports;
        this.subscriptions = [];
        this.clients = [];
        this.cache = {};
        this.flushing = false;
    }

    static get instance() {
        if (!instance) {
            instance = new this();
        }

        return instance;
    }

    async start() {
        this.subscriptions.push(api.on("connection", (client) => {
            this.clients.push(client);
            client.session.subscriptions = [];
        }));

        this.subscriptions.push(api.on("disconnection", (client) => {
            const index = this.clients.indexOf(client);

            if (index !== -1) {
                this.clients.splice(index, 1);
            }
        }));

        const mb = await ServiceMgr.instance.msgBus;

        mb.on("data", this.onEvent.bind(this));

        this.flushing = false;
        this.interval = setInterval(() => this.flush(), UPDATE_RATE_LIMIT_MS);
    }

    async sendCached(data) {
        const event = `${data.event}.${data.type}`;
        const eventId = `${event}.${data.typeId}`;
        const payload = {
            olddata: data.olddata,
            newdata: data.newdata
        };

        typeApiExports.emit(event, payload);
        ServiceMgr.instance.log("debug", "Emit event", event, payload);

        typeApiExports.emit(eventId, payload);
        ServiceMgr.instance.log("debug", "Emit event", eventId, payload);
    }

    async flush() {
        this.flushing = true;
        const keys = Object.keys(this.cache);

        for (const key of Object.keys(this.cache)) {
            if (moment().add(UPDATE_RATE_LIMIT_MS, "ms").isAfter(this.cache[key])) {
                const data = this.cache[key];
                delete this.cache[key];

                await this.sendCached(data);
            }
        }

        this.flushing = false;
    }

    async onEvent(data) {
        const fullevent = `${data.event}.${data.type}.${data.typeId}`;

        if (!this.cache[fullevent]) {
            this.cache[fullevent] = {
                cached: moment(),
                event: data.event,
                type: data.type,
                typeId: data.typeId,
                olddata: data.olddata,
                newdata: data.newdata
            };
        } else {
            this.cache[fullevent].newdata = data.newdata;
        }

        await this.flush();
    }

    async dispose() {
        clearInterval(this.interval);
        this.interval = null;

        for (const subscription of this.subscriptions) {
            api.off(subscription);
        }
    }
}

module.exports = TypeApi;
