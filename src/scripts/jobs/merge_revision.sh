#!/bin/bash -e

echo "Doing merge"

echo "I'm running as user $USER in dir $PWD"
CLI="node ${PWD}/cli.js"
jobData=( $($CLI -q '$.job.name' -q '$.job.id' -q '$.job.baseline.content[?(@.name === "commits")].id[-1:]' --format values load_file ./data.json) )
echo Job name: ${jobData[0]}
jobId=${jobData[1]}
echo Job id: $jobId
revision=${jobData[2]}
echo I will merge revision $revision

res=( $($CLI -q '$.repository' -q '$.patches[-1:].change.newrev' -q '$.patches[-1:].change.refname' --format values read_type coderepo.revision $revision) )
repositoryId=${res[0]}
commit=${res[1]}
refname=${res[2]}

changeAndPatch=$(echo $refname|cut -d'/' -f4-|tr / ,)
echo "I will add code-review +2 to change $changeAndPatch"
ssh -p 29418 $USER@localhost gerrit review $changeAndPatch --code-review '+2'

$CLI -v --format jsonPretty merge_revision $revision

echo "Merge done"
