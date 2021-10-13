#!/bin/bash

docker rmi eu.gcr.io/nofire/drax-manager-admin:0.1
docker rmi eu.gcr.io/nofire/drax-manager-api:0.1
docker rmi eu.gcr.io/nofire/drax-protocol-atplus:0.1
docker rmi eu.gcr.io/nofire/drax-protocol-icon:0.1
docker rmi eu.gcr.io/nofire/drax-protocol-fake:0.1
docker rmi eu.gcr.io/nofire/drax-cassandra:0.1
docker rmi eu.gcr.io/nofire/drax-core-runner:0.1