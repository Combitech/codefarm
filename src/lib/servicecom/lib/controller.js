"use strict";

const os = require("os");
const moment = require("moment");
const qs = require("qs");
const { ensureArray } = require("misc");

const ROUTE_WILDCARD = "(.*)";

const instances = {};

class Controller {
    constructor(Type, support = [ "read", "create", "update", "remove", "tag", "ref", "comment" ]) {
        this.Type = Type;
        this.collectionName = this.Type.typeName;
        this.support = support;
        this.routes = [];
        this.methods = {};

        this._addList(this._list);
        this._addCreate(this._create);
        this._addGet(this._get);
        this._addUpdate(this._update);
        this._addRemove(this._remove);

        this._addAction("tag", this._tag);
        this._addAction("untag", this._untag);

        this._addAction("addref", this._addRef);

        this._addAction("comment", this._comment);
        this._addAction("uncomment", this._uncomment);

        this._addAction(ROUTE_WILDCARD, this._invalid, "Invalid action catcher");
        this._addGetter(ROUTE_WILDCARD, this._invalid, "Invalid getter catcher");
    }

    static get instance() {
        if (!instances[this]) {
            instances[this] = new this();
        }

        return instances[this];
    }

    setMb(msgbus) {
        this.msgbus = msgbus;

        this.msgbus.on("data", this._onRequest.bind(this));
    }

    async _respond(message, data, result = "success", status = 200) {
        const response = {
            _id: message._id,
            time: moment().utc().format(),
            type: "response",
            data: data,
            result: result,
            status: status,
            source: {
                hostname: os.hostname(),
                service: this.msgbus.getRoutingKey()
            }
        }

        await this.msgbus.publishRaw(response, message.source.service);
    }

    async _onRequest(message) {
        if (message.type !== "request" || message.data.typeName !== this.collectionName) {
            return;
        }

        try {
            const method = this.methods[message.data.method];

            if (!this.methods[message.data.method]) {
                this._throw("No such method", 400);
            }

            const result = await method(...message.data.params);

            await this._respond(message, result);
        } catch (error) {
            await this._respond(message, error.message, "failure", error.status);
        }
    }

    _addList(handler) {
        handler = handler.bind(this);

        this._addRoute("get", `/${this.collectionName}`, async (ctx) => {
            // TODO: Limit query and read parameters from request
            /* Current idea is to let special commands like limit and such
             * begin with __.
             * Query parameters not beginning with __ is added to the mongo query.
             * For example http://localhost:8080?name=somename will result in
             * setting the mongodb query to { name: somename }
             */
            const query = this._buildFindQuery(ctx);

            const list = await handler(query);

            ctx.type = "json";
            ctx.body = JSON.stringify(list.map((obj) => obj.serialize()), null, 2);
        }, "List objects");

        this.methods.list = handler;
    }

    _addCreate(handler) {
        handler = handler.bind(this);

        this._addRoute("post", `/${this.collectionName}`, async (ctx) => {
            const data = ctx.request.body;

            const obj = await handler(data);

            ctx.set("Location", `/${this.collectionName}/${obj._id}`);
            ctx.status = 201;
            ctx.type = "json";
            ctx.body = JSON.stringify({ result: "success", action: "create", data: obj.serialize() }, null, 2);
        }, "Create object");

        this.methods.create = handler;
    }

    _addGet(handler) {
        handler = handler.bind(this);

        this._addRoute("get", `/${this.collectionName}/:id`, async (ctx, id) => {
            const obj = await handler(id);

            ctx.type = "json";
            ctx.body = JSON.stringify(obj.serialize(), null, 2);
        }, "Get object");

        this.methods.get = handler;
    }

    _addUpdate(handler) {
        handler = handler.bind(this);

        this._addRoute("patch", `/${this.collectionName}/:id`, async (ctx, id) => {
            const data = ctx.request.body;

            const obj = await handler(id, data);

            ctx.type = "json";
            ctx.body = JSON.stringify({ result: "success", action: "update", data: obj.serialize() }, null, 2);
        }, "Update object");

        this.methods.update = handler;
    }

    _addRemove(handler) {
        handler = handler.bind(this);

        this._addRoute("delete", `/${this.collectionName}/:id`, async (ctx, id) => {
            const obj = await handler(id);

            ctx.type = "json";
            ctx.body = JSON.stringify({ result: "success", action: "remove", data: obj.serialize() }, null, 2);
        }, "Remove object");

        this.methods.remove = handler;
    }

    _addAction(name, handler, description = "") {
        handler = handler.bind(this);

        this._addRoute("post", `/${this.collectionName}/:id/${name}`, async (ctx, id) => {
            const data = ctx.request.body;

            const obj = await handler(id, data, ctx);

            ctx.type = "json";
            ctx.body = JSON.stringify({
                result: "success",
                action: name,
                data: obj.serialize ? obj.serialize() : obj
            }, null, 2);
        }, description);

        this.methods[name] = handler;
    }

