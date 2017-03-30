
import api from "api.io/api.io-client";
import ActiveUser from "ui-observables/active_user";
import Notification from "ui-observables/notification";
import { assertType } from "misc";

const createClaim = async (claim, targetRef) => {
    assertType(claim.text, "claim.text", "string");
    assertType(targetRef.id, "targetRef._id", "string");
    assertType(targetRef.type, "targetRef.type", "string");

    const signedInUser = ActiveUser.instance.user.getValue().toJS();

    const claimData = Object.assign({
        targetRef: {
            _ref: true,
            id: targetRef.id,
            type: targetRef.type
        },
        creatorRef: {
            _ref: true,
            name: signedInUser.username,
            type: "userrepo.user",
            id: signedInUser.id
        }
    }, claim);

    try {
        await api.rest.post("metadata.claim", claimData);
        Notification.instance.publish("Claim added successfully!");
    } catch (error) {
        Notification.instance.publish(`Failed to publish claim: ${error.message || error}`, "warning");
        console.error("claim failed", error);
    }
};

const removeClaim = async (id) => {
    assertType(id, "id", "string");

    try {
        await api.rest.remove("metadata.claim", id);
        Notification.instance.publish("Claim removed successfully!");
    } catch (error) {
        Notification.instance.publish(`Failed to remove claim: ${error.message || error}`, "warning");
        console.error("unclaim failed", error);
    }
};

export {
    createClaim,
    removeClaim
};
