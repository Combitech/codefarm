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

libs=$(node -e "const p = require('./package.json'); console.log(p.libraries.join('\n'));")
libdir=$(node -e "const p = require('path'); console.log(p.relative(process.cwd(), '$gitroot/src/lib'));")

installFlag=""
if [[ $production -eq 1 ]]; then
    installFlag="--production"
fi

install="npm install ${installFlag}"
install_pkg=$install

if command -v yarn ; then
    install="yarn ${installFlag}"
fi

if [ "${libs}" != "" ]; then
  while read -r lib; do
      if [ ! -e "./node_modules/$lib" ]; then
          ln -s "../$libdir/$lib" "./node_modules/"
      fi

      if [[ $forceInstallLibs -eq 1 ]]; then
          if [ -L "./node_modules/$lib" ]; then
              pushd "./node_modules/$lib"
              $install
              popd
          fi
      fi
  done <<< "$libs"
fi
