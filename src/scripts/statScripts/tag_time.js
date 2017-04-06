// TODO: What if end tags is never got? Then state is growing...

script: {
const debug = false;
const newdata = data.newdata;
const olddata = data.olddata;
const BEGIN_CG_TAGS = [ "review:approved:1", "review:skip" ];
const MERGE_DONE_TAGS = [ "merged" ];
const END_TAGS = [
    "step:Build:success",
    "step:Regression:success",
    "step:Lint:success",
    "step:Deliver:success"
];
const newTags = newdata && newdata.tags;
const oldTags = olddata && olddata.tags;

if (!newTags) {
    logLines.push("No new tags");
    break script;
}

const hasAnyOf = (tags, tagsToCheckFor) =>
    tagsToCheckFor.some((tag) => tags.includes(tag))

const hasAllOf = (tags, tagsToCheckFor) =>
    tagsToCheckFor.every((tag) => tags.includes(tag))

// Match if newTags has any of tags, but oldTags doesn't
const gotAnyOf = (newTags, oldTags, tagsToCheckFor) =>
    hasAnyOf(newTags, tagsToCheckFor) &&
    (!oldTags || !hasAnyOf(oldTags, tagsToCheckFor));

const gotAllOf = (newTags, oldTags, tagsToCheckFor) =>
    hasAllOf(newTags, tagsToCheckFor) &&
    (!oldTags || !hasAllOf(oldTags, tagsToCheckFor));

const cgStarted = gotAnyOf(newTags, oldTags, BEGIN_CG_TAGS);
const mergeDone = gotAnyOf(newTags, oldTags, MERGE_DONE_TAGS);
const ended = gotAllOf(newTags, oldTags, END_TAGS);

// Nothing happened...
if (!(cgStarted || mergeDone || ended)) {
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

let mergeDoneTs;
if (mergeDone) {
    mergeDoneTs = nowTs;
} else if (state[id] && state[id].mergeDoneTs) {
    mergeDoneTs = state[id].mergeDoneTs;
}

if (ended) {
    value = {};
    if (cgStartTs) {
        value.cgToEndTimeMs = moment(nowTs).diff(cgStartTs);
    }
    if (mergeDoneTs && cgStartTs) {
        value.cgToEndTimeMs = moment(mergeDoneTs).diff(cgStartTs);
    }
    if (mergeDoneTs) {
        value.mergeToEndTimeMs = moment(nowTs).diff(mergeDoneTs);
    }
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
    if (mergeDone) {
        state[id].mergeDoneTs = mergeDoneTs;
    }
    nextState = state;
    debug && logLines.push("State stored: " + JSON.stringify(state));
}
}
