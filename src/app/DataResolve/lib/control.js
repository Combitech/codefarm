"use strict";

const { serviceMgr } = require("service");
const { notification } = require("typelib");
const singleton = require("singleton");
const Data = require("./types/data");

class Control {
    constructor() {
    }

    async start() {
        const mb = serviceMgr.msgBus;
        const watchlist = await Data.findMany();

        notification.on("data.created", async (dataItem) => {
            watchlist.push(dataItem);
        });

        notification.on("data.updated", async (dataItem) => {
            const index = watchlist.findIndex((d) => d._id === dataItem._id);

            watchlist[index] = dataItem;
        });

        notification.on("data.removed", async (dataItem) => {
            const index = watchlist.findIndex((d) => d._id === dataItem._id);

            watchlist.splice(index, 1);
        });

        mb.on("data", async (data) => {
            const startTs = Date.now();
            const updatedDataItems = [];
            for (const dataItem of watchlist) {
                let needUpdate = false;

                for (const ref of dataItem.watchRefs) {
                    needUpdate = data.type === ref.type && ref.id && (ref.id.constructor === Array ? ref.id.includes(data.typeId) : ref.id === data.typeId);

                    if (needUpdate) {
                        break;
                    }
                }

                if (needUpdate) {
                    await dataItem.resolve({
                        _ref: true,
                        id: data.typeId,
                        type: data.type,
                        name: `event ${data.event}`
                    });
                    await dataItem.save();
                    updatedDataItems.push(dataItem);
                }
            }
            if (updatedDataItems.length > 0) {
                const elapsedMs = Date.now() - startTs;
                serviceMgr.log("verbose", `Updated ${updatedDataItems.length} data items in ${elapsedMs}ms. Triggered by ${data.event}:${data.type}/${data.typeId}`);
            }
        });
    }

    async dispose() {
    }
}

module.exports = singleton(Control);
