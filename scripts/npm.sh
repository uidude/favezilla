#!/bin/bash
# Deploy package to NPM
# Don't execute this if you are not a maintainer - it won't work
# and if you're seeing this in your template pacakge it's a bug

# TODOS
# - Update all files to change helloworld to helloworld
# - Publish
# - Git revert everything

SCRIPTDIR=$(dirname $0)
BASEDIR=$(cd $SCRIPTDIR/../ && echo $PWD)

STATUS=$(git diff --exit-code)
# Check if files are modified
if [[ $STATUS -ne 0 ]]; then
  echo " Can't publish with uncommitted changes."
  exit 0
fi

# Change "favezilla" to "helloword" for Expo app template
cd $BASEDIR
git grep -li 'favezilla' | xargs -n 1 sed -i '' 's/[fF]avezilla/helloworld/g' $1

# Replace helloworld back in package.json, as it is getting checked in
sed -i '' 's/favezilla/helloworld/g' package.json

# Remove Firebase config
cp scripts/Config.template.tsx common/Config.tsx

yarn publish --access public

# Print message
echo "NPM repo published!"
echo 'Commit the new "package.json" with updated version, and revert the remaining files.'

