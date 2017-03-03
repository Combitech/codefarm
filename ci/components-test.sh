#!/bin/bash -e

function printUsage() {
  echo "Usage: $0 [components] or 'all'"
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
  targets=${componenttests[@]}
else
  for target in ${targets[@]}; do
    if [[ " ${componenttests[*]} " != *" ${target} "* ]]; then
      echo "Error: Component must be one of ${componenttests[*]} or 'all'"
      printUsage
      exit 1
    fi
  done
fi

for target in ${targets[@]}; do
  pushd ${gitroot}/src/app/${target}
    yarn test
  popd
done
