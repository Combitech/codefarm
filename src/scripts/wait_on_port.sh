#!/bin/bash

echo "Waiting for port $1"

until curl -s --output /dev/null localhost:$1; do
    sleep 0.1
done
