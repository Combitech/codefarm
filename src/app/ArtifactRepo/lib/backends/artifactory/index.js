"use strict";

const url = require("url");
const { ServiceMgr } = require("service");
const version = require("version");
const Com = require("./com");
const ArtifactoryEventEmitter = require("./artifactory_event_emitter");

const NUM_MS_PER_MINUTE = 60 * 1000;

class ArtifactoryBackend {
    constructor(name, params, RepositoryClass, ArtifactClass) {
        this.name = name;
        this.params = params;
        this.Repository = RepositoryClass;
        this.Artifact = ArtifactClass;
        this.artifactoryEmitter = new ArtifactoryEventEmitter();
        this.com = new Com(params);
    }

    async _createRepoInfo(repository) {
        let newestKnownArtifactEpochMs = 0;
        const repoId = repository._id;
        const latestArtifact = (await this.Artifact.findMany({
            repository: repoId
        }, {
            sort: {
                created: -1
            },
            limit: 1
        }))[0];
        if (latestArtifact) {
            newestKnownArtifactEpochMs = new Date(latestArtifact.backendFileInfo.created).valueOf();
        }
        const emitter = new ArtifactoryEventEmitter(
            this.com,
            repoId,
            this.params.pollInterval * NUM_MS_PER_MINUTE,
            newestKnownArtifactEpochMs
        );

        const repoInfo = {
            _id: repository._id,
            versionScheme: repository.versionScheme,
            filePathRegex: new RegExp(repository.artifactoryFilePathRegex),
            emitter,
            start: async () => {
                await emitter.start();
            },
            dispose: async () => {
                await emitter.dispose();
            }
        };

        emitter.addListener("new-artifact", (artifactInfo) =>
            this._notifyNewArtifact(repoInfo, artifactInfo)
        );

        return repoInfo;
    }

    async start() {
        if (this.params.pollInterval > 0) {
            const reposToWatch = await this.Repository.findMany({
                backend: this.params._id
            });
            // Copy information needed from repo
            this.watchedRepoInfo = [];
            for (const repo of reposToWatch) {
                const repoInfo = await this._createRepoInfo(repo);
                this.watchedRepoInfo.push(repoInfo);
            }

            for (const item of this.watchedRepoInfo) {
                await item.emitter.start();
            }
        } else {
            ServiceMgr.instance.log("warn", "Artifactory backend poll disabled");
        }
    }

    async createRepo(repository) {
        const repoInfo = await this._createRepoInfo(repository);
        this.watchedRepoInfo.push(repoInfo);
    }

    async updateRepo(/* repository */) {
    }

    async removeRepo(repository) {
        const removeIdx = this.watchedRepoInfo.findIndex(
            (item) => item._id === repository._id
        );
        if (removeIdx !== -1) {
            const repoInfo = this.watchedRepoInfo[removeIdx];
            this.watchedRepoInfo.splice(removeIdx, 1);
            await repoInfo.dispose();
        }
    }

    async _notifyNewArtifact(repoInfo, newArtifactInfo) {
        const uriPathname = url.parse(newArtifactInfo.uri).pathname;
        const [ , repoId, filePath ] = uriPathname.match(
            /artifactory\/api\/storage\/([^\/]+)(.*)$/
        );
        let tracePrefix = `Discovered artifact with filepath ${filePath} in repo ${repoId}`;
        if (!repoInfo.filePathRegex.test(filePath)) {
            ServiceMgr.instance.log("warn", `${tracePrefix} doesn't match filePathRegex`);

            return;
        }
        const [ , artName, artVersion ] = repoInfo.filePathRegex.exec(filePath);
        tracePrefix = `Discovered artifact ${artName} ${artVersion} in repo ${repoId}`;

        // Check artifact name
        if ((typeof artName !== "string") || artName.length === 0) {
            ServiceMgr.instance.log("warn", `${tracePrefix} illegal artifact name`);

            return;
        }

        // Check that version format is OK for repo
        const versionGen = version.create(repoInfo.versionScheme);
        if (!artVersion || !versionGen.isValid(artVersion)) {
            ServiceMgr.instance.log("warn", `${tracePrefix} doesn't match repo version scheme ${repoInfo.versionScheme}`);

            return;
        }

        // Check that artifact doesn't already exist
        const existingArtifact = await this.Artifact.findOne({
            name: artName,
            version: artVersion,
            repository: repoInfo._id
        });

        if (existingArtifact && existingArtifact.isCommited()) {
            ServiceMgr.instance.log("verbose", `${tracePrefix} with id ${existingArtifact._id} already exists in commited state`);

            return;
        }

        // Get artifact info
        const artifactInfo = await this.com.request(uriPathname, { json: true });
        if (!artifactInfo) {
            ServiceMgr.instance.log("warn", `${tracePrefix} got no info`);
        }

        let artifact = existingArtifact;
        if (!artifact) {
            // Artifact doesn't exist, create it in created state
            artifact = this.Artifact.construct({
                name: artName,
                version: artVersion,
                repository: repoInfo._id
            });
        }

        artifact.state = "commited";
        artifact.fileMeta = {
            size: artifactInfo.size,
            mimeType: artifactInfo.mimeType,
            hashes: artifactInfo.checksums
        };
        artifact.backendFileInfo = artifactInfo;
        // TODO: It is possible that name + version has been allocated since we checked that it didn't exist above...
        await artifact.save();

        if (existingArtifact) {
            ServiceMgr.instance.log("info", `${tracePrefix} with id ${artifact._id} now commited`);
        } else {
            ServiceMgr.instance.log("info", `${tracePrefix} with id ${artifact._id} created and commited`);
        }
    }

    _getTargetFilePath(repository, artifact) {
        const replaceStrings = {
            ARTIFACT_NAME: artifact.name,
            ARTIFACT_VERSION: artifact.version,
            REPOSITORY_ID: repository._id
        };
        let filePath = repository.artifactoryFilePathTemplate;
        for (const [ key, value ] of Object.entries(replaceStrings)) {
            filePath = filePath.replace(key, value);
        }

        return filePath;
    }

    async uploadArtifact(repository, artifact, fileStream) {
        const path = `artifactory/${repository._id}/${this._getTargetFilePath(repository, artifact)}`;
        const res = await this.com.request(path, {
            method: "PUT",
            body: fileStream
        });

        return Object.assign({}, JSON.parse(res));
    }

    async getArtifactReadStream(repository, artifact) {
        if (!artifact.backendFileInfo ||
            !artifact.backendFileInfo.downloadUri) {
            throw new Error(`Inconsist backendFileInfo for artifact ${artifact._id}`);
        }

        const path = url.parse(artifact.backendFileInfo.downloadUri).pathname;

        return this.com.request(path);
    }

    async removeArtifact(/* repository, artifact */) {
    }

    async dispose() {
    }
}

module.exports = ArtifactoryBackend;
