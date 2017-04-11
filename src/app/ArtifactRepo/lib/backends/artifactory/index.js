"use strict";

const url = require("url");
const rp = require("request-promise");
const { ServiceMgr } = require("service");

class ArtifactoryBackend {
    constructor(name, params) {
        this.name = name;
        this.params = params;
    }

    async start() {
    }

    async createRepo(/* repository */) {
    }

    async updateRepo(/* repository */) {
    }

    async removeRepo(/* repository */) {
    }

    _getTargetFilePath(artifact) {
        return `${artifact._id}/${artifact.name}-${artifact.version}`;
    }

    async _request(path, opts) {
        const artifactoryUrlInfo = url.parse(this.params.uri);
        let auth;
        if (artifactoryUrlInfo.auth) {
            const [ user, password ] = artifactoryUrlInfo.auth.split(":");
            auth = {
                user,
                password
            };
        }
        const targetUrl = url.format({
            hostname: artifactoryUrlInfo.hostname,
            port: artifactoryUrlInfo.port,
            protocol: artifactoryUrlInfo.protocol,
            pathname: [ "artifactory", path ].join("/")
        });
        const rpOpts = Object.assign({
            method: "GET",
            url: targetUrl,
            auth
        }, opts);

        ServiceMgr.instance.log("info", `Artifactory REST ${rpOpts.method} to ${rpOpts.url}`);

        return rp(rpOpts);
    }

    async uploadArtifact(repository, artifact, fileStream) {
        const path = `${repository._id}/${this._getTargetFilePath(artifact)}`;
        const res = await this._request(path, {
            method: "PUT",
            json: true,
            formData: {
                artifact: fileStream
            }
        });

        return Object.assign({}, res);
    }

    async getArtifactReadStream(/* repository, artifact */) {
    }

    async removeArtifact(/* repository, artifact */) {
    }

    async dispose() {
    }
}

module.exports = ArtifactoryBackend;
