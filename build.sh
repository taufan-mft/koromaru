#!/bin/bash

docker build --progress plain -t registry.gitlab.com/taufanderazor/koromaru:be-latest -f ./Dockerfile --platform linux/amd64 .
docker push registry.gitlab.com/taufanderazor/koromaru:be-latest