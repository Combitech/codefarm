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

#TODO: once these have tests, remove this section
#Remove components without test
components=( "${components[@]/CodeRepo}" )
components=( "${components[@]/FlowCtrl}" )
components=( "${components[@]/Mgmt}" )
components=( "${components[@]/UI}" )

if [ "${targets}" == "all" ]; then
  targets=${components[@]}
else
  for target in ${targets[@]}; do
    if [[ " ${components[*]} " != *" ${target} "* ]]; then
      echo "Error: Component must be one of ${components[*]}"
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
