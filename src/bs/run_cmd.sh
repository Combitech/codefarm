#!/bin/bash -e

gitroot=$(git rev-parse --show-toplevel)
source $gitroot/src/bs/common.source

id=$(docker ps -a | grep "$tag" | cut -d' ' -f1)

docker exec -t -i $id "$@"
