const newdata = data.newdata;
const olddata = data.olddata;
if (newdata.started && newdata.finished && olddata.finished === false) {
    // Update event where job is finished
    const queueTimeMs = moment(newdata.started).diff(newdata.created);
    const execTimeMs = moment(newdata.finished).diff(newdata.started);
    value = {
        queueTimeMs,
        execTimeMs
    };
}
