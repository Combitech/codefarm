#!/bin/bash -e -x

startTime=$(($(date +%s%N)/1000000))

function printUsage() {
  echo "Usage: $0 [-C <cli_path>] <component> <dev/rel>"
}

if [ $# -lt 2 ]; then
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
source $gitroot/ci/common.source

if [[ " ${components[*]} " != *" ${target} "* ]]; then
  echo "Error: Component must be one of ${components[*]}"
  printUsage
  exit 1
fi

if [[ "${mode}" != "rel" && "${mode}" != "dev" ]]; then
  echo "Error: Second argument must be 'dev' or 'rel'"
  printUsage
  exit 1
fi

installFlag=""
if [ "${mode}" == "rel" ]; then
  installFlag="--production"
fi

result=0

pushd ${gitroot}/src/app/${target}
  echo "Running install on ${target}"

  result=0
  subjobname="${target}_build_${mode}"
  subjobId=$($CLI -q '$._id' --format values create_subjob build "${subjobname}" ongoing)

  yarn install ${installFlag} || result=1

  stopTime=$(($(date +%s%N)/1000000))
  testDuration=`expr $stopTime - $startTime`
  testDurationStr={\"timeMs\":$testDuration}
  #Need to restart clock for possible UI compile-client build
  startTime=$(($(date +%s%N)/1000000))

  if [[ $result -eq 1 ]]; then
    $CLI update_subjob $subJobId -s fail --result $testDurationStr
    exit 1
  else
    $CLI update_subjob $subJobId -s success --result $testDurationStr
  fi
popd

# Special case for UI in release mode: run compile-client
if [[ "${target}" == "UI" && "${mode}" == "rel" ]]; then
  echo "Running UI compile-client"
  pushd ${gitroot}/src/app/${target}
    subjobname="${component}_compile_client_build_${mode}"
    subjobId=$($CLI -q '$._id' --format values create_subjob build "${subjobname}" ongoing)

    yarn compile-client --production || result=1

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
fi
