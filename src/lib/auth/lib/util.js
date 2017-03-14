"use strict";

const WILDCARD = "*";
const ACCESS_TYPE_DELIM = ":";
const SERVICE_TYPE_NAME_DELIM = ".";
const ACCESS_DELIM = ",";

// A word represents an access, the service part of type or the type name part of type
const WORD_PATTERN = "(?:\\w+)";
const WILDCARD_PATTERN = `(?:\\${WILDCARD})`;

const ACCESSES_PATTERN = `^(?:${WILDCARD_PATTERN}|(?:${WORD_PATTERN}(?:${ACCESS_DELIM}${WORD_PATTERN})*))$`;
const TYPE_PATTERN = `^(?:${WILDCARD_PATTERN}|(?:${WORD_PATTERN}(?:\\${SERVICE_TYPE_NAME_DELIM}(?:${WILDCARD_PATTERN}|${WORD_PATTERN}))))$`;

const validatePrivilegeFormat = (access, opts = {}) => {
    opts = Object.assign({
        throwOnError: true
    }, opts);
    try {
        const accessTypeParts = access.split(ACCESS_TYPE_DELIM);
        if (accessTypeParts.length !== 2) {
            throw new Error(`expecting only one "${ACCESS_TYPE_DELIM}" to delimit accesses and type`);
        }
        const accesses = accessTypeParts[0];
        const type = accessTypeParts[1];
        if (accesses.length === 0) {
            throw new Error(`expecting accesses before "${ACCESS_TYPE_DELIM}"`);
        }
        if (type.length === 0) {
            throw new Error(`expecting type after "${ACCESS_TYPE_DELIM}"`);
        }
        const accessesRegex = new RegExp(ACCESSES_PATTERN);
        if (!accessesRegex.test(accesses)) {
            throw new Error(`accesses part only allows accesses delimited by "${ACCESS_DELIM}" consisting of word-characters or * wildcard`);
        }
        const typeRegex = new RegExp(TYPE_PATTERN);
        if (!typeRegex.test(type)) {
            throw new Error(`type part only allows service and type name delimited by "${SERVICE_TYPE_NAME_DELIM}" consisting of word-characters or * wildcard`);
        }
    } catch (error) {
        if (opts.throwOnError) {
            throw new Error(`Invalid privilege format "${access}": ${error.message}`);
        }

        return false;
    }

    return true;
};

const isTokenValidForAccess = (tokenDataOrPrivilegeArray, type, access = "read", opts) => {
    opts = Object.assign({
        throwOnError: true,
        debug: false
    }, opts);

    // TODO: The following code allows unauthorized access. Remove when deployed...
    if (!tokenDataOrPrivilegeArray) {
        return true;
    }

    // Privileges are in format "acc1,acc2:service.type"
    let privileges = [];
    if (tokenDataOrPrivilegeArray instanceof Array) {
        privileges = tokenDataOrPrivilegeArray;
    } else if ((typeof tokenDataOrPrivilegeArray === "object") && tokenDataOrPrivilegeArray.priv) {
        privileges = tokenDataOrPrivilegeArray.priv;
    }
    opts.debug && console.log(`isTokenValidForAccess: privileges=${privileges.join(";")}, type=${type}, access=${access}`);
    const [ serviceName, typeName ] = type.split(SERVICE_TYPE_NAME_DELIM);
    const myPriv = privileges.filter((priv) => {
        const [ , privType ] = priv.split(ACCESS_TYPE_DELIM);
        const [ privService, privTypeName ] = privType.split(SERVICE_TYPE_NAME_DELIM);

        let match = false;
        if (privService === WILDCARD) {
            match = true;
        } else if (privService === serviceName) {
            match = (privTypeName === WILDCARD) || (privTypeName === typeName);
        }

        return match;
    });
    // Extract accesses and put one item per access in a list
    const allowedAccessList = myPriv
        // extract acc1,acc2,... and split to list [ "acc1", "acc2", ... ]
        .map((priv) => priv.split(ACCESS_TYPE_DELIM)[0].split(ACCESS_DELIM))
        // Flatten list
        .reduce((acc, val) => acc.concat(val), []);
    const allowed = allowedAccessList.includes(WILDCARD) || allowedAccessList.includes(access);

    if (!allowed && opts.throwOnError) {
        throw new Error(`Access ${access}:${type} denied`);
    }

    return allowed;
};

module.exports = {
    isTokenValidForAccess,
    validatePrivilegeFormat
};
