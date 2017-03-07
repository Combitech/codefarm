#!/bin/bash -e

set +x

function printUsage() {
  echo "Usage: $0 [-C <cli_path>] <libs> or 'all'"
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
  targets=${libs[@]}
else
  for target in ${targets[@]}; do
    if [[ " ${libs[*]} " != *" ${target} "* ]]; then
      echo "Error: Invalid lib '${target}'. Valid libs are ${libs[*]} or 'all'"
      printUsage
      exit 1
    fi
  done
fi

for target in ${targets[@]}; do
  echo ${gitroot}/ci/lib-build.sh ${CLIARG} ${target} dev
  ${gitroot}/ci/lib-build.sh ${CLIARG} ${target} dev
done
