
import api from "api.io/api.io-client";
import { setCookie } from "./cookie";
import ActiveUser from "ui-observables/active_user";
import Notification from "ui-observables/notification";

const setCookies = (cookieList) => {
    if (cookieList) {
        for (const cookie of cookieList) {
            setCookie(cookie.name, cookie.value, cookie.opts);
        }
    }
};

const signin = async (email, password, debug = false) => {
    const response = await api.auth.login(email, password);
    debug && console.log("Sign in response", response);
    if (response.success) {
        setCookies(response.setCookies);
        ActiveUser.instance.setUser(response.user);
        Notification.instance.publish(`Welcome ${response.user.username}!`);
    } else {
        ActiveUser.instance.setUser();
        const msg = response.message ? `Sign in failed: ${response.message}` : "Sign in failed";
        Notification.instance.publish(msg, "warning");
    }

    return response;
};

const signout = async (debug = false) => {
    const response = await api.auth.logout();
    debug && console.log("Sign out response", response);
    if (response.success) {
        // Set cookie
        if (response.setCookies) {
            for (const cookie of response.setCookies) {
                setCookie(cookie.name, cookie.value, cookie.opts);
            }
        }
        ActiveUser.instance.setUser();
        Notification.instance.publish(`Goodbye ${response.user.username}!`);
    } else {
        const msg = response.message ? `Sign out failed: ${response.message}` : "Sign out failed";
        Notification.instance.publish(msg, "warning");
    }

    return response;
};

const whoami = async(isInitialSync = false, debug = false) => {
    const response = await api.auth.whoami();
    debug && console.log("whoami response", response);

    if (isInitialSync) {
        if (response.success) {
            setCookies(response.setCookies);
            Notification.instance.publish(`Welcome ${response.user.username}!`);
        } else {
            const msg = response.message ? `Sign in failed: ${response.message}` : "Sign in failed";
            Notification.instance.publish(msg, "warning");
        }
    }

    return response;
};

const setPassword = async (userId, oldPassword, newPassword, debug = false) => {
    // Check that we are changing for active user
    const activeUserId = ActiveUser.instance.user.getValue().get("id");
    if (userId !== activeUserId) {
        throw new Error(`User ${activeUserId} isn't signed in!`);
    }

    let errorMsg;
    let user;
    try {
        const data = {
            oldPassword: oldPassword,
            password: newPassword
        };
        user = await api.rest.action("userrepo.user", userId, "setpassword", data);
        debug && console.log("Set password response", user);
        if (user) {
            Notification.instance.publish(`Password updated for user ${user._id}`);
        } else {
            errorMsg = `Failed to update password for user ${userId}`;
        }
    } catch (error) {
        console.error("Failed to update password", error.message);
        errorMsg = `Failed to update password for user ${userId}: ${error.message}`;
    }

    if (errorMsg) {
        Notification.instance.publish(errorMsg, "warning");
    }

    return user;
};

export {
    signin,
    signout,
    whoami,
    setPassword
};
