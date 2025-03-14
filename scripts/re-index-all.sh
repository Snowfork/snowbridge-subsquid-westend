#!/usr/bin/env bash
set -eu

source ./scripts/set-env.sh
source ./scripts/drop-db.sh
from_top_level=true

pm2 stop ecosystem.config.js

drop_db

sqd clean && sqd codegen && sqd build && sqd migration:apply
pm2 start ecosystem.config.js


