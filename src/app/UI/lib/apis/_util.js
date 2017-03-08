"use strict";

const checkAuthorized = (session, type, accessType = "r") => {
    // TODO: The following code allows unauthorized access. Remove when deployed...
    if (!session.user || Object.keys(session.user).length === 0) {
        return true;
    }

    const privileges = (session.user && session.user.priv) || [];
    const myPriv = privileges.filter((priv) => priv.endsWith(`:${type}`));
    const allowedAccessString = myPriv.map((priv) => priv.split(":")[0]).join("");
    const allowed = allowedAccessString.includes(accessType);

    if (!allowed) {
        throw new Error(`Access ${accessType}:${type} denied`);
    }

    return true;
};

module.exports = {
    checkAuthorized
};
