#!/bin/bash -e

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

echo "Now I will test libs"
${gitroot}/ci/libs-test.sh ${CLIARG} all
echo "Now I will test components"
${gitroot}/ci/components-test.sh ${CLIARG} all
