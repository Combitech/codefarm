"use strict";

const { ServiceMgr } = require("service");

const CHAR_FIELD_OP_SEP = ":";

class StatData {
    constructor(collectionName) {
        this._collection = collectionName;
    }

    async add(triggerRef, value) {
        const db = await ServiceMgr.instance.use("db");
        const data = Object.assign({
            _id: db.generateId(),
            collected: new Date(),
            triggerRef
        }, value);

        await db.insertOne(this._collection, data);

        return data;
    }

    async destroy() {
        const db = await ServiceMgr.instance.use("db");

        return db.drop(this._collection);
    }

    async calcCharacteristics(fields, opts) {
        const pipeline = [];

        if (opts.match) {
            pipeline.push({ $match: opts.match });
        }
        if (opts.sort) {
            pipeline.push({ $sort: opts.sort });
        }
        if (opts.limit) {
            pipeline.push({ $limit: opts.limit });
        }

        const group = {
            _id: null
        };
        for (const field of fields) {
            const fieldExp = `\$${field}`;
            group[`${field}${CHAR_FIELD_OP_SEP}min`] = { $min: fieldExp };
            group[`${field}${CHAR_FIELD_OP_SEP}max`] = { $max: fieldExp };
            group[`${field}${CHAR_FIELD_OP_SEP}avg`] = { $avg: fieldExp };
            group[`${field}${CHAR_FIELD_OP_SEP}sum`] = { $sum: fieldExp };
            group[`${field}${CHAR_FIELD_OP_SEP}stdDevPop`] = { $stdDevPop: fieldExp };
            group[`${field}${CHAR_FIELD_OP_SEP}stdDevSamp`] = { $stdDevSamp: fieldExp };

            // Note! Count counts the number of documents in group, not that has field
            group[`${field}${CHAR_FIELD_OP_SEP}cnt`] = { $sum: 1 };
        }
        pipeline.push({ $group: group });

        const db = await ServiceMgr.instance.use("db");
        const chars = await db.aggregate(this._collection, pipeline);

        // Transform result from flat object with keys of format field:op
        // to array of format [ { id: field1, op1: valX, op2: valY, ... }, { id: field2, ... } ]
        const resPerField = {};
        for (const char of chars) {
            for (const [ key, val ] of Object.entries(char)) {
                if (key.includes(CHAR_FIELD_OP_SEP)) {
                    const [ field, op ] = key.split(CHAR_FIELD_OP_SEP);
                    resPerField[field] = resPerField[field] || {};
                    resPerField[field][op] = val;
                }
            }
        }

        const res = [];
        for (const [ key, val ] of Object.entries(resPerField)) {
            val.id = key;
            res.push(val);
        }

        return res;
    }

    async getSamples(fields, opts) {
        const project = { _id: 1, collected: 1 };
        fields.forEach((field) => project[field] = 1);
        const db = await ServiceMgr.instance.use("db");

        return await db.find(this._collection, {}, {
            project,
            sort: opts.sort,
            limit: opts.limit
        });
    }
}

module.exports = StatData;
