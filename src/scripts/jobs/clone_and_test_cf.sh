#!/bin/bash

echo "I'm running as user $USER in dir $PWD"
CLI="node --harmony_async_await ${PWD}/cli.js"
jobData=( $($CLI -q '$.job.name' -q '$.job.id' -q '$.job.baseline.content[?(@.name === "commits")].id[-1:]' --format values load_file ./data.json) )
echo Job name: ${jobData[0]}
jobId=${jobData[1]}
echo Job id: $jobId
revision=${jobData[2]}
echo I will clone revision $revision

res=( $($CLI -q '$.repository' -q '$.patches[-1:].change.newrev' -q '$.patches[-1:].change.refname' -q '$.patches[-1:].pullreqnr' --format values read_type coderepo.revision $revision) )
repositoryId=${res[0]}
commit=${res[1]}
refname=${res[2])}
pullreqnr=${res[3]}
echo "Repository id: $repositoryId"

repoUriTemplate=$($CLI --format raw read_type --getter uri coderepo.repository $repositoryId)
echo "Repo URI: $repoUriTemplate"
repoUri=$(echo "$repoUriTemplate"|sed "s/\$USER/$USER/")

echo "Now I will clone repository using $repoUri"

git clone $repoUri
cd $repositoryId
echo "I am now inside repository $repositoryId"

echo "Now I will find out if change is pull request or push to master"
echo "pull req nr: $pullreqnr"
if [[ "$pullreqnr" -gt "0" ]]; then
    echo "Verdict: Pull request"
    echo "Now I will fetch pull request"
    git fetch origin pull/$pullreqnr/head:pull_request_$pullreqnr
else
    echo "Verdict: Push to master"
fi

echo "Now I will checkout commit as test branch"
git checkout -b testbranch $commit
git log -n 1
ls

echo "Now I will tag my job with extra tags"
tags=( $($CLI tag_type -q '$.tags[*]' --format values exec.job -t "git_sha:${commit}" -t "repo:${repositoryId}" $jobId) )
echo "Job tags: ${tags[*]}"

#################
# START OF TEST #
#################
echo "Now I will test the components"

components=(Exec LogRepo)
exitCode=0

jobRunId=$($CLI -q '$.lastRunId' --format values read_type exec.job $jobId)
echo Job run id: $jobRunId

for testId in ${components[@]}; do
    echo "Now I will create a subjob to test component $testId"
    pushd src/app/$testId
    subJobId=$($CLI -q '$._id' --format values create_subjob test "test_$testId" ongoing)
    yarn

    yarn test

    if [[ $? -ne 0 ]]; then
      echo "Test of $testId failed"
      $CLI update_subjob $subJobId -s fail --result '{"timeMs":1000}'
      exitCode=1
    else
      $CLI update_subjob $subJobId -s success --result '{"timeMs":1000}'
    fi
    popd
done

 echo "Now I will tag my job done"
tags=( $($CLI tag_type -q '$.tags[*]' --format values exec.job -t done_${jobRunId} $jobId) )
echo "Job tags: ${tags[*]}"

exit $exitCode
