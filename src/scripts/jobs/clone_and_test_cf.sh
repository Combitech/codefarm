#!/bin/bash -e

echo "I'm running as user $USER in dir $PWD"
CLI="node --harmony_async_await ${PWD}/cli.js"
jobData=( $($CLI -q '$.job.name' -q '$.job.id' -q '$.job.baseline.content[?(@.name === "commits")].id[-1:]' --format values load_file ./data.json) )
echo Job name: ${jobData[0]}
jobId=${jobData[1]}
echo Job id: $jobId
revision=${jobData[2]}
echo I will do my work on revision $revision

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

###################
# LOCAL FUNCTIONS #
###################
function dowork() {
    work=$1
    name=$2
    script=$3
    targets=($4)
    exitcode=0

    echo "Now I will ${work} ${name}s"
    for target in ${targets[@]}; do
        result=0
        subjobname=${name}_${work}_${target} #For ex lib_build_web
        echo "Now I will ${work} ${name} ${target} (subjob ${subjobname})"
        subJobId=$($CLI -q '$._id' --format values create_subjob ${subjodname} ongoing)
        startTime=$(($(date +%s%N)/1000000))

        $script $target || result=1
        if [[ $result -eq 1 ]]; then
          echo "${subjobname} failed"
          $CLI update_subjob $subJobId -s fail --result $testDurationStr
          exitCode=1
        else
          echo "${subjobname} passed"
          $CLI update_subjob $subJobId -s success --result $testDurationStr
        fi
    done

    return $exitCode
}

#######################
# START OF BUILD/TEST #
#######################
source ${gitroot}ci/common.source #to get components, componenttests, libs and libstests

#jobRunId=$($CLI -q '$.lastRunId' --format values read_type exec.job $jobId)
echo Job run id: $jobRunId

targets="${libs[@]}"
dowork "build" "lib" $gitroot/ci/libs-build-dev.sh "$targets"

targets="${libtests[@]}"
dowork "test" "lib" $gitroot/ci/libs-test.sh "$targets" || echo "lib tests failed"

targets="${components[@]}"
dowork "build" "component" $gitroot/ci/components-build-dev.sh "$targets"

targets="${componenttests[@]}"
dowork "test" "component" $gitroot/ci/components-test.sh "$targets"
