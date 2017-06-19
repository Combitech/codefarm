#!/bin/bash -e

gitroot=$(git rev-parse --show-toplevel)

dep_dir="${PWD}/deps"
dep_file="deps.tgz"
dep_path="$dep_dir/${dep_file}"

mkdir -p $dep_dir

rm -f $dep_path

# Bundle deps
pushd $gitroot/src
tar --exclude='*/node_modules' --exclude='*/build' -czf $dep_path lib bs
popd
