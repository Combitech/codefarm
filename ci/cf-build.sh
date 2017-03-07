#!/bin/bash -e

set +x

function printUsage() {
  echo "Usage: $0 [-C <cli_path>] 'dev' or 'rel'"
}

if [ $# -lt 1 ]; then
  echo "Error: Illegal number or arguments"
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

mode=$1

if [[ "${mode}" != "dev" && "${mode}" != "rel" ]]; then
  echo "Illegal mode '${mode}'"
  printUsage
  exit 1
fi

gitroot=$(git rev-parse --show-toplevel)
echo "Git root is ${gitroot}"

echo "Now I will build libs"
$gitroot/ci/libs-build-${mode}.sh ${CLIARG} all
echo "Now I will build components"
$gitroot/ci/components-build-${mode}.sh ${CLIARG} all
