#!/bin/bash
pushd `git rev-parse --show-toplevel`

LC_ALL=C
RETVAL=0

function runTest {
  pushd $1
  for testType in test lint; do 
    echo "Running lint in $1"
    if ! yarn $testType; then
      echo "Test failed in $1"
      popd
      return 1
    fi
  done  
  popd
  
  return 0
}

for yarnFile in src/{app,lib}/*/package.json; do
  dir=${yarnFile%/package.json}
  runTest $dir
  RETVAL=$?
  if [ "$RETVAL" != "0" ]; then break; fi
done

popd
exit $RETVAL
