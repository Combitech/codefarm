script: {
const newdata = data.newdata;
const olddata = data.olddata;
const newStatus = newdata && newdata.status;
const oldStatus = olddata && olddata.status;

if (newStatus === "submitted" && oldStatus !== "submitted") {
    value = value || {};
    value.submitted = new Date(newdata.statusSetAt);
} else if (newStatus === "merged" && oldStatus !== "merged") {
    value = value || {};
    value.merged = new Date(newdata.statusSetAt);
} else if (newStatus === "abandoned" && oldStatus !== "abandoned") {
    value = value || {};
    value.abandoned = new Date(newdata.statusSetAt);
}

logLines.push("value: " + JSON.stringify(value));
logLines.push("event: " + JSON.stringify(data.event, null, 2));

if (!data.stat.fieldNames || data.stat.fieldNames.length === 0) {
    fieldNames = [ "submitted", "merged", "abandoned" ];
}
}
