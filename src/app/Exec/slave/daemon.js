"use strict";

const path = require("path");
const fs = require("fs-extra-promise");
const { Server } = require("./daemon/server");
const { ScriptServer } = require("./daemon/script_server");
const { Executor } = require("./daemon/executor");
const getPort = require("get-port");

module.exports = {
    run: async (workspace, port) => {
        const logfile = path.join(workspace, "daemon.log");

        const log = (line) => {
            fs.appendFileSync(logfile, `${new Date()}  RUN  ${line}\n`);
        };

        const cliConfig = {
            port: await getPort()
        };

        await fs.writeFileAsync(path.join(workspace, "cliConfig.json"), JSON.stringify(cliConfig));

        const server = new Server("client", logfile, port);
        const scriptServer = new ScriptServer("cmd", logfile, cliConfig.port);
        const executor = new Executor(logfile);

        scriptServer.on("type_read", async (data, contextId) => {
            await server.typeRead(contextId, data.typeName, data.id, data.getter);
        });

        scriptServer.on("type_create", async (data, contextId) => {
            await server.typeCreate(contextId, data.typeName, data.data);
        });

        scriptServer.on("type_update", async (data, contextId) => {
            await server.typeUpdate(contextId, data.typeName, data.id, data.data);
        });

        scriptServer.on("type_action", async (data, contextId) => {
            await server.typeAction(contextId, data.typeName, data.id, data.action, data.data);
        });

        scriptServer.on("file_upload", async (data, contextId) => {
            await server.fileUpload(contextId, data.kind, data.data);
        });

        scriptServer.on("revision_merge", async (data, contextId) => {
            await server.revisionMerge(contextId, data.revisionId, data.data);
        });

        scriptServer.on("revision_verified", async (data, contextId) => {
            console.log("\n\nrevisionVerified\n\n", data, contextId);
            await server.revisionVerified(contextId, data.revisionId, data.state, data.data);
        });

        server.on("abort", async () => {
            log("Abort requested");
            await server.info("Abort requested");

            executor.kill();
        });

        server.on("execute", async (data) => {
            log("Execution requested");
            await server.info("Execution requested", data);

            await executor.run(data.script, data.env, data.data);

            await server.executing();
        });

        server.on("notify_type_read", async (data, contextId) => {
            log(`Server response in context ${contextId}: Read type ${data.type} with id ${data._id}`);
            await scriptServer.response(data, contextId);
            await scriptServer.end();
        });

        server.on("notify_type_created", async (data, contextId) => {
            log(`Server response in context ${contextId}: Created type ${data.type} with id ${data._id}`);
            await scriptServer.response(data, contextId);
            await scriptServer.end();
        });

        server.on("notify_type_updated", async (data, contextId) => {
            log(`Server response in context ${contextId}: Updated type ${data.type} with id ${data._id}`);
            await scriptServer.response(data, contextId);
            await scriptServer.end();
        });

        server.on("notify_type_action_done", async (data, contextId) => {
            log(`Server response in context ${contextId}: Type action done data=${data}`);
            await scriptServer.response(data, contextId);
            await scriptServer.end();
        });

        server.on("notify_file_uploaded", async (data, contextId) => {
            log(`Server response in context ${contextId}: Uploaded file to type ${data.type} with id ${data._id}`);
            await scriptServer.response(data, contextId);
            await scriptServer.end();
        });

        server.on("notify_revision_merged", async (data, contextId) => {
            log(`Server response in context ${contextId}: Merged revision ${data.type} with id ${data._id}`);
            await scriptServer.response(data, contextId);
            await scriptServer.end();
        });

        server.on("notify_revision_verified", async (data, contextId) => {
            console.log("\ndaemon.js notify_revision_verified\n", contextId, data);
            log(`Server response in context ${contextId}: Set verified revision ${data.type} with id ${data._id}`);
            await scriptServer.response(data, contextId);
            await scriptServer.end();
        });

        server.on("notify_error", async (data, contextId) => {
            log(`Server error response in context ${contextId}: ${JSON.stringify(data)}`);
            await scriptServer.error("server_error", data, contextId);
            await scriptServer.end();
        });

        executor.on("error", async (error) => {
            await server.error(error);
        });

        executor.on("stdout", async (data) => {
            await server.stdout(data);
        });

        executor.on("stderr", async (data) => {
            await server.stderr(data);
        });

        executor.on("close", async (code) => {
            await server.info(`Execution ended with code ${code}`);
            await server.finish(code === 0 ? "success" : "fail");
            server.end();
            scriptServer.dispose();
        });

        process.on("uncaughtException", (error) => {
            log("Error! Oh, no, we crashed hard!");
            log(error);
            log(error.stack);
            process.exit(error.code || 255);
        });
    }
};
