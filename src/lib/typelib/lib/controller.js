"use strict";

const { ensureArray } = require("misc");
const qs = require("qs");

const instances = {};

class Controller {
    constructor(Type, support = [ "read", "create", "update", "remove", "tag", "ref" ]) {
        this.Type = Type;
        this.collectionName = this.Type.typeName;
        this.support = support;
        this.routes = {};

        this._addRoute(`get/${this.collectionName}`, this._list);
        this._addRoute(`post/${this.collectionName}`, this._create);
        this._addRoute(`get/${this.collectionName}/:id`, this._get);
        this._addRoute(`patch/${this.collectionName}/:id`, this._update);
        this._addRoute(`delete/${this.collectionName}/:id`, this._remove);

        this._addAction("tag", this._tag);
        this._addAction("untag", this._untag);

        this._addAction("addref", this._addRef);
    }

    static get instance() {
        if (!instances[this]) {
            instances[this] = new this();
        }

        return instances[this];
    }

    _addAction(name, handler) {
        this._addRoute(`post/${this.collectionName}/:id/${name}`, handler.bind(this));
    }

    _addGetter(name, handler) {
        this._addRoute(`get/${this.collectionName}/:id/${name}`, handler.bind(this));
    }

    _addRoute(route, handler) {
        this.routes[route] = handler.bind(this);
    }

    _buildFindQuery(ctx) {
        const decodedQuery = qs.parse(ctx.query);
        const query = {};

        const parse = (value) => {
            if (typeof value === "string") {
                try {
                    return JSON.parse(value);
                } catch (error) {
                }
            } else if (typeof value === "object") {
                for (const [ k, v ] of Object.entries(value)) {
                    value[k] = parse(v);
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

    async _list(ctx) {
        if (!this.support.includes("read")) {
            ctx.throw("List not supported", 501);
        }

        // TODO: Limit query and read parameters from request
        /* Current idea is to let special commands like limit and such
         * begin with __.
         * Query parameters not beginning with __ is added to the mongo query.
         * For example http://localhost:8080?name=somename will result in
         * setting the mongodb query to { name: somename }
         */
        const query = this._buildFindQuery(ctx);
        const list = await this.Type.findMany(query);

        ctx.type = "json";
        ctx.body = JSON.stringify(list.map((obj) => obj.serialize()), null, 2);
    }

    async _create(ctx) {
        if (!this.support.includes("create")) {
            ctx.throw("Create not supported", 501);
        }

        try {
            await this.Type.validateBase("create", ctx.request.body);
            await this.Type.validate("create", ctx.request.body);
        } catch (error) {
            console.error("Input data validation error", error);
            console.error(JSON.stringify(ctx.request.body, null, 2));
            error.status = 400;
            throw error;
        }

        if (ctx.request.body._id) {
            const requestedId = ctx.request.body._id;
            if (await this.Type.findOne({ _id: requestedId })) {
                ctx.throw(`Object with id ${requestedId} already exist`, 400);
            }
        }

        const obj = await this.Type.factory(ctx.request.body);

        ctx.set("Location", `/${this.collectionName}/${obj._id}`);
        ctx.status = 201;
        ctx.type = "json";
        ctx.body = JSON.stringify({ result: "success", action: "create", data: obj.serialize() }, null, 2);
    }

    async _getTypeInstance(ctx, id) {
        const obj = await this.Type.findOne({ _id: id });

        if (!obj) {
            ctx.throw(`No ${this.Type.getType()} with id ${id} found`, 404);
        }

        return obj;
    }

    async _get(ctx, id) {
        if (!this.support.includes("read")) {
            ctx.throw("Get not supported", 501);
        }

        const obj = await this._getTypeInstance(ctx, id);

        ctx.type = "json";
        ctx.body = JSON.stringify(obj.serialize(), null, 2);
    }

    async _update(ctx, id) {
        if (!this.support.includes("update")) {
            ctx.throw("Update not supported", 501);
        }

        try {
            await this.Type.validateBase("update", ctx.request.body);
            await this.Type.validate("update", ctx.request.body);
        } catch (error) {
            error.status = 400;
            throw error;
        }

        const obj = await this._getTypeInstance(ctx, id);

        obj.set(ctx.request.body);

        await obj.save();

        ctx.type = "json";
        ctx.body = JSON.stringify({ result: "success", action: "update", data: obj.serialize() }, null, 2);
    }

    async _remove(ctx, id) {
        if (!this.support.includes("remove")) {
            ctx.throw("Remove not supported", 501);
        }

        const obj = await this._getTypeInstance(ctx, id);

        await obj.remove();

        ctx.type = "json";
        ctx.body = JSON.stringify({ result: "success", action: "remove", data: obj.serialize() }, null, 2);
    }

    async _tag(ctx, id) {
        if (!this.support.includes("tag")) {
            ctx.throw("Tag not supported", 501);
        }

        if (!ctx.request.body.tag) {
            ctx.throw("No tag supplied", 400);
        }

        const obj = await this._getTypeInstance(ctx, id);

        const tags = ensureArray(ctx.request.body.tag);
        await obj.tag([], tags);

        ctx.type = "json";
        ctx.body = JSON.stringify({ result: "success", action: "tag", data: obj.serialize() }, null, 2);
    }

    async _untag(ctx, id) {
        if (!this.support.includes("tag")) {
            ctx.throw("Untag not supported", 501);
        }

        const obj = await this._getTypeInstance(ctx, id);
        const tags = ensureArray(ctx.request.body.tag);
        await obj.untag([], tags);

        ctx.type = "json";
        ctx.body = JSON.stringify({ result: "success", action: "untag", data: obj.serialize() }, null, 2);
    }

    async _addRef(ctx, id) {
        if (!this.support.includes("ref")) {
            ctx.throw("Refs not supported", 501);
        }

        if (!ctx.request.body.ref) {
            ctx.throw("No ref supplied", 400);
        }

        const obj = await this._getTypeInstance(ctx, id);

        const refs = ensureArray(ctx.request.body.ref);

        await obj.addRef([], refs);

        ctx.type = "json";
        ctx.body = JSON.stringify({ result: "success", action: "addref", data: obj.serialize() }, null, 2);
    }

}

module.exports = Controller;
