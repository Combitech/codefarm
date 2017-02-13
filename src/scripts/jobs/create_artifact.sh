#!/bin/bash
echo "I'm running as user $USER in dir $PWD"
CLI="node --harmony_async_await ${PWD}/cli.js"
jobData=( $($CLI -q '$.job.name' -q '$.job.id' -q '$.job.baseline.content[?(@.name === "commits")].id[-1:]' --format values load_file ./data.json) )
jobName=${jobData[0]}
jobId=${jobData[1]}
revision=${jobData[2]}
echo Job name: ${jobName}
echo Job id: $jobId
echo I will clone revision $revision

echo "I'm an artifact built by ${jobId} from revision ${revision}" > artifact.txt
res=( $(node --harmony_async_await ./cli.js -q '$._id' -q '$.version' --format values create_artifact --file artifact.txt -t testTag1 artifact1 repo1) )
echo Uploaded artifact id: ${res[0]}
echo Uploaded artifact version: ${res[1]}

exit 0
