"use strict";

const os = require("os");
const path = require("path");
const net = require("net");
const { exec, spawn } = require("child_process");
const fs = require("fs-extra-promise");
const moment = require("moment");
const { promisify } = require("bluebird");
const { SshServer } = require("ssh");
const { Deferred } = require("misc");
const { ServiceComBus } = require("servicecom");
const GitIntercept = require("./git_intercept");

const execAsync = promisify(exec, { multiArgs: true });

const README = `To configure your clone correctly please run:
  git config remote.origin.push 'HEAD:refs/for/master'
  cp .hooks/commit-msg .git/hooks/
`;

class GitBackend {
    constructor(id, backend, Repository, Revision) {
        this.id = id;
        this.backend = backend;
        this.locks = {};
        this.Repository = Repository;
        this.Revision = Revision;

        this.server = new SshServer({
            port: this.backend.port
        }, this._clientCommandHandler.bind(this), this._getUserPublicKeys.bind(this));
    }

    async start() {
        if (this.backend.hostPrivateKeys.length === 0) {
            this.backend.hostPrivateKeys = this.backend.hostPrivateKeys.concat(await this.server.generateHostKey());

            // TODO: save triggers an "updated" event on coderepo.backend which prints an error trace
            // Could we move generation to backend type to get rid of this?
            await this.backend.save();
        }

        const repos = await this.Repository.findMany({ backend: this.id });

        for (const repository of repos) {
            this._writeHooks(repository);
        }

        await this.server.start(this.backend.hostPrivateKeys);
    }

    async validateRepository(/* event, data */) {
        // TODO: Validate git specific options
    }

    async create(repository) {
        const repoPath = path.join(this.backend.path, repository._id);
        const commitMsgHookPath = path.join(__dirname, "hooks", "commit-msg");

        if (await fs.existsAsync(repoPath)) {
            throw new Error("Repository location already exists");
        }

        await fs.mkdirsAsync(repoPath);
        const tmpPath = await fs.mkdtempAsync("/tmp/CodeRepo-");
        const clonePath = path.join(tmpPath, "clone");
        const commitMsgHookClonePath = path.join(clonePath, ".hooks", "commit-msg");

        await execAsync(`git init --shared --bare ${repoPath}`);

        await execAsync(`git clone ${repoPath} ${clonePath}`);
        await fs.copyAsync(commitMsgHookPath, commitMsgHookClonePath);
        await fs.chmodAsync(commitMsgHookClonePath, "755");
        await fs.outputFileAsync(path.join(clonePath, "README"), README);
        await execAsync("git add README .hooks", { cwd: clonePath });
        await execAsync("git commit -m \"Initial commit\"", { cwd: clonePath });
        await execAsync("git push", { cwd: clonePath });

        await fs.removeAsync(tmpPath);

        await this._writeHooks(repository);
    }

    async _writeHooks(repository) {
        const sourcePath = path.join(__dirname, "hooks");
        const targetPath = path.join(this.backend.path, repository._id, "hooks");

        await this._writeHook(sourcePath, targetPath, "pre-receive");
        await this._writeHook(sourcePath, targetPath, "update");
        await this._writeHook(sourcePath, targetPath, "post-receive");
        await this._writeHook(sourcePath, targetPath, "post-update");
    }

    async _writeHook(sourcePath, targetPath, name) {
        const source = path.join(sourcePath, name);
        const target = path.join(targetPath, name);

        await fs.copyAsync(source, target);
        await fs.chmodAsync(target, "755");
    }

    async update(/* repository */) {

    }

    async remove(repository) {
        const repoPath = path.join(this.backend.path, repository._id);

        if (!(await fs.existsAsync(repoPath))) {
            throw new Error("Repository location does not exist");
        }

        await fs.removeAsync(repoPath);
    }

    async _getUserPublicKeys(username) {
        const client = ServiceComBus.instance.getClient("userrepo");

        return client.keys("user", username);
    }

    async _clientCommandHandler(argv, stdin, stdout, stderr, end) {
        const [ app, repoName ] = argv;
        const allowedApps = [ "git-upload-pack", "git-receive-pack" ];

        if (!allowedApps.includes(app) || !path.isAbsolute(repoName)) {
            console.error("Client requested illegal command", app, repoName);

            end(255);

            return;
        }

        const name = repoName.slice(1);
        const repository = await this.Repository.findOne({ _id: name });
        const deferred = new Deferred();

        this.locks[name] = this.locks[name] || Promise.resolve();

        const lock = this.locks[name];
        this.locks[name] = deferred.promise;

        return lock
        .then(() => this._executeClientCommand(repository, app, stdin, stdout, stderr))
        .then((code) => {
            this._resetHead(repository)
            .then(() => {
                end(code);
                deferred.resolve();
            });
        })
        .catch((error) => {
            console.error(error);

            this._resetHead(repository)
            .then(() => {
                end(255);
                deferred.resolve();
            });
        });
    }

