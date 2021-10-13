
#!/bin/bash

export CURRENT_DIR=$(pwd)
export SOURCE=${CURRENT_DIR}/..
export TARGET=${SOURCE}/api-runner/target
export PROJECT_ID={project-id}
export MODULE=api-runner
export VERSION=1.0.0
export ENVIRONMENT=kube
export EXECUTABLE=api-runner-1.0.0-SNAPSHOT.jar
export MAIN=apiApiApplication
export PORT=8080
export JAVA_ARGS=""
export PROGRAM_ARGS=""

if [ -z ${APPLICA_CI_HOME+x} ]; then
    echo "[ERROR] Please set APPLICA_CI_HOME environment variable";
    exit 1
else
    echo APPLICA_CI_HOME=${APPLICA_CI_HOME};
fi

set -e

bash ${APPLICA_CI_HOME}/build-api.sh
bash ${APPLICA_CI_HOME}/test.sh
bash ${APPLICA_CI_HOME}/push.sh
bash ${APPLICA_CI_HOME}/cleanup.sh

kubectl apply -f ./kube
kubectl get pods