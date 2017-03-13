"use strict";

const TeamAvatar = require("../types/team_avatar");
const { Controller } = require("servicecom");
const AvatarCtrl = require("./avatar_ctrl");

class TeamAvatars extends Controller {
    constructor() {
        super(TeamAvatar, Controller.DEFAULT_SUPPORT.concat([ "upload", "avatar" ]));
        this.avatarCtrl = new AvatarCtrl(this);

        this._addAction(
            "upload",
            (...args) => this.avatarCtrl.setAvatar(...args),
            "Upload team avatar"
        );
        this._addGetter(
            "avatar",
            (...args) => this.avatarCtrl.getAvatar(...args),
            "Get team avatar"
        );
    }

}

module.exports = TeamAvatars;
