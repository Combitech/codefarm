"use strict";

const Auth = require("auth");

const checkAuthorized = (session, type, accessType = "r") => {
    // TODO: The following code allows unauthorized access. Remove when deployed...
    if (!session.user || Object.keys(session.user).length === 0) {
        return true;
    }

    return Auth.isTokenValidForAccess(session.user.tokenData, type, accessType);
};

module.exports = {
    checkAuthorized
};
