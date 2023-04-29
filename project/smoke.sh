#!/bin/bash
SCRIPTDIR=$(dirname $0)
BASEDIR=$(cd $SCRIPTDIR/.. && echo $PWD)

# Run yarn install
sh setup.sh
pushd $BASEDIR/../../npe-toolkit/v47/deps && yarn install && popd

STATUS=0

# Typecheck all directories
yarn tsc -p $BASEDIR/client --noEmit
STATUS=$(($STATUS + $?))
yarn tsc -p $BASEDIR/admin --noEmit
STATUS=$(($STATUS + $?))
yarn tsc -p $BASEDIR/server/functions --noEmit
STATUS=$(($STATUS + $?))

echo Status: $STATUS
if [ $STATUS -ne 0 ]; then
  echo "Failure in typechecking. See logs above to find errors and fix.." && \
  echo  "To run locally, call \`tools/project/smoke.sh\`"
  exit 1
fi

