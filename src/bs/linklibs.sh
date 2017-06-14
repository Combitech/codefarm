#!/bin/bash -e

set +x

if [ -n "${DISABLE_LINK_LIBS}" ]; then
    echo "Link libs is disabled! Exiting..."
    exit 0
fi

# use existing gitroot var or assume we are in git repo and resolve
if [ -z "$gitroot" ]; then
    gitroot=$(git rev-parse --show-toplevel)
fi
source $gitroot/src/bs/common.source

forceInstallLibs=0
if [ -n "${FORCE_INSTALL_LIBS}" ]; then
    echo "$0: Force install of linked libraries"
    forceInstallLibs=1
fi

if [ -z "$libroot" ]; then
    libroot=$gitroot/src/lib
elif [ -z "$libroot2" ]; then
    libroot2=$gitroot/src/lib
fi

libs=$(node -e "const p = require('./package.json'); console.log(p.libraries.join('\n'));")
libdir=$(node -e "const p = require('path'); console.log(p.relative(process.cwd(), '$libroot'));")
if [ ! -z "$libroot2" ]; then
    libdir2=$(node -e "const p = require('path'); console.log(p.relative(process.cwd(), '$libroot2'));")
fi

installFlag=""
if [[ $production -eq 1 ]]; then
    installFlag="--production"
fi

install="npm install ${installFlag}"
install_pkg=$install

if command -v yarn > /dev/null ; then
    install="yarn ${installFlag}"
fi

function linkLib() {
    lib=$1
    dir=$2
    linkName="./node_modules/$lib"
    if [ -e "$dir/$lib" ]; then
        ln -s "../$dir/$lib" "$linkName"
        echo "$0: Linked lib $lib from $dir"
        return 0
    fi
    return 1
}

if [ "${libs}" != "" ]; then
    while read -r lib; do
        if [ ! -e "./node_modules/$lib" ]; then
            if linkLib "$lib" "$libdir"; then
                :
            elif linkLib "$lib" "$libdir2"; then
                :
            else
                echo "$0: Error: $lib not found"
            fi
        fi

        if [[ $forceInstallLibs -eq 1 ]]; then
            if [ -L "./node_modules/$lib" ]; then
                pushd "./node_modules/$lib" > /dev/null
                echo "$0: Installing $lib"
                $install
                popd > /dev/null
            fi
        fi
    done <<< "$libs"
fi
