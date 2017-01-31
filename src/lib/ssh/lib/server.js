"use strict";

const path = require("path");
const crypto = require("crypto");
const { exec } = require("child_process");
const fs = require("fs-extra-promise");
const ssh2 = require("ssh2");
const { promisify } = require("bluebird");
const argvParse = require("string-argv");

const execAsync = promisify(exec, { multiArg: true });

// TODO: inherit from AsyncEventEmitter instead of taking a handler
// TODO: Remove console.log's

class SshServer {
    constructor(params, handler, getUsersPublicKeys) {
        this.params = params;
        this.handler = handler;
        this.getUsersPublicKeys = getUsersPublicKeys;
    }

    async start(hostKeys) {
        this.clients = [];
        this.server = new ssh2.Server({
            hostKeys: hostKeys.map((key) => new Buffer(key, "binary"))
        }, this._onClient.bind(this));

        await new Promise((resolve) => {
            this.server.listen(this.params.port, resolve);
        });
    }

    async generateHostKey() {
        const dir = await fs.mkdtempAsync("/tmp/");
        const file = path.join(dir, "key");

        await execAsync(`ssh-keygen -t rsa -N '' -f ${file}`);

        const buffer = await fs.readFileAsync(file);

        return buffer.toString("binary");
    }

    async _authenticate(ctx) {
        if (ctx.method === "publickey") {
            const publicKeys = await this.getUsersPublicKeys(ctx.username);

            for (const pubKey of publicKeys) {
                try {
                    const key = ssh2.utils.genPublicKey(ssh2.utils.parseKey(pubKey));

                    if (ctx.key.algo === key.fulltype && ctx.key.data.compare(key.public) === 0) {
                        if (ctx.signature) {
                            const verifier = crypto.createVerify(ctx.sigAlgo);
                            verifier.update(ctx.blob);

                            if (verifier.verify(key.publicOrig, ctx.signature)) {
                                ctx.accept();
                            } else {
                                ctx.reject();
                            }
                        } else {
                            ctx.accept();
                        }

                        return;
                    }
                } catch (error) {
                    console.error(error);
                    console.error(`Found invalid key for user ${ctx.username}`);
                }
            }
        } else {
            console.log(`Unknown method ${ctx.method}`);
        }

        ctx.reject();
    }

    _onClient(client) {
        console.log("Client connected!");
        this.clients.push(client);

        client.on("authentication", (ctx) => {
            console.log("Client connected");

            this._authenticate(ctx)
            .catch((error) => {
                console.error(error);
                ctx.reject();
            });
        });

        client.on("ready", () => {
            console.log("Client authenticated");

            client.on("session", (accept) => {
                const session = accept();

                session.once("exec", (accept, reject, info) => {
                    console.log("Client wants to execute: ", info);

                    const stream = accept();
                    const argv = argvParse(info.command);

                    this.handler(argv, stream.stdin, stream, stream.stderr, (code) => {
                        stream.exit(code || 0);
                        stream.end();
                    })
                    .catch((error) => {
                        console.error(error);
                        stream.exit(255);
                        stream.end();
                    });
                });
            });
        });

        client.on("end", () => {
            console.log("Client disconnected");
            const clientIndex = this.clients.indexOf(client);
            if (clientIndex !== -1) {
                this.clients.splice(clientIndex, 1);
            }
        });
    }

    async dispose() {
        const serverClosePromise = new Promise((resolve) => {
            this.server.close(resolve);
        });

        // Close all client connections
        for (const client of this.clients) {
            client.end();
        }

        await serverClosePromise;
    }
}

module.exports = SshServer;
