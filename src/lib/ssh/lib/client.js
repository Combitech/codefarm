"use strict";

const fs = require("fs-extra-promise");
const ssh2 = require("ssh2");
const { Deferred } = require("misc");

// TODO: inherit from AsyncEventEmitter instead of taking a handler

class SshClient {
    constructor() {
        this.connected = new Deferred();
        this.disconnected = false;
    }

    async connect(params, handler) {
        this.disconnected = false;

        await this._connect(params, handler);

        if (params.useSftp) {
            this.sftp = await this._getSftp();
        }
    }

    isConnected() {
        return this.connected.promise;
    }

    _connect(params, handler) {
        // Disconnected before we had chance to connect
        if (this.disconnected) {
            return;
        }

        this.client = new ssh2.Client();

        this.client.on("ready", () => {
            this.client.removeListener("error", this.connected.reject);
            this.client.on("error", handler);

            this.connected.resolve();
        });
        this.client.on("error", this.connected.reject);

        this.client.connect(params);

        return this.connected.promise;
    }

    _getSftp() {
        return new Promise((resolve, reject) => {
            const ret = this.client.sftp((error, sftp) => {
                if (error) {
                    return reject(error);
                }

                resolve(sftp);
            });

            if (!ret) {
                reject(new Error("Wait until continue event"));
            }
        });
    }

    execute(command, end) {
        return new Promise((resolve, reject) => {
            this.client.exec(command, (error, stream) => {
                if (error) {
                    return reject(error);
                }

                if (end) {
                    stream.on("close", end);
                }

                resolve({ stdin: stream.stdin, stdout: stream, stderr: stream.stderr });
            });
        });
    }

    upload(localPathOrBuffer, remotePath) {
        const options = { encoding: "utf8" };

        return new Promise((resolve, reject) => {
            const output = this.sftp.createWriteStream(remotePath, options);

            output.on("error", reject);
            output.on("close", resolve);

            if (localPathOrBuffer instanceof Buffer) {
                output.end(localPathOrBuffer);
            } else {
                fs.createReadStream(localPathOrBuffer).pipe(output);
            }
        });
    }

    getRemoteReadStream(remotePath) {
        return this.sftp.createReadStream(remotePath, { encoding: "utf8" });
    }

    mkdir(remotePath) {
        return new Promise((resolve, reject) => {
            this.sftp.mkdir(remotePath, (error) => {
                if (error && error.code !== 4) {
                    return reject(error);
                }

                resolve();
            });
        });
    }

    readdir(remotePath) {
        return new Promise((resolve, reject) => {
            this.sftp.readdir(remotePath, (error, data) => {
                if (error) {
                    return reject(error);
                }

                resolve(data);
            });
        });
    }

    rmdir(remotePath) {
        return new Promise((resolve, reject) => {
            this.client.exec(`rm -rf ${remotePath}`, (error, stream) => {
                if (error) {
                    return reject(error);
                }

                // We must register a listener otherwiese we dont get close
                stream.on("data", () => {});

                stream.on("close", resolve);
            });

            // TODO: rmdir here is not recursive and fails when directory is not empty
            // this.sftp.rmdir(remotePath, (error) => {
            //     if (error) {
            //         return reject(error);
            //     }
            //
            //     resolve();
            // });
        });
    }

    async disconnect() {
        this.disconnected = true;
        if (this.client) {
            this.client.destroy();
            delete this.client;
        }
        this.connected = new Deferred();
    }
}

module.exports = SshClient;
