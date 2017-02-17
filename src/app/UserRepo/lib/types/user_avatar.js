"use strict";

const AvatarBase = require("./avatar_base");

class UserAvatar extends AvatarBase {
    constructor(data) {
        super(data);
    }

    static get typeName() {
        return "useravatar";
    }
}

module.exports = UserAvatar;
