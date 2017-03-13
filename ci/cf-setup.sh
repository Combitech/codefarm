#!/bin/bash -e

set +x

function printUsage() {
  echo "Usage: $0 'dev' or 'rel'"
}

if [ $# -lt 1 ]; then
  echo "Error: Illegal number or arguments"
  printUsage
  exit 1
fi

if [[ `which pm2` == "" ]]; then
  echo "Error: pm2 not installed, see http://pm2.keymetrics.io/"
  exit 1
fi

mode=$1

if [[ "${mode}" != "dev" && "${mode}" != "rel" ]]; then
  echo "Illegal mode '${mode}'"
  printUsage
  exit 1
fi

gitroot=$(git rev-parse --show-toplevel)
echo "Git root is ${gitroot}"

source $gitroot/ci/common.source

echo "Starting mongo"
pushd $gitroot/src/scripts
pm2 start docker-compose --name "mongo" -- up mongo
popd

echo "Starting rabbitmq"
pushd $gitroot/src/scripts
pm2 start docker-compose --name "rabbitmq" -- up rabbitmq
popd

echo "Starting components"
for component in ${components[@]}; do
  pushd $gitroot/src/app/${component} > /dev/null
    pm2 start npm --name "${component}" -- run start-${mode}
  popd > /dev/null #src/app/${component}
done