    _addGetter(name, handler, description = "") {
        handler = handler.bind(this);

        this._addRoute("get", `/${this.collectionName}/:id/${name}`, async (ctx, id) => {
            const obj = await handler(id, ctx);

            // If explicitly returned nothing, then the method has set stuff on ctx itself
            if (obj !== undefined) {
                if (typeof obj !== "object") {
                    ctx.body = obj;
                } else {
                    ctx.type = "json";
                    ctx.body = JSON.stringify(obj, null, 2);
                }
            }
        }, description);

        this.methods[name] = handler;
    }

    _addRoute(method, route, handler, description = "") {
        this.routes.push({
            method: method,
            route: route,
            handler: handler.bind(this),
            description: description,
            priority: route.includes(ROUTE_WILDCARD) ? 999 : 0
        });

        this.routes.sort((a, b) => a.priority - b.priority);
    }

    _buildFindQuery(ctx) {
        const decodedQuery = qs.parse(ctx.query);
        const query = {};
        const skipParseKeys = [ "_id" ];

        const parse = (value, parseAsJson = true) => {
            if (typeof value === "string") {
                try {
                    return parseAsJson ? JSON.parse(value) : value;
                } catch (error) {
                }
            } else if (typeof value === "object") {
                for (const [ k, v ] of Object.entries(value)) {
                    value[k] = parse(v, !skipParseKeys.includes(k));
                }
            }

            return value;
        };

        for (const [ k, v ] of Object.entries(decodedQuery)) {
            if (!k.startsWith("__")) {
                // Ordinary query parameter
                query[k] = v;
            }
        }

        // TODO: This parse is ugly and probably slow
        return parse(query);
    }

    _throw(message, code) {
        const error = message instanceof Error ? message : new Error(message);
        error.status = code;
        throw error;
    }

    _isAllowed(action) {
        if (!this.support.includes(action)) {
            this._throw(`${action} is not allowed`, 501);
        }
    }

    async _getTypeInstance(id) {
        const obj = await this.Type.findOne({ _id: id });

        if (!obj) {
            this._throw(`No ${this.Type.getType()} with id ${id} found`, 404);
        }

        return obj;
    }

    async _validate(event, data) {
        try {
            await this.Type.validateBase(event, data);
            await this.Type.validate(event, data);
        } catch (error) {
            console.error(`Input data validation error on event ${event}`, error);
            console.error(JSON.stringify(data, null, 2));
            this._throw(error, 400);
        }
    }

    async _invalid() {
        this._throw("Unknown getter or action", 400);
    }


    // Basic operations

    async _list(query) {
        this._isAllowed("read");

        return await this.Type.findMany(query);
    }

    async _create(data) {
        this._isAllowed("create");

        await this._validate("create", data);

        if (data._id && await this.Type.findOne({ _id: data._id })) {
            this._throw(`Object with id ${data._id} already exist`, 400);
        }

        return await this.Type.factory(data);
    }

    async _get(id) {
        this._isAllowed("read");

        return await this._getTypeInstance(id);
    }

    async _update(id, data) {
        this._isAllowed("update");

        await this._validate("update", data);

        const obj = await this._getTypeInstance(id);
        obj.set(data);
        await obj.save();

        return obj;
    }

    async _remove(id) {
        this._isAllowed("remove");

        const obj = await this._getTypeInstance(id);
        await obj.remove();

        return obj;
    }


    // Action operations

    async _tag(id, data) {
        this._isAllowed("tag");

        !data.tag && this._throw("No tag supplied", 400);

        const obj = await this._getTypeInstance(id);
        const tags = ensureArray(data.tag);
        await obj.tag(tags);

        return obj;
    }

    async _untag(id, data) {
        this._isAllowed("tag");

        const obj = await this._getTypeInstance(id);
        const tags = ensureArray(data.tag);
        await obj.untag(tags);

        return obj;
    }

    async _addRef(id, data) {
        this._isAllowed("ref");

        !data.ref && this._throw("No ref supplied", 400);

        const obj = await this._getTypeInstance(id);
        const refs = ensureArray(data);
        await obj.addRef(refs);

        return obj;
    }

    async _comment(id, data) {
        this._isAllowed("comment");

        !data.text && this._throw("No text supplied", 400);
        !data.time && this._throw("No time supplied", 400);

        const obj = await this._getTypeInstance(id);
        await obj.comment(data);

        return obj;
    }

    async _uncomment(id, data) {
        this._isAllowed("comment");

        const obj = await this._getTypeInstance(id);
        await obj.uncomment(data.id);

        return obj;
    }
}

module.exports = Controller;
