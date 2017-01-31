#!/bin/bash

mongo FlowCtrl --eval "db.dropDatabase()"
mongo BaselineGen --eval "db.dropDatabase()"
mongo UserRepo --eval "db.dropDatabase()"
mongo EventRepo --eval "db.dropDatabase()"
mongo LogRepo --eval "db.dropDatabase()"
mongo CodeRepo --eval "db.dropDatabase()"
mongo ArtifactRepo --eval "db.dropDatabase()"
mongo Exec --eval "db.dropDatabase()"

# rm ../repos2/MyGitRepository -rf && rm MyGitRepository/ -rf && ssh-keygen -f "/home/mattias/.ssh/known_hosts" -R [localhost]:44675

# git clone ssh://localhost:44675/MyGitRepository && cd MyGitRepository/ && cp .hooks/commit-msg .git/hooks/ && git config remote.origin.push 'HEAD:refs/for/master' && date > test.txt && git add test.txt && git commit -m "Commit"
