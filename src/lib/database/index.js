"use strict";

const { MongoClient: mongo, Binary } = require("mongodb");
const { v4: uuid } = require("uuid");
const ProviderClient = require("providerclient");

const createMongoMock = async (params) => {
    const MongoMock = require("mongo-mock");
    MongoMock.max_delay = 0; // eslint-disable-line camelcase
    const db = await MongoMock.MongoClient.connect(params.uri);

    // Add methods not implemented by MongoClient
    db.close = async () => {};

    // Add methods not implemented by Collection
    const originalCollectionMethod = db.collection.bind(db);
    db.collection = (...args) => {
        const collection = originalCollectionMethod(...args);
        collection.insertOne = collection.insert;

        return collection;
    };

    return db;
};

class Database extends ProviderClient {
    constructor(config) {
        super(config);

        if (this.config.testMode && !this.config.uri) {
            this.config.uri = "mongodb://nowhere";
        }

        this.config.uri = `${this.config.uri}/${this.config.name}`;
    }

    static get typeName() {
        return "MongoDB";
    }

    async start() {
        await this.connect();
    }

    async connect() {
        if (this.config.testMode) {
            this.db = await createMongoMock(this.config);
        } else {
            this.db = await mongo.connect(this.config.uri);
            this.db.on("error", (...args) => {
                this.emit("error", ...args);
            });
            this.db.on("close", (...args) => {
                this.emit("close", ...args);
            });
            this.db.on("timeout", (...args) => {
                this.emit("timeout", ...args);
            });
        }
        this.connected = true;
    }

    createIndexes(collection, indexes) {
        return this.db.collection(collection).createIndexes(indexes);
    }

    find(collection, query = {}, options = {}) {
        let cursor = this.db.collection(collection).find(query);

        if (options && options.project) {
            cursor = cursor.project(options.project);
        }

        if (options && options.sort) {
            if (this.config.testMode) {
                // TODO: Implement sort
            } else {
                cursor = cursor.sort(options.sort);
            }
        }

        if (options && options.skip) {
            cursor = cursor.skip(options.skip);
        }

        if (options && options.limit) {
            if (this.config.testMode) {
                // TODO: Implement limit
            } else {
                cursor = cursor.limit(options.limit);
            }
        }

        return cursor.toArray();
    }

    findOne(collection, query = {}, options = {}) {
        return this.db.collection(collection).findOne(query, options);
    }

    insertOne(collection, doc, options = {}) {
        return this.db.collection(collection).insertOne(doc, options);
    }

    updateOne(collection, doc, options = {}) {
        const coll = this.db.collection(collection);
        const id = doc._id;

        if (this.config.testMode) {
            // MongoMock does not implement updateOne, fake it
            coll.updateOne = coll.update;
            doc = { $set: doc };
        }

        return this.db.collection(collection).updateOne({ _id: id }, doc, options);
    }

    removeOne(collection, id, options = {}) {
        const coll = this.db.collection(collection);

        if (this.config.testMode) {
            // MongoMock does not implement deleteOne, fake it
            coll.deleteOne = coll.remove;
        }

        return coll.deleteOne({ _id: id }, options);
    }

    remove(collection, query, options = {}) {
        return this.db.collection(collection).deleteMany(query, options);
    }

    drop(collection) {
        return this.db.collection(collection).drop();
    }

    async disconnect() {
        if (this.connected) {
            await this.db.close();
            this.connected = false;
        }
    }

    /**
     * We want to implement the disposable interface
     * @return {undefined}
     */
    async dispose() {
        await this.disconnect();
        await super.dispose();
    }

    generateId() {
        return uuid();
    }
}

const createState = async (db, collection, data) => {
    data = (await db.findOne(collection, { _id: data._id })) || data;

    return new Proxy(data, {
        set: (target, name, value) => {
            target[name] = value;

            db.updateOne(collection, target, { upsert: true })
            .catch((error) => {
                console.error(error);
            });

            return true;
        }
    });
};

const toBinary = (buffer) => new Binary(buffer);

module.exports = Database;
module.exports.createState = createState;
module.exports.toBinary = toBinary;
