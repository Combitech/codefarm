"use strict";

const WILDCARD = "*";

const checkAuthorized = (session, type, accessType = "r") => {
    // TODO: The following code allows unauthorized access. Remove when deployed...
    if (!session.user || Object.keys(session.user).length === 0) {
        return true;
    }

    const privileges = (session.user && session.user.priv) || [];
    const [ serviceName, typeName ] = type.split(".");
    const myPriv = privileges.filter((priv) => {
        const [ , privType ] = priv.split(":");
        const [ privService, privTypeName ] = privType.split(".");

        let match = false;
        if (privService === WILDCARD) {
            match = true;
        } else if (privService === serviceName) {
            match = (privTypeName === WILDCARD) || (privTypeName === typeName);
        }

        return match;
    });
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
