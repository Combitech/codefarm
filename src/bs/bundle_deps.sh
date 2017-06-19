#!/bin/bash -e

gitroot=$(git rev-parse --show-toplevel)

dep_dir="${PWD}/deps"
dep_file="deps.tar"
dep_path="$dep_dir/${dep_file}"

mkdir -p $dep_dir

rm -f $dep_path

# Bundle deps
pushd $gitroot/src > /dev/null
tar --exclude='*/node_modules' --exclude='*/build' -cf $dep_path lib bs
popd > /dev/null
