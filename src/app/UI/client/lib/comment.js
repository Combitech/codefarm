
import api from "api.io/api.io-client";
import ActiveUser from "ui-observables/active_user";
import Notification from "ui-observables/notification";
import { assertType } from "misc";

const createComment = async (comment, targetTypeInstance) => {
    assertType(comment.text, "claim.text", "string");
    assertType(targetTypeInstance._id, "targetTypeInstance._id", "string");
    assertType(targetTypeInstance.type, "targetTypeInstance.type", "string");

    const signedInUser = ActiveUser.instance.user.getValue().toJS();

    const commentData = Object.assign({
        targetRef: {
            _ref: true,
            id: targetTypeInstance._id,
            type: targetTypeInstance.type
        },
        creatorRef: {
            _ref: true,
            name: signedInUser.username,
            type: "userrepo.user",
            id: signedInUser.id
        }
    }, comment);
    try {
        const createdComment = await api.rest.post("metadata.comment", commentData);
        if (createdComment) {
            const commentRef = {
                _ref: true,
                id: createdComment._id,
                type: createdComment.type
            };
            await api.rest.action(targetTypeInstance.type, targetTypeInstance._id, "comment", commentRef);
            Notification.instance.publish("Comment added successfully!");
        }
    } catch (error) {
        Notification.instance.publish(`Failed to publish comment: ${error.message || error}`, "warning");
        console.error("comment failed", error);
    }
};

export {
    createComment
};
