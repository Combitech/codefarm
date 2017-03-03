
const clock = [
    "/Cheser/extras/255x255/status/status-clock-face.png",
    "/Cheser/extras/255x255/status/status-clock-large.png",
    "/Cheser/extras/255x255/status/status-clock-small.png",
    "/Cheser/extras/255x255/status/status-clock-face-center.png"
];

const statusIcons = {
    unknown: [ "/Cheser/extras/255x255/status/status-unknown.png" ],
    queued: clock,
    allocated: clock,
    ongoing: clock,
    success: [ "/Cheser/extras/255x255/status/status-success.png" ],
    aborted: [ "/Cheser/extras/255x255/status/status-aborted.png" ],
    fail: [ "/Cheser/extras/255x255/status/status-fail.png" ],
    skip: [ "/Cheser/extras/255x255/status/status-skip.png" ],
    neutral: [ "/Cheser/extras/255x255/status/status-neutral.png" ],
    happy: [ "/Cheser/extras/255x255/status/status-happy.png" ],
    unhappy: [ "/Cheser/extras/255x255/status/status-unhappy.png" ],
    shadow: [ "/Cheser/extras/255x255/status/status-shadow.png" ],
    approved: [ "/Cheser/extras/255x255/status/status-happy.png" ],
    rejected: [ "/Cheser/extras/255x255/status/status-unhappy.png" ]
};

export default statusIcons;
