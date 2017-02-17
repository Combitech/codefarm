"use strict";

const AvatarBase = require("./avatar_base");

class TeamAvatar extends AvatarBase {
    constructor(data) {
        super(data);
    }

    static get typeName() {
        return "teamavatar";
    }
}

module.exports = TeamAvatar;
