#!/bin/bash -f
#
# This script requires tmuxinator

git_root=$(git rev-parse --show-toplevel)
export ROOT_DIR=$git_root/src

export TMUXINATOR_CONFIG=$ROOT_DIR
echo $TMUXINATOR_CONFIG
tmuxinator start codefarm git_root=$git_root
