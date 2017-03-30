"use strict";

const { ServiceMgr } = require("service");
const singleton = require("singleton");
const Stat = require("./types/stat");

class Control {
    async start() {
        const mb = ServiceMgr.instance.msgBus;

        mb.on("data", async (data) => {
            // TODO: Handle remove events
            if (data.event === "created" || data.event === "updated") {
                // Check if any tag of stat-format: stat:SPEC_ID:STAT_ID
                const statTagInfo = data.newdata.tags
                    .filter((tag) => tag.startsWith("stat:"))
                    .map((tag) => {
                        const [ , specId, statId ] = tag.split(":");

                        return { specId, statId };
                    })
                    .filter((tagInfo) => tagInfo.specId && tagInfo.statId);
                if (statTagInfo.length > 0) {
                    // Find existing statIds to update
                    const statIds = statTagInfo.map((item) => item.statId);
                    const existingStats = await Stat.findMany({
                        _id: {
                            $in: statIds
                        }
                    });

                    // Create stat instances for IDs not found
                    const statTagInfoToCreate = statTagInfo.filter((item) =>
                        !existingStats.some((existingStat) => item.statId === existingStat._id)
                    );
                    const statCreateJobs = statTagInfoToCreate.map((item) => Stat.factory({
                        _id: item.statId,
                        specRef: {
                            _ref: true,
                            type: "stat.spec",
                            id: item.specId
                        }
                    }));

                    // Issue update on...
                    const triggerRef = {
                        _ref: true,
                        type: data.type,
                        id: data.typeId,
                        name: data.event
                    };
                    const updateJobs =
                        // existing stat instances
                        existingStats.map((stat) => stat.update(triggerRef, data))
                        // newly created stat instances
                        .concat(statCreateJobs.map((statJob) =>
                            statJob.then((stat) => stat.update(triggerRef, data))
                        ));

                    // Wait all updates completed
                    try {
                        await Promise.all(updateJobs);
                    } catch (error) {
                        ServiceMgr.instance.log("error",
                            `Failed to update stats ${statIds.join(", ")}:`, error
                        );
                    }
                }
            }
        });
    }

    async dispose() {
    }
}

module.exports = singleton(Control);
