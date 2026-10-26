#!/bin/sh
# Stamp a new version so open browsers reload into it and every file is fetched fresh (?v=<version>).
set -e
cd "$(dirname "$0")"
v="${1:-$(date -u +%Y.%m.%d-%H%M)}"
sed -i "s/^const VERSION='[^']*';/const VERSION='$v';/" docs/js/version.js
sed -i "s/?v=[^\"]*\"/?v=$v\"/g" docs/index.html
printf '{"version":"%s"}\n' "$v" > docs/version.json
grep -q "^const VERSION='$v';" docs/js/version.js
echo "Version $v"
