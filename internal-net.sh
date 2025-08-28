#!/bin/sh

NETWORK_NAME=internal-net

docker network inspect $NETWORK_NAME >/dev/null 2>&1 || \
  docker network create --driver bridge $NETWORK_NAME && \
  echo "✅ Red '$NETWORK_NAME' OK" || \
  echo "ℹ️  Red '$NETWORK_NAME' Already exists"
