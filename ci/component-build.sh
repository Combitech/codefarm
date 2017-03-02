#!/bin/bash -e

function printUsage() {
  echo "Usage: $0 <component> <dev/rel>"
}

if [ $# -ne 2 ]; then
  echo "Error: Illegal number of arguments"
  printUsage
  exit 1
fi

target=$1
mode=$2

gitroot=$(git rev-parse --show-toplevel)
source $gitroot/ci/common.source

if [[ " ${components[*]} " != *" ${target} "* ]]; then
  echo "Error: Component must be one of ${components[*]}"
  printUsage
  exit 1
fi

if [[ "${mode}" != "rel" && "${mode}" != "dev" ]]; then
  echo "Error: Second argument must be 'dev' or 'rel'"
  printUsage
  exit 1
fi

installFlag=""
if [ "${mode}" == "rel" ]; then
  installFlag="--production"
fi

# Special case for UI in release mode: run compile-client
if [[ "${target}" == "UI" && "${mode}" == "rel" ]]; then
  echo "Running UI compile-client"
  pushd ${gitroot}/src/app/${target}
    yarn compile-client --production
  popd
fi

pushd ${gitroot}/src/app/${target}
  echo "Running install on ${target}"
  yarn install ${installFlag}
popd
