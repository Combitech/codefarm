# Code Farm

Code Farm is a generic Continous Integration (CI) system for executing CI flows.
The system is deployed as a number of [micro-services](#micro-services) connected via RabbitMQ
storing state in a MongoDB database.

The unique feature of Code Farm is a **developer centric view** where it's possible to
track how a *code revision* or *artifact* has performed in different tests and/or builds.

![Example CI Flow](https://g.gravizo.com/source/svg/g_ci_flow_ex1?https%3A%2F%2Fraw.githubusercontent.com%2FCombitech%2Fcodefarm%2Freadme_1%2FREADME.md)
<!---
g_ci_flow_ex1
digraph G {
  rankdir="LR";
  node [ shape="rect" ];
  Revision -> Gate
  Gate -> Test
  Gate -> Build
}
g_ci_flow_ex1
--->


## Micro-services
Code Farm consists of the following services:
* **UI** - HTML5 User Interface
* **CodeRepo** - Stores information about code repositories and revisions
* **ArtifactRepo** - Stores information about artifact repositories and artifacts
* **LogRepo** - Stores logs
* **UserRepo** - Stores information about users and teams
* **BaselineGen** - Generates baselines from baseline specifications
* **FlowCtrl** - Requests baselines and triggers steps on generated baselines
* **DataResolve** - Resolves complex data queries
* **Exec** - Executes jobs on slaves
* **Mgmt** - Responsible for managing Code Farm, distributes config etc.

The services are designed to use different *backends* where needed, for example
the *CodeRepo* micro-service responsible for handling code revisions have
backends for interfacing with *GitHub* and *Gerrit*.

The communication between the services over RabbitMQ is performed in a REST-like
fashion using operations like *get*, *list*, *create*, *update* and *remove* on
REST classes and instances represented by JSON.
In Code Farm we denote the REST classes and instances; *Types* and *Type instances*.

## Install
### Services
Execute `yarn` or `npm install` in the following directories:
* `src/app/*` (services)
* `src/scripts`
```bash
#!/bin/bash
for serviceDir in $(ls -d src/app/*); do
  pushd $serviceDir
  npm install
  popd
done
pushd src/scripts
npm install
popd
```
### MongoDB
Install on host or run in docker `src/containers/mongo/Dockerfile`.
Build and start using [docker-compose](https://docs.docker.com/compose/)
```bash
cd src/scripts
docker-compose up mongo
```
### RabbitMQ
Install on host or run in docker `src/containers/rabbitmq/Dockerfile`.
Build and start using [docker-compose](https://docs.docker.com/compose/)
```bash
cd src/scripts
docker-compose up rabbitmq
```

## Start Code Farm
### Start services (development mode)
Execute `yarn start-dev` or `npm start-dev` in `src/app/*`

### Configure
All services except *Mgmt* needs a config to go online. The config is owned by *Mgmt*. Make sure *Mgmt* service is running and load [default config](src/scripts/config.json) using helper script:
```bash
cd src/scripts
yarn create-config
```

### Navigate to UI
Navigate your browser to [http://localhost:9898](http://localhost:9898)

## Flows
A CI flow in Code Farm is represented by a number of *steps*. Each *step* is associated with a *baseline specification*
and is triggered to run when a new *baseline* is generated from the *baseline specification*. A *baseline* consists of collected references to type instances. The *step* may contain a *job* consisting of a custom script.

The *baseline specification* specifies what to collect before generating a baseline using the following parameters:
* **collectType** Which type to collect
* **criteria** A boolean expression using [boolean-parser](https://www.npmjs.com/package/boolean-parser) matching tags on type instances.
* **limit** How many type instances to collect
* **latest** TODO

For example a *baseline specification* with a *criteria* equal to `"step:CG:success AND !step:Test:fail"` will match type instances of type *collectType* that have tag `step:CG:success` but misses tag `step:Test:fail`.

When a *step* is finished all type instances included in the baseline content that triggered the step is taged with a tag of the format `step:STEP_NAME:STEP_STATUS` (e.g. `step:CG:success`, `step:Test:fail`, ...)

![CI Flow Class Diagram](https://g.gravizo.com/source/cd_flow?https%3A%2F%2Fraw.githubusercontent.com%2FCombitech%2Fcodefarm%2Freadme_1%2FREADME.md)
<!---
cd_flow
@startuml
hide empty methods
hide empty fields
hide circle
class Step <<Type>> {
  name : String
  criteria : String
  script : String
  tagScript : String
}
class Flow <<Type>>
class Baseline <<Type>> {
  name : String
  content : Array
}
class Specification <<Type>>
class Collector <<Array>> {
  name : String
  collectType : String
  criteria : String
  limit : Number
  latest : Boolean
}

Step ..> Specification : baseline
Step ..> Flow : flow
Baseline .right. Specification
Specification \*-down- Collector : collectors

@enduml
cd_flow
--->

### Example
The following simplified *baseline specifications* and *steps* represents the flow below
![Example CI Flow](https://g.gravizo.com/source/svg/g_ci_flow_ex1?https%3A%2F%2Fraw.githubusercontent.com%2FCombitech%2Fcodefarm%2Freadme_1%2FREADME.md)

```js
specifications = [ {
  _id: "Gate",
  collectors: [ {
    name: "commits",
    collectType: "coderepo.revision",
    criteria: "!step:Gate:success",
    limit: 1,
    latest: false
  } ]
}, {
  _id: "Test",
  collectors: [ {
    name: "commits",
    collectType: "coderepo.revision",
    criteria: "step:Gate:success",
    limit: 1,
    latest: false
  } ]
}, {
  _id: "Build",
  collectors: [ {
    name: "commits",
    collectType: "coderepo.revision",
    criteria: "step:Gate:success",
    limit: 1,
    latest: false
  } ]
} ]

steps = [ {
  name: "Gate",
  baseline: { id: "Gate" },
}, {
  name: "Test",
  baseline: { id: "Test" },
}, {
  name: "Build",
  baseline: { id: "Build" },
} ]
  
```

## External dependencies
* RabbitMQ
* MongoDB
