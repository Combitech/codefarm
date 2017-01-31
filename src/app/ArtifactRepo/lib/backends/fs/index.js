"use strict";

const path = require("path");
const fs = require("fs-extra-promise");
const send = require("koa-send");

class FsBackend {
    constructor(name, params) {
        this.name = name;
        this.params = params;
    }

    async start() {
    }

    _getRepoPath(repository) {
        return path.join(this.params.path, repository._id);
    }

    _getArtifactPath(repoPath, artifact) {
        /* Assume _id is an uuid-v4 with dashes. Split by dash to
         * limit the number of nodes per directory a little bit... */
        const repPathParts = artifact._id.split("-");
        // Use last part as filename, rest as directory-structure
        const filename = repPathParts.pop();
        const dir = path.join(repoPath, ...repPathParts);
        const absPath = path.join(dir, filename);

        return { absPath, dir, filename };
    }

    async _assertRepo(repoPath, expectExist = true) {
        const exist = await fs.existsAsync(repoPath);
        if (expectExist && !exist) {
            throw new Error("Repository location does not exist");
        } else if (!expectExist && exist) {
            throw new Error("Repository location already exist");
        }
    }

    async createRepo(repository) {
        const repoPath = this._getRepoPath(repository);

        // TODO: Fix possible race, dir might be created between existsAsync and mkdirsAsync
        await this._assertRepo(repoPath, false);

        await fs.mkdirsAsync(repoPath);
    }

    async updateRepo(/* repository */) {
    }

    async removeRepo(repository) {
        const repoPath = this._getRepoPath(repository);

        await this._assertRepo(repoPath);

        await fs.removeAsync(repoPath);
    }

    async uploadArtifact(repository, artifact, fileStream) {
        const repoPath = this._getRepoPath(repository);
        const { absPath: artifactFilePath, dir: artifactDir } = this._getArtifactPath(repoPath, artifact);

        await this._assertRepo(repoPath);

        // TODO: Fix possible race, dir might be created between existsAsync and writeFileAsync
        if (await fs.existsAsync(artifactFilePath)) {
            throw new Error("Artifact already exists");
        }

        await fs.mkdirsAsync(artifactDir);

        const result = {
            storagePath: artifactFilePath
        };

        return new Promise((resolve, reject) => {
            fileStream
                .pipe(fs.createWriteStream(artifactFilePath))
                .on("finish", () => resolve(result))
                .on("error", reject);
        });
    }

    async downloadArtifact(repository, artifact, ctx) {
        const repoPath = this._getRepoPath(repository);
        const { dir: artifactDir, filename: artifactFilename } = this._getArtifactPath(repoPath, artifact);

        await this._assertRepo(repoPath);

        await send(ctx, artifactFilename, {
            root: artifactDir
        });
    }

    async getArtifactReadStream(repository, artifact, ctx) {
        const repoPath = this._getRepoPath(repository);
        const { absPath: artifactFilePath } = this._getArtifactPath(repoPath, artifact);

        await this._assertRepo(repoPath);
        if (!(await fs.existsAsync(artifactFilePath))) {
            ctx.throw("Artifact file doesn't exist", 404);
        }

        return fs.createReadStream(artifactFilePath);
    }

    async removeArtifact(repository, artifact) {
        const repoPath = this._getRepoPath(repository);
        const { absPath: artifactFilePath } = this._getArtifactPath(repoPath, artifact);

        await this._assertRepo(repoPath);

        // TODO: Fix possible race, dir might be created between existsAsync and writeFileAsync
        if (!(await fs.existsAsync(artifactFilePath))) {
            throw new Error("Artifact location doesn't exist");
        }

        await fs.removeAsync(artifactFilePath);
    }

    async dispose() {
    }
}

module.exports = FsBackend;
