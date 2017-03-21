
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
    guess: (item, step) => {
        const statuses = item.tags
            .filter((tag) => tag.startsWith(`step:${step}:`))
            .map((tag) => tag.replace(`step:${step}:`, ""));

        const status = statuslib.select(statuses);

        if (status === "unknown" && item.refs.find((ref) => ref.name === step)) {
            return "ongoing";
        }

        return status;
    }
};

export default statuslib;
