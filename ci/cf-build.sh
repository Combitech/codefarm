#!/bin/bash -e

set +x

function printUsage() {
  echo "Usage: $0 'dev' or 'rel'"
}

if [ $# -ne 1 ]; then
  echo "Error: Illegal number or arguments"
  printUsage
  exit 1
fi

mode=$1

if [[ "${mode}" != "dev" && "${mode}" != "rel" ]]; then
  echo "Illegal option '${mode}'"
  printUsage
  exit 1
fi

gitroot=$(git rev-parse --show-toplevel)

$gitroot/ci/libs-build-${mode}.sh all
$gitroot/ci/components-build-${mode}.sh all
