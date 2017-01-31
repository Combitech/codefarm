"use strict";

const Config = require("../types/config");
const { Controller } = require("typelib");
const { ServiceMgr } = require("service");

const ACTIVE_TAG = "active";

class Configs extends Controller {
    constructor() {
        super(Config, [ "read", "create", "tag", "untag" ]);
    }

    /** Called when a Config is tagged and if it is tagged with tag
     * ACTIVE_TAG, then all others who currently have that tag is automatically
     * untagged.
     * @note There exists an intermediate state where two configs might be
     *   tagged with the ACTIVE_TAG since the "tagged" event which onTagged()
     *   subscribes to is fired after the tag save event. So any other config
     *   with the same name will have the ACTIVE_TAG until onTagged() has
     *   completed and removed it.
     *   This is considered harmless since the idea is that services will
     *   subscribe to Config update events and resolve the active config
     *   from those events.
     * @public
     * @param {Config} config Config instance tagged
     * @param {String} tag Tag
     * @return {undefined}
     */
    async onTagged(config, tag) {
        if (tag === ACTIVE_TAG) {
            ServiceMgr.instance.log(
                "verbose",
                `Config ${config._id} with name ${config.name} tagged ${tag}`
            );

            // Remove tag from all other configs with same name
            const query = {
                _id: { $not: { $eq: config._id } },
                name: config.name,
                tags: ACTIVE_TAG
            };
            const list = await this.Type.findMany(query);
            if (list.length > 0) {
                for (const obj of list) {
                    if (obj._id !== config._id) {
                        await obj.untag([], tag);
                        ServiceMgr.instance.log(
                            "verbose",
                            `Found other active config ${obj._id} with name ${obj.name}, untagged ${tag}`
                        );
                    }
                }
            } else {
                ServiceMgr.instance.log(
                    "verbose",
                    `Found no other active config with name ${config.name}`
                );
            }
        }
    }
}

module.exports = Configs;
