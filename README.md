# Code Farm
   
Code Farm is a generic Continous Integration (CI) system for executing CI flows.
The system is deployed as a number of [micro-services](#micro-services) connected via RabbitMQ
storing state in a MongoDB database.

The unique feature of Code Farm is a **developer centric view** where it's possible to
track how a *code revision* or *artifact* has performed in different tests and/or builds.

![Example CI Flow](http://yuml.me/diagram/scruffy/class/[Revision]-->[Gate],[Gate]-->[Test],[Gate]-->[Build])

## Micro-services
Code Farm consists of the following services:
* **UI** - HTML5 User Interface
* **CodeRepo** - Stores information about code repositories and revisions
* **ArtifactRepo** - Stores information about artifact repositories and artifacts
* **LogRepo** - Stores logs
* **UserRepo** - Stores information about users and teams
* **MetaData** - Stores information about other type instances
* **BaselineGen** - Generates baselines from baseline specifications
* **FlowCtrl** - Requests baselines and triggers steps on generated baselines
* **DataResolve** - Resolves complex data queries
* **Exec** - Executes jobs on slaves
* **Stat** - Collect statistics and aggregates statics data
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
Navigate your browser to [http://localhost:19898](http://localhost:19898)

## Flows
A CI flow in Code Farm is represented by a number of *steps*. Each *step* is associated with a *baseline specification*
and is triggered to run when a new *baseline* is generated from the associated *baseline specification*. A *baseline* consists of collected references to type instances. The *step* may contain a *job* represented by a custom script.

See [flows page](../../wiki/Flows) on wiki for more information.

## External dependencies
* RabbitMQ
* MongoDB
