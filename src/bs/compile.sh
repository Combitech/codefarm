#!/bin/bash -e

gitroot=$(git rev-parse --show-toplevel)
source $gitroot/src/bs/common.source

rm -rf ./build/out
babel . --ignore node_modules,build,client --out-dir ./build/out --source-maps --copy-files

if [ -e ./client/static ]; then
    mkdir ./build/out/client
    cp -r ./client/static ./build/out/client
fi
