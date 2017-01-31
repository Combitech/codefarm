"use strict";

const path = require("path");
const fs = require("fs-extra-promise");
const { Server } = require("./daemon/server");
const { ScriptServer } = require("./daemon/script_server");
const { Executor } = require("./daemon/executor");

module.exports = {
    run: async (workspace, port) => {
        const logfile = path.join(workspace, "daemon.log");

        const log = (line) => {
            fs.appendFileSync(logfile, `${new Date()}  RUN  ${line}\n`);
        };

        const server = new Server("client", logfile, port);
        const scriptServer = new ScriptServer("cmd", logfile, path.join(workspace, "cmd.sock"));
        const executor = new Executor(logfile);

        scriptServer.on("type_read", async (data) => {
            await server.typeRead(data.typeName, data.id, data.getter);
        });

        scriptServer.on("type_create", async (data) => {
            await server.typeCreate(data.typeName, data.data);
        });

        scriptServer.on("type_update", async (data) => {
            await server.typeUpdate(data.typeName, data.id, data.data);
        });

        scriptServer.on("type_action", async (data) => {
            await server.typeAction(data.typeName, data.id, data.action, data.data);
        });

        scriptServer.on("file_upload", async (data) => {
            await server.fileUpload(data.kind, data.data);
        });

        scriptServer.on("revision_merge", async (data) => {
            await server.revisionMerge(data.revisionId, data.data);
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

        server.on("notify_type_read", async (data) => {
            log(`Server response: Read type ${data.type} with id ${data._id}`);
            await scriptServer.response(data);
            await scriptServer.end();
        });

        server.on("notify_type_created", async (data) => {
            log(`Server response: Created type ${data.type} with id ${data._id}`);
            await scriptServer.response(data);
            await scriptServer.end();
        });

        server.on("notify_type_updated", async (data) => {
            log(`Server response: Updated type ${data.type} with id ${data._id}`);
            await scriptServer.response(data);
            await scriptServer.end();
        });

        server.on("notify_type_action_done", async (data) => {
            log(`Server response: Type action done data=${data}`);
            await scriptServer.response(data);
            await scriptServer.end();
        });

        server.on("notify_file_uploaded", async (data) => {
            log(`Server response: Uploaded file to type ${data.type} with id ${data._id}`);
            await scriptServer.response(data);
            await scriptServer.end();
        });

        server.on("notify_revision_merged", async (data) => {
            log(`Server response: Merged revision ${data.type} with id ${data._id}`);
            await scriptServer.response(data);
            await scriptServer.end();
        });

        server.on("notify_error", async (data) => {
            log(`Server error response: ${JSON.stringify(data)}`);
            await scriptServer.error("server_error", data);
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
