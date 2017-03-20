#!/bin/bash -e

startTime=$(($(date +%s%N)/1000000))

function printUsage() {
  echo "Usage: $0 [-C <cli_path>]"
}

if [ $# -gt 2 ]; then
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

# Define CLI as doing nothing if flag is not set
if [[ "$CLI" == "" ]]; then
  CLI=`which true`
else
  CLI="node --harmony_async_await ${CLI}"
fi

target=$1
mode=$2

gitroot=$(git rev-parse --show-toplevel)

pushd ${gitroot}/src/scripts
  echo "Running install on scripts"

  result=0
  subJobName="scripts_build"
  subJobId=$($CLI -q '$._id' --format values create_subjob build "${subJobName}" ongoing)

  yarn install |& tee ${subJobName}.log
  result=${PIPESTATUS[0]}

  $CLI upload_log ${PWD}/${subJobName}.log ${subJobName}.log

  stopTime=$(($(date +%s%N)/1000000))
  testDuration=`expr $stopTime - $startTime`
  testDurationStr={\"timeMs\":$testDuration}

  if [[ $result -eq 1 ]]; then
    $CLI update_subjob $subJobId -s fail --result $testDurationStr
    exit 1
  else
    $CLI update_subjob $subJobId -s success --result $testDurationStr
  fi

popd
