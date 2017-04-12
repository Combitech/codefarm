"use strict";

const url = require("url");
const rp = require("request-promise");
const { ServiceMgr } = require("service");

class Com {
    constructor(params) {
        this.params = params;
    }

    async request(path, opts = {}, logLevel = "info") {
        const urlInfo = url.parse(this.params.uri);
        let auth;
        if (urlInfo.auth) {
            const [ user, password ] = urlInfo.auth.split(":");
            auth = {
                user,
                password
            };
        }
        const targetUrl = url.format({
            hostname: urlInfo.hostname,
            port: urlInfo.port,
            protocol: urlInfo.protocol,
            pathname: path
        });
        const rpOpts = Object.assign({
            method: "GET",
            url: targetUrl,
            auth
        }, opts);

        ServiceMgr.instance.log(logLevel, `Artifactory REST ${rpOpts.method} ${rpOpts.url}`);

        return rp(rpOpts);
    }

    async dispose() {
    }
}

module.exports = Com;
