#!/bin/bash -e

echo "I'm running as user $USER in dir $PWD"
CLI="node --harmony_async_await ${PWD}/cli.js"
jobData=( $($CLI -q '$.job.name' -q '$.job.id' -q '$.job.baseline.content[?(@.name === "commits")].id[-1:]' --format values load_file ./data.json) )
echo Job name: ${jobData[0]}
jobId=${jobData[1]}
echo Job id: $jobId
revision=${jobData[2]}

# Sanity check so we do not merge a non-pull request by accident
echo "Now I will find out if change is pull request or push to master"
res=( $($CLI -q '$.patches[-1:].pullreqnr' --format values read_type coderepo.revision $revision) )

if [[ "$pullreqnr" -gt "0" ]]; then
    echo "Verdict: Pull request"
else
    echo "Verdict: Push to master"
    echo "I will now cowardly refuse to merge a push to master (that is already merged)"
    exit 1
fi


echo "I will merge revision $revision"
$CLI -v --format jsonPretty merge_revision $revision

echo "Merge done"
