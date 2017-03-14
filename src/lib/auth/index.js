"use strict";

const Token = require("./lib/token");
const {
    isTokenValidForAccess,
    validatePrivilegeFormat
} = require("./lib/util");

module.exports = {
    Token,
    isTokenValidForAccess,
    validatePrivilegeFormat
};