    async _resetHead(repository) {
        const repoPath = path.join(this.backend.path, repository._id);
        await execAsync("git symbolic-ref HEAD refs/heads/master", { cwd: repoPath });
    }

    async merge(repository, revision) {
        // TODO: Do we need to use the lock here as well?

        const repoPath = path.join(this.backend.path, repository._id);
        const tmpPath = await fs.mkdtempAsync("/tmp/CodeRepo-");
        const patch = revision.patches[revision.patches.length - 1];

        await execAsync(`git clone ${repoPath} ${tmpPath}`);
        await execAsync(`git fetch origin ${patch.change.refname}`, { cwd: tmpPath });
        await execAsync("git checkout -b tomerge FETCH_HEAD", { cwd: tmpPath });
        await execAsync("git rebase master", { cwd: tmpPath });
        await execAsync("git checkout master", { cwd: tmpPath });
        await execAsync("git merge tomerge", { cwd: tmpPath });
        await fs.moveAsync(path.join(repoPath, "hooks"), path.join(repoPath, "hooks.bak"));
        await execAsync("git push", { cwd: tmpPath });
        await fs.moveAsync(path.join(repoPath, "hooks.bak"), path.join(repoPath, "hooks"));
        await fs.removeAsync(tmpPath);

        const [ newrev ] = await execAsync("git rev-parse HEAD", { cwd: repoPath });
        const [ oldrev ] = await execAsync("git rev-parse HEAD^", { cwd: repoPath });

        newrev.replace("\n", "");
        oldrev.replace("\n", "");

        const info = await this._getBasicInfo(repository, newrev);

        return {
            index: revision.patches.length + 1,
            email: info.email,
            name: info.name,
            submitted: moment.unix(info.timestamp).utc().format(),
            comment: info.comment,
            change: {
                oldrev: oldrev,
                newrev: newrev,
                refname: "refs/head/master"
            }
        };
    }

    async getUri(backend, repository) {
        return `ssh://$USER@${os.hostname()}:${backend.port}/${repository._id}`;
    }

    async _executeClientCommand(repository, app, stdin, stdout, stderr) {
        // TODO: Check clone rights on repository

        const repoPath = path.join(this.backend.path, repository._id);
        const pipePath = `${repoPath}.pipe`;
        let changeId = false;
        let patchIndex = false;

        console.log("Running: ", app, repoPath);

        const hookData = {};

        await fs.removeAsync(pipePath);

        const server = net.createServer((client) => {
            client.on("data", (data) => {
                const [ name, ...args ] = data.toString().replace(/\n$/, "").split(";");

                if (args[0] === "result") {
                    this._handleHook(repository, name, hookData[name], changeId, patchIndex)
                    .then((code) => {
                        delete hookData[name];

                        if (!client.destroyed) {
                            client.end(`${code}`);
                        } else {
                            console.error(`Client had already exited, could not send result code ${code}`);
                        }
                    })
                    .catch((error) => {
                        console.error(error);

                        delete hookData[name];

                        if (!client.destroyed) {
                            client.end("255");
                        } else {
                            console.error("Client had already exited, could not send result code 255");
                        }
                    });
                } else {
                    hookData[name] = hookData[name] || [];
                    hookData[name].push(args);

                    if (!client.destroyed) {
                        client.end();
                    }
                }
            });
        });

        server.listen(pipePath);

        const child = spawn(app, [ repoPath ], {
            stdio: [ "pipe", "pipe", "pipe" ],
            env: {
                PIPE_PATH: pipePath
            }
        });

        child.stderr.on("data", (data) => {
            console.log("stderr", data.toString());
            stderr.write(data);
        });

        const serverToClient = new GitIntercept({
            lineTransform: async (line) => {
                console.log("serverToClient1", line);

                // We remove sideband since it makes it
                // harder to parse the protocol. Might
                // be some side effects but should only
                // be stuff like progress info or speed.
                // One benefit is that the git client
                // does not prefix all info from the
                // server with "remote:" which makes it
                // more seamless if we want to print
                // links or similar.
                line = line.replace(/side-band-64k /g, "");
                line = line.replace(/side-band /g, "");

                if (changeId) {
                    // If we have an changeId we assume that
                    // we are in the report status phase
                    // and need to translate the
                    // refs/changes/* to refs/for/master
                    // since that is what the client expects
                    line = line.replace(/(refs\/changes\/.*)/, "refs/for/master");
                } else if (line.match(/(refs\/changes\/.*)/)) {
                    // If we haven't yet got an changeId we assume
                    // we are in the startup phase where the
                    // server lists what branches it has.
                    // We want to filter all ref/changes
                    return false;
                }

                console.log("serverToClient2", line);

                return line;
            }
        });

        let messageCalled = false;

        const clientToServer = new GitIntercept({
            lineTransform: async (line) => {
                console.log("clientToServer1", line);

                let needRefName = false;
                // When the client submits something to
                // refs/for/master it should be placed
                // on a magical refs/changes/* branch
                line = line.replace(/(refs\/for\/master)/, (refname) => {
                    if (!changeId) {
                        stderr.write("error: Missing Change-Id from commit message\n");
                        child.kill();

                        return "";
                    }

                    needRefName = true;

                    return refname;
                });

                if (needRefName) {
                    if (patchIndex === false) {
                        const revision = await this.Revision.findOne({ _id: changeId });

                        patchIndex = revision ? revision.patches.length + 1 : 1;
                    }

                    line = line.replace(/(refs\/for\/master)/, `refs/changes/${changeId}/${patchIndex}`);
                }

                console.log("clientToServer2", line);

                return line;
            },
            commitMessage: (message) => {
                console.log("message", message);

                if (messageCalled) {
                    stderr.write("error: You are only allowed to push one ref, you need to squash or rebase\n");
                    child.kill();

                    return false;
                }

                messageCalled = true;

                // To connect commits made to refs/for/master
                // we need a Change-Id to identify them.
                const match = message.match(/Change-Id: (.*)/);
                changeId = match ? match[1] : false;

                // We need to buffer when running
                // git-receive-pack since we need
                // the commit message and Change-Id
                // to modify the branch, so be buffer
                // from the start and when we have
                // the commit message we unbuffer
                // to continue the communication
                if (app === "git-receive-pack") {
                    clientToServer.unhalt();
                }

                return true;
            },
            halted: app === "git-receive-pack"
        });

        child.stdout.pipe(serverToClient).on("data", (data) => {
            // console.log("stdout", data.toString("utf8"));
            stdout.write(data);
        });

        stdin.pipe(clientToServer).on("data", (data) => {
            // console.log("stdin", data.toString("utf8"));
            if (child.stdin.writable) {
                child.stdin.write(data);
            }
        });

        return new Promise((resolve) => {
            child.on("close", (code) => {
                console.log("Command exited:", code);
                resolve(code);
            });
        });
    }

