"use strict";

const yargs = require("yargs");
const rp = require("request-promise");
const { userrepo: configUserRepo } = require("./config.json");

const argv = yargs
.help("help")
.strict()
.option("i", {
    alias: "id",
    describe: "Policy id",
    type: "string"
})
.option("n", {
    alias: "name",
    describe: "Policy name",
    type: "string"
})
.option("description", {
    describe: "Policy description",
    type: "string"
})
.option("priv", {
    alias: "privilege",
    describe: "Privilege",
    type: "array",
    default: []
})
.option("template", {
    describe: "Policy template",
    type: "array",
    default: []
})
.argv;

// $ cd src/app
// $ git ls-files */lib/types/*|sed 's+/lib/types/+\.+'|sed 's/\.js//'|sed 's/\(.*\)/    \"\1\",/'|tr '[:upper:]' '[:lower:]'
/*
    "artifactrepo.artifact",
    "artifactrepo.backend",
    "artifactrepo.repository",
    "baselinegen.baseline",
    "baselinegen.collector",
    "baselinegen.specification",
    "coderepo.backend",
    "coderepo.repository",
    "coderepo.revision",
    "dataresolve.data",
    "eventrepo.event",
    "exec.executor",
    "exec.job",
    "exec.slave",
    "exec.sub_job",
    "flowctrl.flow",
    "flowctrl.step",
    "logrepo.backend",
    "logrepo.log",
    "logrepo.repository",
    "mgmt.config",
    "userrepo.backend",
    "userrepo.team",
    "userrepo.team_avatar",
    "userrepo.user",
    "userrepo.user_avatar"
*/

const templates = {
    super: [ "*:*" ],
    adm: [ "*:*" ],
    mgmt: [ "*:*" ],
    usr: [ "r:*", "read,comment:*" ]
};

const run = async () => {
    console.log(`Adding policy ${argv.id}`);
    const templatePrivileges = argv.template
        .map((item) => templates[item])
        .reduce((acc, val) => acc.concat(val), [])
        .filter((priv, index, self) => self.indexOf(priv) === index);
    const privileges = [].concat(argv.privilege, templatePrivileges);
    const result = await rp.post({
        url: `http://localhost:${configUserRepo.web.port}/policy`,
        body: {
            _id: argv.id,
            name: argv.name,
            description: argv.description,
            privileges
        },
        json: true
    });
    console.dir(result, { colors: true, depth: null });
};

run()
.catch((error) => {
    console.error(error);
    process.exit(255);
});
