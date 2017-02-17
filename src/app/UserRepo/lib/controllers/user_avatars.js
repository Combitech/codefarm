"use strict";

const UserAvatar = require("../types/user_avatar");
const { Controller } = require("servicecom");
const AvatarCtrl = require("./avatar_ctrl");

class UserAvatars extends Controller {
    constructor() {
        super(UserAvatar);
        this.avatarCtrl = new AvatarCtrl(this);

        this._addAction(
            "upload",
            (...args) => this.avatarCtrl.setAvatar(...args),
            "Upload user avatar"
        );
        this._addGetter(
            "avatar",
            (...args) => this.avatarCtrl.getAvatar(...args),
            "Get user avatar"
        );
    }

}

module.exports = UserAvatars;
