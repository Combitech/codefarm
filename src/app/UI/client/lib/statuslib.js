
import statusText from "./status_text";

const statuslib = {
    select: (statuses) => {
        for (const status of Object.keys(statusText)) {
            if (statuses.includes(status)) {
                return status;
            }
        }

        return "unknown";
    },
    fromTags: (tags, step) => {
        const statuses = tags
            .filter((tag) => tag.startsWith(`step:${step}:`))
            .map((tag) => tag.replace(`step:${step}:`, ""));

        return statuslib.select(statuses);
    },
    mood: (statuses) => {
        if (statuses.includes("fail") || statuses.includes("aborted")) {
            return "unhappy";
        } else if (statuses.includes("unknown") || statuses.includes("allocated") || statuses.includes("queued") || statuses.includes("ongoing")) {
            return "neutral";
        } else if (statuses.includes("success") || statuses.includes("skip")) {
            return "happy";
        }

        return "neutral";
    }
};

export default statuslib;
