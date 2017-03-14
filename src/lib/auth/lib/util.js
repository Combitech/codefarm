"use strict";

const ACCESS_WILDCARD = "*";

const isTokenValidForAccess = (tokenData, type, accessType = "read", debug = false) => {
    // TODO: The following code allows unauthorized access. Remove when deployed...
    if (!tokenData) {
        return true;
    }

    // Privileges are in format "acc1,acc2:service.type"
    const privileges = (tokenData && tokenData.priv) || [];
    debug && console.log(`isTokenValidForAccess: privileges=${privileges.join(";")}, type=${type}, access=${accessType}`);
    const [ serviceName, typeName ] = type.split(".");
    const myPriv = privileges.filter((priv) => {
        const [ , privType ] = priv.split(":");
        const [ privService, privTypeName ] = privType.split(".");

        let match = false;
        if (privService === ACCESS_WILDCARD) {
            match = true;
        } else if (privService === serviceName) {
            match = (privTypeName === ACCESS_WILDCARD) || (privTypeName === typeName);
        }

        return match;
    });
    // Extract accesses and put one item per access in a list
    const allowedAccessList = myPriv
        // extract acc1,acc2,... and split to list [ "acc1", "acc2", ... ]
        .map((priv) => priv.split(":")[0].split(","))
        // Flatten list
        .reduce((acc, val) => acc.concat(val), []);
    const allowed = allowedAccessList.includes(ACCESS_WILDCARD) || allowedAccessList.includes(accessType);

    if (!allowed) {
        throw new Error(`Access ${accessType}:${type} denied`);
    }

    return true;
};

module.exports = {
    isTokenValidForAccess
};
