#!/bin/bash -e

startTime=$(($(date +%s%N)/1000000))

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

# Define CLI as doing nothing if flag is not set
if [[ "$CLI" == "" ]]; then
  CLI=`which true`
else
  CLI="node ${CLI}"
fi

targets=$1

gitroot=$(git rev-parse --show-toplevel)
source $gitroot/ci/common.source

if [ "${targets}" == "all" ]; then
  targets=${components[@]}
else
  for target in ${targets[@]}; do
    if [[ " ${components[*]} " != *" ${target} "* ]]; then
      echo "Error: Component must be one of ${components[*]} or 'all'"
      printUsage
      exit 1
    fi
  done
fi

for target in ${targets[@]}; do
  startTime=$(($(date +%s%N)/1000000))
  result=0

  pushd ${gitroot}/src/app/${target}

  subJobName="${target}_lint"
  subJobId=$($CLI -q '$._id' --format values create_subjob test "${subJobName}" ongoing)

  npm run lint |& tee ${subJobName}.log
  result=${PIPESTATUS[0]}

  $CLI upload_log ${PWD}/${subJobName}.log ${subJobName}.log

  stopTime=$(($(date +%s%N)/1000000))
  testDuration=`expr $stopTime - $startTime`
  testDurationStr={\"timeMs\":$testDuration}
  startTime=$(($(date +%s%N)/1000000))

  if [[ $result -eq 1 ]]; then
    $CLI update_subjob $subJobId -s fail --result $testDurationStr
    exit 1
  else
    $CLI update_subjob $subJobId -s success --result $testDurationStr
  fi

  popd
done
