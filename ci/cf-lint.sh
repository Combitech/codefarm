#!/bin/bash -e

set +x

if [ "$1" == "--help" ]; then
  echo "Usage: $0 [-C <cli_path>]"
  exit 0
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

gitroot=$(git rev-parse --show-toplevel)
echo "Git root is ${gitroot}"

echo "Now I will lint libs"
$gitroot/ci/libs-lint.sh ${CLIARG} all
echo "Now I will lint components"
$gitroot/ci/components-lint.sh ${CLIARG} all
