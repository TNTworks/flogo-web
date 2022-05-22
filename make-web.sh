#!/bin/bash

load_tags() {
	while IFS='=' read -r key value || [ -n "$key" ]; do
    eval "existing=\"\${$key}\""
    if [ -z "$existing" ]; then
      eval export "$key='${value}'";
    fi
	done < $1
}

if [ -f ".build_tags" ]; then
  load_tags ".build_tags"
fi

readonly RELEASE_VERSION=${RELEASE_VERSION:-latest}
readonly CLI_VERSION=${CLI_VERSION:-master}
readonly CORE_VERSION=${CORE_VERSION:-master}

export BUILD_ARGS="--build-arg CLI_VERSION=${CLI_VERSION} --build-arg CORE_VERSION=${CORE_VERSION} --build-arg RELEASE_VERSION=${RELEASE_VERSION}"

echo "RELEASE_VERSION=$RELEASE_VERSION | CLI_VERSION=$CLI_VERSION | CORE_VERSION=$CORE_VERSION"

docker build ${BUILD_ARGS} --force-rm=true --rm=true -t flogo/flogo-web:${RELEASE_VERSION} -f tools/docker/Dockerfile .

if [ "$1" == "--build-ml" ]; then
  docker build ${BUILD_ARGS} --force-rm=true --rm=true -t flogo/flogo-web:${RELEASE_VERSION}-ml -f tools/docker/ml.Dockerfile .
fi
