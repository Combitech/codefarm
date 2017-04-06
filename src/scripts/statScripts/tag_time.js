// TODO: What if end tags is never got? Then state is growing...

script: {
const debug = false;
const newdata = data.newdata;
const olddata = data.olddata;
const BEGIN_CG_TAGS = [ "review:approved:1", "review:skip" ];
const BEGIN_MERGE_TAGS = [ "merged" ];
const END_TAGS = [ "step:Build:success" ];
const newTags = newdata && newdata.tags;
const oldTags = olddata && olddata.tags;

if (!newTags) {
    logLines.push("No new tags");
    break script;
}

const hasAnyOf = (tags, tagsToCheckFor) =>
    tags.some((tag) => tagsToCheckFor.includes(tag))

// Match if newTags has any of tags, but oldTags doesn't
const gotAnyOf = (newTags, oldTags, tagsToCheckFor) =>
    hasAnyOf(newTags, tagsToCheckFor) &&
    (!oldTags || !hasAnyOf(oldTags, tagsToCheckFor));

const cgStarted = gotAnyOf(newTags, oldTags, BEGIN_CG_TAGS);
const mergeStarted = gotAnyOf(newTags, oldTags, BEGIN_MERGE_TAGS);
const ended = gotAnyOf(newTags, oldTags, END_TAGS);

// Nothing happened...
if (!(cgStarted || mergeStarted || ended)) {
    debug && logLines.push("Nothing happened");
    break script;
}

const state = Object.assign({}, data.state);
const id = data.event.typeId;
const nowTs = new Date();

let cgStartTs;
if (cgStarted) {
    cgStartTs = nowTs;
} else if (state[id] && state[id].cgStartTs) {
    cgStartTs = state[id].cgStartTs;
}

let mergeStartTs;
if (mergeStarted) {
    mergeStartTs = nowTs;
} else if (state[id] && state[id].mergeStartTs) {
    mergeStartTs = state[id].mergeStartTs;
}

if (ended) {
    value = {
        cgToEndTimeMs: moment(nowTs).diff(cgStartTs),
        cgToMergeTimeMs: moment(mergeStartTs).diff(cgStartTs),
        mergeToEndTimeMs: moment(nowTs).diff(mergeStartTs)
    };
    // Cleanup state
    delete state[id];
    nextState = state;
    if (!data.stat.fieldNames || data.stat.fieldNames.length === 0) {
        fieldNames = Object.keys(value);
    }
    debug && logLines.push("Ended");
} else {
    // Store state
    state[id] = state[id] || {};
    if (cgStarted) {
        state[id].cgStartTs = cgStartTs;
    }
    if (mergeStarted) {
        state[id].mergeStartTs = mergeStartTs;
    }
    nextState = state;
    debug && logLines.push("State stored: " + JSON.stringify(state));
}
}
