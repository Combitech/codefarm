# Code Farm

Code Farm is a generic Continous Integration (CI) system for executing CI flows.
The system is deployed as a number of micro-services connected via RabbitMQ
storing state in a MongoDB database.

The unique feature of Code Farm is a **developer centric view** where it's possible to
track how a *code revision* or *artifact* has performed in different tests and/or builds.

## Micro-services
The micro-services are designed to use different *backends* where needed, for example
the *CodeRepo* micro-service responsible for handling code revisions have
backends for interfacing with *GitHub* and *Gerrit*.

The communication between the micro-services over RabbitMQ is performed in a REST-like
fashion using operations like *get*, *list*, *create*, *update* and *remove* on
REST classes and instances represented by JSON.
In Code Farm we denote the REST classes and instances *Types* and *Type instances*.

All *types* have some mandatory attributes, one of these is the attribute *tags* which is a list of strings.

## Flows
A CI flow in Code Farm is represented by a number of *steps*. Each *step* is associated with a *baseline specification*
and is triggered to run when a new *baseline* is generated from the *baseline specification*.
![CI Flow Class Diagram](http://g.gravizo.com/source/cd_flow/https%3A%2F%2Fgithub.com%2FCombitech%2Fcodefarm%2Fblob%2Fmaster%2FREADME.md)
<!---
cd_flow
@startuml
class Step
class Specification
class Flow
Step -> Specification
Step -> Flow
@enduml
cd_flow
-->

## External dependencies
* RabbitMQ
* MongoDB
