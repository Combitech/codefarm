#!/bin/bash -e

set +x

function printUsage() {
  echo "Usage: $0 [libs] or 'all'"
}

if [ $# -lt 1 ]; then
  echo "Error: Illegal number of arguments"
  printUsage
  exit 1
fi

targets=$1

gitroot=$(git rev-parse --show-toplevel)
source $gitroot/ci/common.source

if [ "${targets}" == "all" ]; then
  targets=${libs[@]}
else
  for target in ${targets[@]}; do
    if [[ " ${libs[*]} " != *" ${target} "* ]]; then
      echo "Error: Component must be any number of ${libs[*]} or 'all'"
      printUsage
      exit 1
    fi
  done
fi

for target in ${targets[@]}; do
  ${gitroot}/ci/lib-build.sh ${target} rel
done
