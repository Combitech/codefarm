#!/bin/bash

#
# This job will parses the commit message:
# DELAY:T - Job will wait T seconds before exit
# RESULT:FAIL - Job will fail
# GERRIT_CODE_REV:PLUS2 - Set +2 to change in gerrit
#

echo "I'm running as user $USER in dir $PWD"
CLI="node --harmony_async_await ${PWD}/cli.js"
jobData=( $($CLI -q '$.job.name' -q '$.job.id' -q '$.job.baseline.content[?(@.name === "commits")].id[-1:]' --format values load_file ./data.json) )
jobName=${jobData[0]}
jobId=${jobData[1]}
revision=${jobData[2]}
echo Job name: ${jobName}
echo Job id: $jobId
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
commitMsg=$(git log -n 1)

# Parse DELAY:T and sleep accordingly
delaySeconds=$(echo $commitMsg|grep DELAY:|cut -d':' -f2|cut -d' ' -f1)
if [[ ! -z "${delaySeconds}" ]]; then
    echo "I will delay myself ${delaySeconds} seconds"
    sleep ${delaySeconds}
fi

# Parse RESULT:FAIL and exit accordingly
numFailStrMatch=$(echo $commitMsg|grep RESULT:FAIL|wc -l)
exitStatus=0
if [ "${numFailStrMatch}" -gt "0" ]; then
    exitStatus=1
fi

# Parse GERRIT_CODE_REV:PLUS2 and exit accordingly
numGerritPlus2StrMatch=$(echo $commitMsg|grep GERRIT_CODE_REV:PLUS2|wc -l)
if [ "${numGerritPlus2StrMatch}" -gt "0" ]; then
    changeAndPatch=$(echo $refname|cut -d'/' -f4-|tr / ,)
    echo "I will add code-review +2 to change $changeAndPatch"
    ssh -p 29418 $USER@localhost gerrit review $changeAndPatch --code-review '+2'
fi

echo "I will exit with status ${exitStatus}"

exit ${exitStatus}
