#!/bin/bash
#
# Script to setup workspace for development
# Run as post-install after initial `yarn create expo-app`

NPE_TOOLKIT_SYMLINK=../../npe-toolkit

if [[ ! -d $NPE_TOOLKIT_SYMLINK ]]; then
    echo ERROR: You need toe symlink npe-toolkit when using developer build
    echo "> ln -snf \$PATH_TO_NPE_TOOLKIT \$YOUR_APP_DIR/../npe-toolkit"
    exit 1
fi

if [[ $PWD == *"/npe/"* ]]; then
  # Special case for Meta internal build
  yarn install &
  pushd ../server/functions
  yarn install &
  popd
else
  yarn install
  pushd ../server/functions
  yarn install
  popd
fi