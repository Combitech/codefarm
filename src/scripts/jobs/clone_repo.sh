#!/bin/bash

echo "I'm running as user $USER in dir $PWD"
CLI="node ${PWD}/cli.js"
jobData=( $($CLI -q '$.job.name' -q '$.job.id' -q '$.job.baseline.content[?(@.name === "commits")].id[-1:]' --format values load_file ./data.json) )
echo Job name: ${jobData[0]}
jobId=${jobData[1]}
echo Job id: $jobId
revision=${jobData[2]}
echo I will clone revision $revision

res=( $($CLI -q '$.repository' -q '$.patches[-1:].change.newrev' -q '$.patches[-1:].change.refname' --format values read_type coderepo.revision $revision) )
repositoryId=${res[0]}
commit=${res[1]}
refname=${res[2]}
echo "Repository id: $repositoryId"

repoUriTemplate=$($CLI --format raw read_type --getter uri coderepo.repository $repositoryId)
echo "Repo URI: $repoUriTemplate"
repoUri=$(echo "$repoUriTemplate"|sed "s/\$USER/$USER/")

echo "Now I will clone repository using $repoUri"
git clone $repoUri
cd $repositoryId
echo "Now I will fetch $refname"
git fetch origin $refname
echo "Now I will checkout commit $commit at FETCH_HEAD"
git checkout FETCH_HEAD
git log -n 1
ls

echo "Now I will tag my job with extra tags"
tags=( $($CLI tag_type -q '$.tags[*]' --format values exec.job -t "git_sha:${commit}" -t "repo:${repositoryId}" $jobId) )
echo "Job tags: ${tags[*]}"

exit 0
