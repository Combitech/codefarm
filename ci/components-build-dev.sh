#!/bin/bash -e

function printUsage() {
  echo "Usage: $0 [-C <cli_path>] <components> or 'all'"
}

if [ $# -lt 1 ]; then
  echo "Error: Illegal number of arguments"
  printUsage
  exit 1
fi

# Extract optional CLI path
while getopts ":C:" opt; do
  case "$opt" in
    C) CLI=$OPTARG ;;
  esac
done
shift $(( OPTIND - 1 ))

CLIARG=""
if [ "${CLI}" != "" ]; then
  CLIARG="-C ${CLI}"
fi

targets=$1

gitroot=$(git rev-parse --show-toplevel)
source $gitroot/ci/common.source

if [ "${targets}" == "all" ]; then
  targets=${components[@]}
else
  for target in ${targets[@]}; do
    if [[ " ${components[*]} " != *" ${target} "* ]]; then
      echo "Error: Invalid component '${target}'. Valid components are ${components[*]} or 'all'"
      printUsage
      exit 1
    fi
  done
fi

for target in ${targets[@]}; do
  ${gitroot}/ci/component-build.sh -C ${CLIARG} ${target} dev
done
