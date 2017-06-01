#!/bin/bash -e

set +x

# use existing gitroot var or assume we are in git repo and resolve
if [ -z "$gitroot" ]; then
    gitroot=$(git rev-parse --show-toplevel)
fi

production=0
if [ "${NODE_ENV}" == "production" ]; then
    echo "$0: Production mode"
    production=1
fi

libs=$(ls -d $gitroot/src/lib/*)

installFlag=""
if [[ $production -eq 1 ]]; then
    installFlag="--production"
fi

install="npm install ${installFlag}"
install_pkg=$install

while read -r lib; do
    echo "Installing $lib"
    pushd $lib
    $install
    popd
done <<< "$libs"
