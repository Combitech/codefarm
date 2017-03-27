"use strict";

const { ServiceMgr } = require("service");
const path = require("path");
const fs = require("fs-extra-promise");
const readLastLines = require("read-last-lines");

class FsBackend {
    constructor(name, params) {
        this.name = name;
        this.params = params;
    }

    async start() {
    }

    _getBasePath(repository) {
        return path.join(this.params.path, repository._id);
    }

    _getLogPath(repoPath, log) {
        /* Assume _id is an uuid-v4 with dashes. Split by dash to
         * limit the number of nodes per directory a little bit... */
        const repPathParts = log._id.split("-");
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
        const repoPath = this._getBasePath(repository);

        // TODO: Fix possible race, dir might be created between existsAsync and mkdirsAsync
        await this._assertRepo(repoPath, false);

        await fs.mkdirsAsync(repoPath);
    }

    async updateRepo(/* repository */) {
    }

    async removeRepo(repository) {
        const repoPath = this._getBasePath(repository);

        await this._assertRepo(repoPath);

        await fs.removeAsync(repoPath);
    }

    makeFileName(repository, id) {
        return path.join(this._getBasePath(repository), id.replace(/-/g, "/"));
    }

    async saveLog(repository, log) {
        const filename = this.makeFileName(repository, log._id);
        await fs.ensureFileAsync(filename);
    }

    async appendLog(repository, id, data) {
        try {
            await fs.appendFileAsync(this.makeFileName(repository, id), data);
            // TODO: Notify of update somewhere
        } catch (error) {
            ServiceMgr.instance.log("error", `Error when appending to log id = ${id} data = ${data} error = (${error})`);
        }
    }

    async uploadLog(repository, log, fileStream) {
        const repoPath = this._getBasePath(repository);
        const { absPath: logFilePath, dir: logDir } = this._getLogPath(repoPath, log);

        await this._assertRepo(repoPath);

        // Okay not to check for collisions? This is handled at type level in db?

        await fs.mkdirsAsync(logDir);

        const writeStream = fs.createWriteStream(logFilePath);

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
            storagePath: logFilePath
        };
    }

    async getLogReadStream(repository, log) {
        const repoPath = this._getBasePath(repository);
        const { absPath: logFilePath } = this._getLogPath(repoPath, log);

        await this._assertRepo(repoPath);
        if (!(await fs.existsAsync(logFilePath))) {
            const error = new Error("Log file doesn't exist");
            error.status = 404;
            throw error;
        }

        return fs.createReadStream(logFilePath);
    }

    async getLastLines(repository, log, limit) {
        const repoPath = this._getBasePath(repository);
        const { absPath: logFilePath } = this._getLogPath(repoPath, log);

        const data = await readLastLines.read(logFilePath, limit);

        return data.split("\n");
    }

    async removeLog(repository, log) {
        const repoPath = this._getBasePath(repository);
        const { absPath: logFilePath } = this._getLogPath(repoPath, log);

        await this._assertRepo(repoPath);

        // TODO: Fix possible race, dir might be created between existsAsync and writeFileAsync
        if (!(await fs.existsAsync(logFilePath))) {
            throw new Error("Log location doesn't exist");
        }

        await fs.removeAsync(logFilePath);
    }

    async dispose() {
    }
}

module.exports = FsBackend;
