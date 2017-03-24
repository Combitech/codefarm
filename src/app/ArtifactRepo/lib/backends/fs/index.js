"use strict";

const path = require("path");
const fs = require("fs-extra-promise");

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

        const writeStream = fs.createWriteStream(artifactFilePath);

        // Wait until writeStream is open before piping data to it
        // see http://stackoverflow.com/questions/12906694/fs-createwritestream-does-not-immediately-create-file
        await new Promise((resolve, reject) => {
            writeStream
                .on("open", resolve)
                .on("error", reject);
        });

        await new Promise((resolve, reject) => {
            fileStream
                .pipe(writeStream)
                .on("finish", resolve)
                .on("error", (error) => {
                    // Manually close write-stream on error
                    writeStream.end();
                    reject(error);
                });
        });

        return {
            storagePath: artifactFilePath
        };
    }

    async getArtifactReadStream(repository, artifact) {
        const repoPath = this._getRepoPath(repository);
        const { absPath: artifactFilePath } = this._getArtifactPath(repoPath, artifact);

        await this._assertRepo(repoPath);
        if (!(await fs.existsAsync(artifactFilePath))) {
            const error = new Error("Artifact file doesn't exist");
            error.status = 404;
            throw error;
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
