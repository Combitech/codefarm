#!/bin/bash -e

gitroot=$(git rev-parse --show-toplevel)
source $gitroot/src/bs/common.source

docker build -t $tag . $@
