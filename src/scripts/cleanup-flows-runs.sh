#!/bin/bash

mongo flowctrl --eval "db.dropDatabase()"
mongo baselinegen --eval "db.dropDatabase()"
mongo dataresolve --eval "db.dropDatabase()"
mongo exec --eval "db.job.remove({})"
mongo coderepo --eval "db.revision.remove({})"