    async _getBasicInfo(repository, rev) {
        const repoPath = path.join(this.backend.path, repository._id);
        const [ stdout ] = await execAsync(`git show --format="%cn%+ce%+ct%+B" --no-patch ${rev}`, {
            cwd: repoPath
        });

        const [ name, email, timestamp, ...lines ] = stdout.split("\n");
        const comment = lines.join("\n");

        return { name, email, timestamp, comment };
    }

    _handleHook(repository, name, args, changeId, patchIndex) {
        if (name === "pre-receive") {
            return this._hookPrePush(repository, args, changeId, patchIndex);
        } else if (name === "update") {
            return this._hookUpdate(repository, ...args[0], changeId, patchIndex);
        } else if (name === "post-receive") {
            return this._hookPostPush(repository, args, changeId, patchIndex);
        } else if (name === "post-update") {
            return this._hookPostUpdate(repository, args[0], changeId, patchIndex);
        }

        throw new Error(`Unknown hook ${name}`);
    }

    async _hookPrePush(repository, list, changeId, patchIndex) {
        // TODO: Do something useful

        console.log("_hookPrePush start");
        console.log("changeId", changeId);
        console.log("patchIndex", patchIndex);
        for (const data of list) {
            console.log("oldrev", data[0]);
            console.log("newrev", data[1]);
            console.log("refname", data[2]);
        }

        if (list.length !== 1) {
            console.log("Only one ref is allowed to be pushed at once");
            console.log("_hookPrePush end");

            return 255;
        }

        console.log("_hookPrePush end");

        return 0;
    }

    async _hookUpdate(repository, oldrev, newrev, refname, changeId, patchIndex) {
        // TODO: Do something useful

        console.log("_hookUpdate start");
        console.log("changeId", changeId);
        console.log("patchIndex", patchIndex);
        console.log("oldrev", oldrev);
        console.log("newrev", newrev);
        console.log("refname", refname);
        console.log("_hookUpdate end");

        return 0;
    }

    async _hookPostPush(repository, list, changeId, patchIndex) {
        // We have in the pre push hook checked that there
        // is only one ref present, no need to check here.
        const [ oldrev, newrev, refname ] = list[0];
        const info = await this._getBasicInfo(repository, newrev);
        const patch = {
            index: patchIndex,
            email: info.email,
            name: info.name,
            submitted: moment.unix(info.timestamp).utc().format(),
            comment: info.comment,
            change: {
                oldrev: oldrev,
                newrev: newrev,
                refname: refname
            }
        };

        await this.Revision.allocate(repository._id, changeId, patch);

        return 0;
    }

    async _hookPostUpdate(/* repository, refname */) {
        // TODO: Do something useful

//         console.log("_hookPostUpdate start");
//         console.log("refname:" + refname);
//         console.log("_hookPostUpdate end");

        return 0;
    }

    async dispose() {
        await this.server.dispose();
    }
}

module.exports = GitBackend;
