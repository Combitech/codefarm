"use strict";

const { ServiceMgr } = require("service");
const { assertProp, StreamConverter } = require("misc");
const { Type } = require("typelib");
const { encodeBinary, decodeBinary } = require("database");

class AvatarBase extends Type {
    constructor(data) {
        super();

        this.data = false;
        this.meta = false;

        if (data) {
            this.set(data);
        }
    }

    static get serviceName() {
        return ServiceMgr.instance.serviceName;
    }

    static async _getDb() {
        return await ServiceMgr.instance.use("db");
    }

    static async _getMb() {
        return ServiceMgr.instance.msgBus;
    }

    static async validate(event, data) {
        assertProp(data, "_id", event === "create");
        assertProp(data, "data", false);
        assertProp(data, "meta", false);
    }

    async setAvatar(fileStream) {
        const fileBuf = await new StreamConverter(fileStream).toBuffer();
        const binData = encodeBinary(fileBuf);

        this.data = binData;
        this.meta = {
            size: fileStream.bytesRead,
            mimeType: fileStream.mimeType,
            path: fileStream.path,
            filename: fileStream.filename,
            fieldname: fileStream.fieldname
        };

        await this.save();
    }

    async getAvatar() {
        if (!this.data) {
            const error = new Error("No avatar uploaded");
            error.status = 404;
            throw error;
        }

        return decodeBinary(this.data);
    }

    getMimeType() {
        return this.meta && this.meta.mimeType;
    }

    getSize() {
        return this.meta && this.meta.size;
    }
}

module.exports = AvatarBase;
