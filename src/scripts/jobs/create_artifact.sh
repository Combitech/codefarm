#!/bin/bash
echo I will create an artifact
echo "my first artifact" > artifact.txt
res=( $(node --harmony_async_await ./cli.js -q '$._id' -q '$.version' --format values create_artifact --file artifact.txt -t testTag1 artifact1 repo1) )
echo Uploaded artifact id: ${res[0]}
echo Uploaded artifact version: ${res[1]}
exit 0
