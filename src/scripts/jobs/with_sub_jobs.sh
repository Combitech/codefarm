#!/bin/bash

echo "I'm running as user $USER in dir $PWD"
CLI="node ${PWD}/cli.js"
jobData=( $($CLI -q '$.job.name' -q '$.job.id' --format values load_file ./data.json) )
jobId=${jobData[1]}
echo Job name: ${jobData[0]}
echo Job id: $jobId

jobRunId=$($CLI -q '$.lastRunId' --format values read_type exec.job $jobId)
echo Job run id: $jobRunId

numBuilds=5
buildIds=()
echo "Now I will create $numBuilds build sub-jobs"
for (( i=0; i<$numBuilds; i++ )); do
    echo "Start build job $i"
    subJobId=$($CLI -q '$._id' --format values create_subjob build "build_$i" ongoing)
    buildIds[$i]=$subJobId
done

sleep 1

for buildId in ${buildIds[@]}; do
    echo "End build job $buildId"
    $CLI update_subjob $buildId -s success
done

numTests=3
testIds=()
echo "Now I will create $numBuilds test sub-jobs"
for (( i=0; i<$numTests; i++ )); do
    echo "Start test job $i"
    subJobId=$($CLI -q '$._id' --format values create_subjob test "test_$i" ongoing)
    testIds[$i]=$subJobId
done

sleep 1

for testId in ${testIds[@]}; do
    echo "End test job $testId"
    $CLI update_subjob $testId -s success --result '{"timeMs":1000}'
done

echo "Upload artifact"
echo "Builds: ${buildIds[*]}" > artifact.txt
echo "Tests: ${testIds[*]}" >> artifact.txt
res=( $($CLI -q '$._id' -q '$.version' --format values create_artifact --file artifact.txt artifact1 repo1) )
echo "Uploaded artifact id: ${res[0]}"
echo "Uploaded artifact version: ${res[1]}"

echo "Now I will tag my job done"
tags=( $($CLI tag_type -q '$.tags[*]' --format values exec.job -t done_${jobRunId} $jobId) )
echo "Job tags: ${tags[*]}"

exit 0
