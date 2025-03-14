#!/usr/bin/env bash
set -eu

source ./scripts/set-env.sh

drop_db() {
    docker exec $container /bin/sh -c 'psql -h localhost -U postgres -c "drop database '$database' WITH (FORCE);" -c "create database '$database';"'
}

if [ -z "${from_top_level:-}" ]; then
    drop_db
fi


